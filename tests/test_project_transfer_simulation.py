"""Offline acceptance scenarios; no production ownership or financial authority."""
import unittest
from tools.simulation.project_transfer import run_scenarios


class ProjectTransferTests(unittest.TestCase):
    def test_transfer_acceptance_scenarios(self):
        report = run_scenarios()
        self.assertFalse(report['can_dispatch'])
        self.assertTrue(report['simulation_only'])
        self.assertEqual(report['production_readiness'], 'NOT_VALIDATED')
        for name, passed in report['checks'].items():
            with self.subTest(scenario=name):
                self.assertTrue(passed)
