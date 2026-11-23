"""Financial invariants and failure cases; no live financial integration."""
from dataclasses import replace
import unittest
from unittest.mock import patch

from tools.simulation.finance import Terms, allocation, PaymentExperiment, run


class FinanceTests(unittest.TestCase):
    def test_commission_comparison(self):
        for rate, commission, driver, platform in ((1500, 750, 4250, 650),
                                                  (2000, 1000, 4000, 900),
                                                  (2500, 1250, 3750, 1150)):
            result = allocation(Terms(5000, commission_bps=rate))
            self.assertEqual((commission, driver, platform),
                             (result["commission"], result["driver_due"], result["platform_after_processing"]))

    def test_extras_are_not_commissioned_but_processing_covers_total(self):
        result = allocation(Terms(10000, tip=500, expenses=1000))
        self.assertEqual(2000, result["commission"])
        self.assertEqual(9500, result["driver_due"])
        self.assertEqual(198, result["provider_fee_assumed_nonrefundable"])
        self.assertTrue(result["balanced"])

    def test_rounding_and_incremental_refunds_conserve_cents(self):
        for base in range(1, 301):
            terms = Terms(base, commission_bps=1500)
            for refund in (0, base // 2, base):
                result = allocation(terms, refund)
                self.assertTrue(result["balanced"])
                self.assertGreaterEqual(result["driver_due"], 0)
                self.assertEqual(base - refund, result["driver_due"] + result["commission"])
        payment = PaymentExperiment(Terms(101))
        payment.confirmed = True
        payment.capture()
        for i in range(101):
            self.assertEqual("SIMULATED_REFUND", payment.refund(str(i), 1, True))
        self.assertEqual(0, allocation(payment.terms, payment.refunded)["commission"])

    def test_full_refund_keeps_assumed_processing_loss_visible(self):
        result = allocation(Terms(5000), 5000)
        self.assertEqual(0, result["driver_due"])
        self.assertEqual(0, result["commission"])
        self.assertEqual(-100, result["platform_after_processing"])

    def test_refund_retries_and_changed_payload_do_not_change_balance(self):
        payment = PaymentExperiment(Terms(5000))
        self.assertEqual("DENY_REFUND", payment.refund("before", 100, True))
        payment.confirmed = True
        payment.capture()
        self.assertEqual("PENDING_REVIEW", payment.refund("r", 100))
        self.assertEqual(0, payment.refunded)
        payment.refund("r", 100, True)
        self.assertEqual("DUPLICATE_NO_CHANGE", payment.refund("r", 100, True))
        self.assertEqual("DENY_KEY_CONFLICT", payment.refund("r", 200, True))
        self.assertEqual(100, payment.refunded)

    def test_settlement_requires_all_conditions_and_never_pays_twice(self):
        payment = PaymentExperiment(Terms(5000))
        self.assertEqual("PENDING_PREREQUISITES", payment.payout(True, True))
        payment.confirmed = True
        payment.capture()
        self.assertEqual("PENDING_PREREQUISITES", payment.payout(True, True))
        payment.completed = True
        self.assertEqual("PENDING_PREREQUISITES", payment.payout(True, False))
        self.assertEqual("SIMULATED_PAYOUT", payment.payout(True, True))
        self.assertEqual(4000, payment.paid)
        self.assertEqual("DUPLICATE_OR_ZERO_NO_CHANGE", payment.payout(True, True))
        self.assertEqual("BLOCKED_POST_PAYOUT_RECOVERY", payment.refund("late", 100, True))
        self.assertEqual((4000, 0), (payment.paid, payment.refunded))

    def test_own_fleet_has_no_external_commission_or_payout(self):
        terms = Terms(5000, tip=500, expenses=1000, fleet="own", operating_cost=3000)
        result = allocation(terms)
        self.assertEqual(0, result["commission"])
        self.assertEqual(0, result["driver_due"])
        self.assertEqual(1500, result["own_tip_expense_reserve"])
        self.assertEqual(1877, result["platform_after_supplied_cost"])
        self.assertEqual("NOT_EXTERNAL", PaymentExperiment(terms).payout(True, True))
        self.assertIsNone(allocation(replace(terms, operating_cost=None))["platform_after_supplied_cost"])

    def test_invalid_money_and_rates(self):
        for kwargs in ({"base": True}, {"base": 0}, {"tip": -1}, {"expenses": 1.5},
                       {"commission_bps": 10001}, {"fee_bps": -1}, {"fleet": "unknown"}):
            with self.assertRaises(ValueError):
                Terms(**({"base": 5000} | kwargs))

    def test_scenarios_pure_and_deterministic(self):
        with patch("builtins.open", side_effect=AssertionError("file")), \
             patch("socket.socket", side_effect=AssertionError("network")), \
             patch("subprocess.Popen", side_effect=AssertionError("process")):
            result = run()
            self.assertEqual(result, run())
        self.assertEqual(0, result["failed"])
        self.assertFalse(result["can_dispatch"])


if __name__ == "__main__":
    unittest.main()
