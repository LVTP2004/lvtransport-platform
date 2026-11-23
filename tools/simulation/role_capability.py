"""Offline policy experiment. No authentication, network, or production authority.

All identities and approval evidence below are synthetic. ALLOW means only
that a hypothetical request satisfies this proposed policy. No tool executes.
"""
from dataclasses import asdict, dataclass, replace
from datetime import datetime, timedelta, timezone
import hashlib
import json


POLICY = "lvtp-role-simulation/v1"
ROLE_CAPABILITIES = {
    "user": {"ride.request", "ride.view.own"},
    "business": {"application.view.own"},
    "driver": {"driver.job.view.assigned", "driver.job.accept"},
    "dispatch": {"dispatch.job.assign"},
    "admin": {"admin.user.support"},
    "expert": {"expert.system.inspect"},
    "control_tower": {"controltower.incident.coordinate"},
    "founder": {"founder.policy.approve", "finance.payment.prepare", "finance.payment.approve"},
    "auditor": {"audit.events.read"},
    "finance_executor": {"finance.payment.execute"},
}
# domain, operation, relation required by this experiment
CAPABILITIES = {
    "ride.request": ("ride", "create", "own"),
    "ride.view.own": ("ride", "read", "own"),
    "application.view.own": ("application", "read", "own"),
    "driver.job.view.assigned": ("ride", "read", "assigned"),
    "driver.job.accept": ("ride", "accept", "assigned"),
    "dispatch.job.assign": ("ride", "assign", "any"),
    "admin.user.support": ("account", "support", "any"),
    "expert.system.inspect": ("system", "read", "any"),
    "controltower.incident.coordinate": ("incident", "coordinate", "any"),
    "founder.policy.approve": ("policy", "approve", "any"),
    "audit.events.read": ("audit", "read", "any"),
    "finance.payment.prepare": ("payment", "prepare", "any"),
    "finance.payment.approve": ("payment", "approve", "any"),
    "finance.payment.execute": ("payment", "execute", "any"),
}
PROTECTED = {"founder.policy.approve", "finance.payment.approve", "finance.payment.execute"}


@dataclass(frozen=True)
class Request:
    actor: str
    role: str
    capability: str
    resource: str
    operation: str
    session_verified: bool = True  # injected synthetic fixture, never authentication
    owner: str = ""
    assigned_driver: str = ""
    model: str = "simulation-model-a"
    amount_minor: int = 0
    beneficiary: str = ""


@dataclass(frozen=True)
class Receipt:
    request_digest: str
    approver: str
    expires_at: datetime
    nonce: str


def digest(request):
    return hashlib.sha256(json.dumps(asdict(request), sort_keys=True,
                                     separators=(",", ":")).encode()).hexdigest()


class Simulation:
    def __init__(self):
        self.consumed = set()
        self.events = []

    def evaluate(self, request, now, receipt=None):
        def result(decision, reason):
            event = {
                "sequence": len(self.events) + 1,
                "policy": POLICY,
                "simulation_only": True,
                "evidence_kind": "SYNTHETIC",
                "can_dispatch": False,
                "actor": request.actor,
                "role": request.role,
                "model": request.model,
                "capability": request.capability,
                "resource": request.resource,
                "operation": request.operation,
                "request_digest": digest(request),
                "approval_nonce": receipt.nonce if receipt else None,
                "decision": decision,
                "reason": reason,
                "timestamp": now.isoformat(),
            }
            self.events.append(event)
            return event

        if not request.actor or not request.session_verified:
            return result("DENY", "IDENTITY_MISSING")
        grants = ROLE_CAPABILITIES.get(request.role, set())
        if request.capability not in grants:
            return result("DENY", "CAPABILITY_NOT_GRANTED")
        domain, operation, relation = CAPABILITIES[request.capability]
        resource_domain, separator, identifier = request.resource.partition(":")
        if resource_domain != domain or not separator or not identifier or request.operation != operation:
            return result("DENY", "RESOURCE_OR_OPERATION_MISMATCH")
        if relation == "own" and request.owner != request.actor:
            return result("DENY", "NOT_OWNER")
        if relation == "assigned" and request.assigned_driver != request.actor:
            return result("DENY", "NOT_ASSIGNED")
        if request.capability == "finance.payment.execute":
            if (type(request.amount_minor) is not int or request.amount_minor <= 0
                    or not isinstance(request.beneficiary, str) or not request.beneficiary.strip()):
                return result("DENY", "TRANSACTION_INCOMPLETE")
        if request.capability in PROTECTED:
            if receipt is None:
                return result("PENDING_APPROVAL", "SYNTHETIC_APPROVAL_REQUIRED")
            if (receipt.approver != "synthetic-founder" or receipt.approver == request.actor
                    or receipt.request_digest != digest(request) or not receipt.nonce
                    or receipt.expires_at <= now or receipt.nonce in self.consumed):
                return result("DENY", "APPROVAL_INVALID_OR_REPLAYED")
            self.consumed.add(receipt.nonce)
        return result("ALLOW", "HYPOTHETICAL_POLICY_MATCH")


