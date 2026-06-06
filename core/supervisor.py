from LVTP.core.decision import decide
from LVTP.core.planner import build_plan
from LVTP.core.executor import execute
from LVTP.core.verifier import verify

import json
import datetime

def run_supervisor():

    decision = decide()

    plan = build_plan()

    execution = execute()

    verification = verify(execution)

    return {
        "time": datetime.datetime.now().isoformat(),
        "decision": decision,
        "plan": plan,
        "execution": execution,
        "verification": verification,
        "status": (
            "SUPERVISOR_OK"
            if verification.get("verdict")
            else "SUPERVISOR_ATTENTION_REQUIRED"
        )
    }

if __name__ == "__main__":
    print(
        json.dumps(
            run_supervisor(),
            indent=2
        )
    )
