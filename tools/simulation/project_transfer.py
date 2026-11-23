"""Synthetic, offline ownership experiment. Never authenticates or dispatches."""
from dataclasses import dataclass, replace
import json

REQUIRED = frozenset({'identity', 'data', 'hosting', 'domain', 'payments',
                      'assistant_runtime', 'knowledge', 'audit', 'credentials'})
OPERATIONS = frozenset({'booking', 'driver', 'admin', 'finance.prepare', 'assistant'})


@dataclass(frozen=True)
class Session:
    project: str
    principal: str
    epoch: int
    capabilities: frozenset


@dataclass(frozen=True)
class Approval:
    project: str
    epoch: int
    approver: str
    plan: str
    nonce: str


class TransferSimulation:
    """Fixtures supplied by tests are NOT evidence accepted by a real runtime."""
    def __init__(self):
        self.project = 'synthetic-lvtransport'
        self.owner = 'synthetic-lvtp'
        self.epoch = 1
        self.core_connected = True
        self.grants = {'synthetic-lvtp': OPERATIONS | {'finance.execute'}}
        self.used = set()
        self.events = []

    def allows(self, session, operation, resource_project=None):
        return (session.project == self.project
                and (resource_project is None or resource_project == self.project)
                and session.epoch == self.epoch
                and operation in session.capabilities
                and operation in self.grants.get(session.principal, frozenset()))

    def transfer(self, buyer, ready, *, seller_authorized=False, buyer_accepted=False):
        # Explicit fixture evidence, not real human authorization.
        if (not seller_authorized or not buyer_accepted or not buyer
                or buyer == self.owner or not REQUIRED <= ready):
            return False
        previous = self.owner
        self.owner = buyer
        self.epoch += 1
        self.grants = {buyer: OPERATIONS | {'finance.execute'}}
        self.core_connected = False
        self.events.append({'previous_owner': previous, 'owner': buyer,
                            'epoch': self.epoch, 'simulation_only': True})
        return True

    def pay(self, session, approval, *, plan):
        if not self.allows(session, 'finance.execute') or approval is None:
            return False
        if (approval.project != self.project or approval.epoch != self.epoch
                or approval.approver == session.principal
                or 'finance.approve' not in self.grants.get(approval.approver, ())
                or not plan or approval.plan != plan or not approval.nonce
                or approval.nonce in self.used):
            return False
        self.used.add(approval.nonce)
        return True  # hypothetical permission only; no payment provider


def run_scenarios():
    sim = TransferSimulation()
    old = Session(sim.project, sim.owner, 1, OPERATIONS | {'finance.execute'})
    checks = {}
    checks['seller_before'] = all(sim.allows(old, op) for op in OPERATIONS)
    checks['missing_authority'] = not sim.transfer('synthetic-buyer', REQUIRED)
    checks['no_state_change_on_failure'] = sim.owner == old.principal and sim.epoch == 1
    for dependency in sorted(REQUIRED):
        checks['missing_dependency/' + dependency] = not sim.transfer(
            'synthetic-buyer', REQUIRED - {dependency}, seller_authorized=True, buyer_accepted=True)
    checks['transfer'] = sim.transfer('synthetic-buyer', REQUIRED,
                                     seller_authorized=True, buyer_accepted=True)
    buyer = Session(sim.project, sim.owner, sim.epoch, OPERATIONS | {'finance.execute'})
    for op in sorted(OPERATIONS):
        checks['independent/' + op] = not sim.core_connected and sim.allows(buyer, op)
        checks['seller_revoked/' + op] = not sim.allows(old, op)
    checks['refreshed_seller_denied'] = not sim.allows(replace(old, epoch=sim.epoch), 'admin')
    checks['stale_buyer_session'] = not sim.allows(replace(buyer, epoch=1), 'admin')
    checks['other_project_session'] = not sim.allows(replace(buyer, project='other'), 'admin')
    checks['other_project_resource'] = not sim.allows(buyer, 'admin', 'other')
    checks['unknown_capability'] = not sim.allows(buyer, 'shell')
    checks['no_approval'] = not sim.pay(buyer, None, plan='synthetic-payment')
    approval = Approval(sim.project, 1, old.principal, 'synthetic-payment', 'old')
    checks['old_approval_revoked'] = not sim.pay(buyer, approval, plan=approval.plan)
    checks['self_approval'] = not sim.pay(buyer, replace(approval, epoch=2, approver=buyer.principal), plan=approval.plan)
    sim.grants['synthetic-reviewer'] = frozenset({'finance.approve'})
    approved = replace(approval, epoch=2, approver='synthetic-reviewer', nonce='new')
    checks['different_plan'] = not sim.pay(buyer, approved, plan='changed')
    checks['cross_project_approval'] = not sim.pay(buyer, replace(approved, project='other'), plan=approved.plan)
    checks['reviewer_cannot_execute'] = not sim.pay(
        Session(sim.project, 'synthetic-reviewer', 2, frozenset({'finance.execute'})), approved, plan=approved.plan)
    checks['new_approval'] = sim.pay(buyer, approved, plan=approved.plan)
    checks['replay_denied'] = not sim.pay(buyer, approved, plan=approved.plan)
    checks['audit_retained'] = len(sim.events) == 1 and sim.events[0]['previous_owner'] == old.principal
    return {'simulation_only': True, 'can_dispatch': False,
            'production_readiness': 'NOT_VALIDATED', 'checks': checks,
            'passed': sum(checks.values()), 'failed': sum(not v for v in checks.values())}


if __name__ == '__main__':
    report = run_scenarios()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report['failed']))
