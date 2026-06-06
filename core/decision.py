from LVTP.core.registry import load_registry
from LVTP.core.recovery import recover
import datetime
import json

def decide():

    reg = load_registry()

    decisions = []

    for name in reg["canonical"]:

        action = recover(name)

        if action == "LOCAL_WORKSPACE_OK":
            continue

        if action == "OPS_OK":
            continue

        if action == "AGENTS_OK":
            continue

        if action == "SYNC_REQUIRED":
            decisions.append({
                "service": name,
                "priority": "HIGH",
                "action": "SYNC_TO_VPS"
            })

        else:
            decisions.append({
                "service": name,
                "priority": "MEDIUM",
                "action": action
            })

    report = {
        "time": datetime.datetime.now().isoformat(),
        "environment": reg.get("environment","unknown"),
        "decisions": decisions
    }

    return report

if __name__ == "__main__":
    print(json.dumps(decide(), indent=2))
