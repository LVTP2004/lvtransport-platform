from LVTP.core.planner import build_plan
import json
import datetime

def execute():

    plan = build_plan()

    results = []

    for action in plan["actions"]:

        cmd = action["command"]

        if cmd == "git push origin main":

            results.append({
                "action": cmd,
                "status": "MANUAL_REQUIRED"
            })

        elif cmd == "deploy_on_vps":

            results.append({
                "action": cmd,
                "status": "WAITING_DEPLOY_PIPELINE"
            })

        else:

            results.append({
                "action": cmd,
                "status": "UNKNOWN"
            })

    return {
        "time": datetime.datetime.now().isoformat(),
        "environment": plan["environment"],
        "results": results
    }

if __name__ == "__main__":
    print(json.dumps(execute(), indent=2))
