"""Compose the two offline experiments. This is not an API or a bank adapter.

Trip confirmation/completion remain fixtures. Payment execution capability is
used as a synthetic money-movement gate; it is not a production payout policy.
"""
from dataclasses import replace
from datetime import datetime, timedelta, timezone
import unittest

from tools.simulation.finance import PaymentExperiment, Terms, allocation
from tools.simulation.role_capability import Request, Receipt, Simulation, digest


class FinanceFlowTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 15, 12, tzinfo=timezone.utc)
        self.policy = Simulation()
        self.payment = PaymentExperiment(Terms(5000))

    def request(self, resource, amount):
        return Request("synthetic-executor", "finance_executor", "finance.payment.execute",
                       "payment:" + resource, "execute", amount_minor=amount,
                       beneficiary="synthetic-driver")

    def receipt(self, request, nonce):
        return Receipt(digest(request), "synthetic-founder",
                       self.now + timedelta(minutes=5), nonce)

    def gated_payout(self, request, receipt=None):
        # Compose immutable expected transaction data with both experiments.
        # Reject mismatches before consuming an approval. No real dispatch.
        expected = self.request("synthetic-payout", allocation(self.payment.terms, self.payment.refunded)["driver_due"])
        if (request.resource, request.amount_minor, request.beneficiary) != (
                expected.resource, expected.amount_minor, expected.beneficiary):
            return "DENY_TRANSACTION_MISMATCH"
        event = self.policy.evaluate(request, self.now, receipt)
        if event["decision"] != "ALLOW":
            return event["decision"]
        return self.payment.payout(weekly_cycle=True, review=True)

    def test_confirm_capture_complete_settle_and_audit(self):
        self.assertEqual("DENY_UNCONFIRMED", self.payment.capture())
        self.payment.confirmed = True
        self.assertEqual("SIMULATED_CAPTURE", self.payment.capture())
        self.assertEqual("DUPLICATE_NO_CHANGE", self.payment.capture())
        self.payment.completed = True
        request = self.request("synthetic-payout", 4000)
        self.assertEqual("PENDING_APPROVAL", self.gated_payout(request))
        receipt = self.receipt(request, "synthetic-once")
        self.assertEqual("SIMULATED_PAYOUT", self.gated_payout(request, receipt))
        self.assertEqual("DENY", self.gated_payout(request, receipt))
        self.assertEqual(4000, self.payment.paid)
        self.assertEqual(900, allocation(self.payment.terms)["platform_after_processing"])
        audit = Request("synthetic-auditor", "auditor", "audit.events.read", "audit:synthetic-payment", "read")
        self.assertEqual("ALLOW", self.policy.evaluate(audit, self.now)["decision"])
        self.assertTrue(all(not e["can_dispatch"] for e in self.policy.events + self.payment.events))

    def test_admin_auditor_and_invalid_approval_do_not_move_balance(self):
        self.payment.confirmed = True
        self.payment.capture()
        self.payment.completed = True
        request = self.request("synthetic-payout", 4000)
        for role in ("admin", "auditor", "driver", "founder"):
            modified = replace(request, role=role)
            self.assertEqual("DENY", self.gated_payout(modified, self.receipt(modified, role)))
        receipt = self.receipt(request, "synthetic-test")
        for invalid in (replace(receipt, expires_at=self.now),
                        replace(receipt, approver=request.actor),
                        replace(receipt, request_digest="incorrect")):
            self.assertEqual("DENY", self.gated_payout(request, invalid))
        self.assertEqual(0, self.payment.paid)

    def test_refund_before_settlement_invalidates_previous_transaction(self):
        self.payment.confirmed = True
        self.payment.capture()
        original = self.request("synthetic-payout", 4000)
        original_receipt = self.receipt(original, "synthetic-original")
        self.assertEqual("PENDING_REVIEW", self.payment.refund("synthetic-r", 1000))
        self.assertEqual("SIMULATED_REFUND", self.payment.refund("synthetic-r", 1000, True))
        self.assertEqual("DUPLICATE_NO_CHANGE", self.payment.refund("synthetic-r", 1000, True))
        self.payment.completed = True
        self.assertEqual("DENY_TRANSACTION_MISMATCH", self.gated_payout(original, original_receipt))
        updated = self.request("synthetic-payout", 3200)
        self.assertEqual("DENY", self.gated_payout(updated, original_receipt))
        self.assertEqual("SIMULATED_PAYOUT", self.gated_payout(updated, self.receipt(updated, "synthetic-updated")))
        result = allocation(self.payment.terms, self.payment.refunded)
        self.assertEqual((1000, 800, 3200, 700), (self.payment.refunded, result["commission"], self.payment.paid,
                                               result["platform_after_processing"]))
        self.assertTrue(result["balanced"])

    def test_refund_after_settlement_requires_separate_recovery(self):
        self.payment.confirmed = True
        self.payment.capture()
        self.payment.completed = True
        request = self.request("synthetic-payout", 4000)
        self.gated_payout(request, self.receipt(request, "synthetic-paid"))
        self.assertEqual("BLOCKED_POST_PAYOUT_RECOVERY", self.payment.refund("synthetic-late", 1000, True))
        self.assertEqual((4000, 0), (self.payment.paid, self.payment.refunded))


if __name__ == "__main__":
    unittest.main()