def run_scenarios():
    now = datetime(2026, 11, 15, 12, tzinfo=timezone.utc)
    simulation = Simulation()
    cases = []

    def check(name, request, expected, receipt=None):
        event = simulation.evaluate(request, now, receipt)
        cases.append({"name": name, "expected": expected,
                      "passed": event["decision"] == expected, "event": event})

    # Exhaustive cross-role/capability matrix, each with a matching resource.
    for role, grants in ROLE_CAPABILITIES.items():
        for capability, (domain, operation, _) in CAPABILITIES.items():
            request = Request("synthetic-actor", role, capability, domain + ":synthetic-resource",
                              operation, owner="synthetic-actor", assigned_driver="synthetic-actor",
                              amount_minor=100, beneficiary="synthetic-beneficiary")
            expected = "DENY" if capability not in grants else "PENDING_APPROVAL" if capability in PROTECTED else "ALLOW"
            for model in ("simulation-model-a", "simulation-model-b"):
                check(f"matrix/{role}/{capability}/{model}", replace(request, model=model), expected)

    ride = Request("synthetic-driver", "driver", "driver.job.accept", "ride:synthetic-trip", "accept",
                   assigned_driver="synthetic-driver")
    check("driver/other-trip", replace(ride, assigned_driver="synthetic-other"), "DENY")
    check("driver/missing-session", replace(ride, session_verified=False), "DENY")
    check("driver/wrong-operation", replace(ride, operation="delete"), "DENY")
    check("driver/wrong-domain", replace(ride, resource="payment:synthetic-trip"), "DENY")
    check("driver/empty-resource", replace(ride, resource="ride:"), "DENY")
    check("unknown/role", replace(ride, role="superuser"), "DENY")
    check("unknown/capability", replace(ride, capability="shell.execute"), "DENY")
    user = Request("synthetic-user", "user", "ride.view.own", "ride:synthetic-trip", "read", owner="synthetic-other")
    check("user/other-trip", user, "DENY")
    payment = Request("synthetic-executor", "finance_executor", "finance.payment.execute",
                      "payment:synthetic-payment", "execute", amount_minor=100, beneficiary="synthetic-beneficiary")
    receipt = Receipt(digest(payment), "synthetic-founder", now + timedelta(minutes=5), "synthetic-nonce")
    check("payment/missing-approval", payment, "PENDING_APPROVAL")
    for name, amount in (("zero", 0), ("negative", -1), ("fraction", 1.5), ("boolean", True)):
        check(f"payment/invalid-amount-{name}", replace(payment, amount_minor=amount), "DENY")
    check("payment/blank-beneficiary", replace(payment, beneficiary="   "), "DENY")
    check("payment/missing-session", replace(payment, session_verified=False), "DENY", receipt)
    check("payment/changed-amount", replace(payment, amount_minor=101), "DENY", receipt)
    check("payment/changed-beneficiary", replace(payment, beneficiary="synthetic-other"), "DENY", receipt)
    check("payment/changed-resource", replace(payment, resource="payment:other"), "DENY", receipt)
    check("payment/expired", payment, "DENY", replace(receipt, expires_at=now))
    check("payment/self-approval", payment, "DENY", replace(receipt, approver=payment.actor))
    check("payment/model-approval", payment, "DENY", replace(receipt, approver=payment.model))
    check("payment/synthetic-approved", payment, "ALLOW", receipt)
    check("payment/replay", payment, "DENY", receipt)
    return {"schema": POLICY, "simulation_only": True, "can_dispatch": False,
            "production_readiness": "NOT_EVALUATED", "scenario_count": len(cases),
            "passed": sum(case["passed"] for case in cases),
            "failed": sum(not case["passed"] for case in cases), "cases": cases}


if __name__ == "__main__":
    report = run_scenarios()
    print(json.dumps(report, indent=2))
    raise SystemExit(1 if report["failed"] else 0)
