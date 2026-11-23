"""Independent isolation regressions for the offline architecture experiment."""
from dataclasses import replace
from datetime import datetime, timedelta, timezone
import unittest
from unittest.mock import patch

from tools.simulation.role_capability import Request, Receipt, Simulation, digest, run_scenarios


class RoleSimulationTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 15, 12, tzinfo=timezone.utc)
        self.sim = Simulation()

    def test_visibility_and_model_do_not_grant_authority(self):
        for role in ("user", "business", "driver", "dispatch", "admin", "expert", "control_tower", "founder", "auditor"):
            request = Request("synthetic-actor", role, "finance.payment.execute",
                              "payment:synthetic-test", "execute", amount_minor=100,
                              beneficiary="synthetic-beneficiary")
            for model in ("kimi-k2", "devstral", "chatgpt"):
                event = self.sim.evaluate(replace(request, model=model), self.now)
                self.assertEqual("DENY", event["decision"])
                self.assertFalse(event["can_dispatch"])

    def test_customer_and_driver_cannot_access_each_others_resources(self):
        requests = [
            Request("a", "user", "ride.view.own", "ride:test", "read", owner="b"),
            Request("a", "driver", "driver.job.accept", "ride:test", "accept", assigned_driver="b"),
            Request("a", "business", "driver.job.accept", "ride:test", "accept", assigned_driver="a"),
        ]
        for request in requests:
            self.assertEqual("DENY", self.sim.evaluate(request, self.now)["decision"])

    def test_dispatch_can_assign_but_auditor_cannot_mutate(self):
        request = Request("a", "dispatch", "dispatch.job.assign", "ride:test", "assign")
        self.assertEqual("ALLOW", self.sim.evaluate(request, self.now)["decision"])
        self.assertEqual("DENY", self.sim.evaluate(replace(request, role="auditor"), self.now)["decision"])
        audit = Request("a", "auditor", "audit.events.read", "audit:test", "read")
        self.assertEqual("ALLOW", self.sim.evaluate(audit, self.now)["decision"])
        self.assertEqual("DENY", self.sim.evaluate(replace(audit, operation="delete"), self.now)["decision"])

    def test_approval_binds_exact_transaction_and_is_consumed_once(self):
        request = Request("executor", "finance_executor", "finance.payment.execute",
                          "payment:test", "execute", amount_minor=100, beneficiary="synthetic-a")
        receipt = Receipt(digest(request), "synthetic-founder", self.now + timedelta(minutes=1), "once")
        for modified in (replace(request, amount_minor=200), replace(request, beneficiary="synthetic-b"),
                         replace(request, actor="other"), replace(request, resource="payment:other")):
            self.assertEqual("DENY", self.sim.evaluate(modified, self.now, receipt)["decision"])
        self.assertEqual("ALLOW", self.sim.evaluate(request, self.now, receipt)["decision"])
        self.assertEqual("DENY", self.sim.evaluate(request, self.now, receipt)["decision"])

    def test_every_decision_emits_synthetic_trace(self):
        request = Request("a", "unknown", "unknown", "ride:test", "read")
        event = self.sim.evaluate(request, self.now)
        self.assertEqual([event], self.sim.events)
        self.assertEqual("SYNTHETIC", event["evidence_kind"])
        self.assertTrue(event["simulation_only"])
        self.assertEqual(digest(request), event["request_digest"])
        self.assertFalse(event["can_dispatch"])

    def test_financial_amounts_and_beneficiary_fail_closed(self):
        request = Request("executor", "finance_executor", "finance.payment.execute",
                          "payment:test", "execute", amount_minor=100, beneficiary="synthetic-a")
        for amount in (0, -1, True, 1.5, float("nan"), float("inf"), "100", None):
            event = self.sim.evaluate(replace(request, amount_minor=amount), self.now)
            self.assertEqual("DENY", event["decision"])
            self.assertEqual("TRANSACTION_INCOMPLETE", event["reason"])
        for beneficiary in ("", "   ", None):
            self.assertEqual("DENY", self.sim.evaluate(replace(request, beneficiary=beneficiary), self.now)["decision"])

    def test_preparing_and_approving_never_execute_payment(self):
        prepare = Request("synthetic-founder", "founder", "finance.payment.prepare",
                          "payment:test", "prepare", amount_minor=100, beneficiary="synthetic-a")
        self.assertEqual("ALLOW", self.sim.evaluate(prepare, self.now)["decision"])
        approve = replace(prepare, capability="finance.payment.approve", operation="approve")
        self.assertEqual("PENDING_APPROVAL", self.sim.evaluate(approve, self.now)["decision"])
        execute = replace(prepare, actor="executor", role="finance_executor",
                          capability="finance.payment.execute", operation="execute")
        self.assertEqual("PENDING_APPROVAL", self.sim.evaluate(execute, self.now)["decision"])
        wrong_receipt = Receipt(digest(approve), "synthetic-founder", self.now + timedelta(minutes=1), "approval-only")
        self.assertEqual("DENY", self.sim.evaluate(execute, self.now, wrong_receipt)["decision"])
        self.assertTrue(all(not event["can_dispatch"] for event in self.sim.events))

    def test_deterministic_scenarios_without_network_files_or_execution(self):
        # Imports are complete before these guards. The simulation must stay pure.
        with patch("builtins.open", side_effect=AssertionError("file access")), \
             patch("socket.socket", side_effect=AssertionError("network access")), \
             patch("subprocess.Popen", side_effect=AssertionError("process execution")):
            first = run_scenarios()
            self.assertEqual(first, run_scenarios())
        self.assertEqual(0, first["failed"])
        self.assertEqual("NOT_EVALUATED", first["production_readiness"])
        self.assertTrue(all(not case["event"]["can_dispatch"] for case in first["cases"]))


if __name__ == "__main__":
    unittest.main()
