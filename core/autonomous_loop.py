from LVTP.core.decision import decide
from LVTP.core.planner import build_plan
from LVTP.core.executor import execute
from LVTP.core.knowledge import remember

from pathlib import Path
import datetime
import json

BASE = Path.home() / "LVTP"
REPORTS = BASE / "ops-manager" / "reports"

def run_loop():
    REPORTS.mkdir(parents=True, exist_ok=True)

    decision = decide()
    plan = build_plan()
    execution = execute()

    learned = []

    for result in execution.get("results", []):
        status = result.get("status", "")
        action = result.get("action", "unknown")

        if status in ["MANUAL_REQUIRED", "WAITING_DEPLOY_PIPELINE"]:
            item = remember(
                kind="loop_observation",
                title=f"{action}: {status}",
                solution="Autonomous loop detected action but did not execute destructive or external change.",
                metadata={
                    "action": action,
                    "status": status,
                    "environment": decision.get("environment")
                }
            )
            learned.append(item)

    report = {
        "time": datetime.datetime.now().isoformat(),
        "environment": decision.get("environment", "unknown"),
        "decision": decision,
        "plan": plan,
        "execution": execution,
        "learned": learned,
        "verdict": "AUTONOMOUS_LOOP_OK"
    }

    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = REPORTS / f"{stamp}-autonomous-loop.md"
    path.write_text(json.dumps(report, indent=2))

    return report, path

if __name__ == "__main__":
    report, path = run_loop()
    print(json.dumps(report, indent=2))
    print(f"REPORT={path}")
