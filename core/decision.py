from LVTP.core.registry import load_registry
from LVTP.core.recovery import recover
from LVTP.core.knowledge import search

import datetime
import json

def decide():

    reg = load_registry()

    decisions = []

    memories = search()

    for item in memories:

        if item["kind"] == "bootstrap":
            decisions.append({
                "source": "memory",
                "title": item["title"]
            })

    for name in reg["canonical"]:

        action = recover(name)

        if action in [
            "LOCAL_WORKSPACE_OK",
            "OPS_OK",
            "AGENTS_OK"
        ]:
            continue

        if action == "SYNC_REQUIRED":

            decisions.append({
                "service": name,
                "priority": "HIGH",
                "action": "SYNC_TO_VPS"
            })

    return {
        "time": datetime.datetime.now().isoformat(),
        "environment": reg.get("environment","unknown"),
        "memory_items": len(memories),
        "decisions": decisions
    }

if __name__ == "__main__":
    print(json.dumps(decide(), indent=2))
