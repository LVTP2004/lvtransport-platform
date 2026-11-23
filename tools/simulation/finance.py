"""Pure EUR-cent arithmetic and sequential payment experiments; no provider calls.

Taxes and provider-specific settlement timing are outside this experiment.
Fee and operating-cost inputs are explicit hypotheses, never live tariffs.
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
import json


def money(value, name):
    if type(value) is not int or value < 0:
        raise ValueError(name + " must be nonnegative integer cents")


def percentage(amount, basis_points):
    return int((Decimal(amount) * Decimal(basis_points) / 10000).quantize(
        Decimal(1), rounding=ROUND_HALF_UP))


@dataclass(frozen=True)
class Terms:
    base: int
    tip: int = 0
    expenses: int = 0
    commission_bps: int = 2000
    fee_bps: int = 150  # hypothetical sensitivity input, not a provider contract
    fee_fixed: int = 25
    fleet: str = "external"
    operating_cost: int | None = None

    def __post_init__(self):
        for name in ("base", "tip", "expenses", "commission_bps", "fee_bps", "fee_fixed"):
            money(getattr(self, name), name)
        if self.base == 0 or self.commission_bps > 10000 or self.fee_bps > 10000:
            raise ValueError("invalid amount or rate")
        if self.fleet not in ("external", "own"):
            raise ValueError("unknown fleet")
        if self.operating_cost is not None:
            money(self.operating_cost, "operating_cost")


def allocation(terms, refunded_base=0):
    money(refunded_base, "refunded_base")
    if refunded_base > terms.base:
        raise ValueError("refund exceeds base")
    retained_base = terms.base - refunded_base
    gross = terms.base + terms.tip + terms.expenses
    fee = percentage(gross, terms.fee_bps) + terms.fee_fixed
    commission = percentage(retained_base, terms.commission_bps) if terms.fleet == "external" else 0
    # Own-fleet wages/tips/expenses are kept in a separate cost model.
    driver = retained_base - commission + terms.tip + terms.expenses if terms.fleet == "external" else 0
    own_reserve = terms.tip + terms.expenses if terms.fleet == "own" else 0
    platform = gross - refunded_base - fee - driver - own_reserve
    return {
        "gross_captured": gross, "refunded_base": refunded_base,
        "provider_fee_assumed_nonrefundable": fee,
        "commission": commission, "driver_due": driver,
        "own_tip_expense_reserve": own_reserve,
        "platform_after_processing": platform,
        "platform_after_supplied_cost": None if terms.operating_cost is None else platform - terms.operating_cost,
        "balanced": gross == refunded_base + fee + driver + own_reserve + platform,
        "profitability": "NOT_ESTABLISHED",
    }


class PaymentExperiment:
    """In-memory sequence model; booleans are fixtures, not real approvals."""
    def __init__(self, terms):
        self.terms = terms
        self.confirmed = False
        self.completed = False
        self.captured = False
        self.refunded = 0
        self.paid = 0
        self.refund_keys = {}
        self.events = []

    def record(self, action, result):
        self.events.append({"action": action, "result": result,
                            "simulation_only": True, "can_dispatch": False})
        return result

    def capture(self):
        if not self.confirmed:
            return self.record("capture", "DENY_UNCONFIRMED")
        if self.captured:
            return self.record("capture", "DUPLICATE_NO_CHANGE")
        self.captured = True
        return self.record("capture", "SIMULATED_CAPTURE")

    def refund(self, key, amount, review=False):
        money(amount, "refund")
        if not isinstance(key, str) or not key.strip() or amount == 0:
            raise ValueError("refund key and positive amount required")
        if key in self.refund_keys:
            return self.record("refund", "DUPLICATE_NO_CHANGE" if self.refund_keys[key] == amount else "DENY_KEY_CONFLICT")
        if not review:
            return self.record("refund", "PENDING_REVIEW")
        if not self.captured or self.refunded + amount > self.terms.base:
            return self.record("refund", "DENY_REFUND")
        # A real post-payout refund needs transfer reversal/recovery, not a
        # silently negative driver balance. This experiment blocks it.
        if self.paid:
            return self.record("refund", "BLOCKED_POST_PAYOUT_RECOVERY")
        self.refunded += amount
        self.refund_keys[key] = amount
        return self.record("refund", "SIMULATED_REFUND")

    def payout(self, weekly_cycle=False, review=False):
        if self.terms.fleet != "external":
            return self.record("payout", "NOT_EXTERNAL")
        if not (self.captured and self.completed and weekly_cycle and review):
            return self.record("payout", "PENDING_PREREQUISITES")
        due = allocation(self.terms, self.refunded)["driver_due"]
        if self.paid or due == 0:
            return self.record("payout", "DUPLICATE_OR_ZERO_NO_CHANGE")
        self.paid = due
        return self.record("payout", "SIMULATED_PAYOUT")


def run():
    rows = []
    for fleet in ("external", "own"):
        for base in (2000, 5000, 10000, 20000):
            for rate in (1500, 2000, 2500):
                # Three hypothetical per-trip cost levels: not actual LVTP costs.
                for cost in (0, 500, 1000):
                    terms = Terms(base, commission_bps=rate, fleet=fleet, operating_cost=cost)
                    rows.append({"fleet": fleet, "base": base, "commission_bps": rate,
                                 "hypothetical_cost": cost, **allocation(terms)})
    checks = []
    payment = PaymentExperiment(Terms(10000, tip=500, expenses=1000))

    def check(name, actual, expected):
        checks.append({"name": name, "actual": actual, "expected": expected, "passed": actual == expected})

    check("unconfirmed charge", payment.capture(), "DENY_UNCONFIRMED")
    payment.confirmed = True
    check("confirmed charge", payment.capture(), "SIMULATED_CAPTURE")
    check("charge retry", payment.capture(), "DUPLICATE_NO_CHANGE")
    check("incomplete trip payout", payment.payout(True, True), "PENDING_PREREQUISITES")
    check("refund approval", payment.refund("synthetic-refund", 2500), "PENDING_REVIEW")
    check("partial refund", payment.refund("synthetic-refund", 2500, True), "SIMULATED_REFUND")
    check("refund retry", payment.refund("synthetic-refund", 2500, True), "DUPLICATE_NO_CHANGE")
    check("refund payload conflict", payment.refund("synthetic-refund", 1000, True), "DENY_KEY_CONFLICT")
    check("excess refund", payment.refund("synthetic-excess", 10000, True), "DENY_REFUND")
    payment.completed = True
    check("weekly cycle required", payment.payout(False, True), "PENDING_PREREQUISITES")
    check("payout review", payment.payout(True, False), "PENDING_PREREQUISITES")
    check("weekly reviewed payout", payment.payout(True, True), "SIMULATED_PAYOUT")
    check("payout retry", payment.payout(True, True), "DUPLICATE_OR_ZERO_NO_CHANGE")
    check("post-payout refund", payment.refund("synthetic-late", 100, True), "BLOCKED_POST_PAYOUT_RECOVERY")
    check("tips expenses preserved", allocation(Terms(10000, tip=500, expenses=1000))["driver_due"], 9500)
    check("recalculated commission", allocation(payment.terms, 2500)["commission"], 1500)
    for row in rows:
        check(f"balance/{row['fleet']}/{row['base']}/{row['commission_bps']}/{row['hypothetical_cost']}", row["balanced"], True)
    return {"simulation_only": True, "can_dispatch": False,
            "currency": "EUR", "units": "integer cents", "taxes": "NOT_MODELED",
            "assumptions": {"fee_bps": 150, "fee_fixed": 25, "provider_fees_refunded": False,
                            "actual_costs_supplied": False, "commercial_limits": "UNSET"},
            "rows": rows, "checks": checks, "events": payment.events,
            "passed": sum(c["passed"] for c in checks), "failed": sum(not c["passed"] for c in checks)}


if __name__ == "__main__":
    report = run()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report["failed"]))
