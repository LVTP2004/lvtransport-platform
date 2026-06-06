from LVTP.core.decision import decide
import json

def build_plan():

    report = decide()

    actions = []

    for d in report["decisions"]:

        if d["action"] == "SYNC_TO_VPS":

            actions.append({
                "step": 1,
                "type": "sync",
                "service": d["service"],
                "command": "git push origin main"
            })

            actions.append({
                "step": 2,
                "type": "deploy",
                "service": d["service"],
                "command": "deploy_on_vps"
            })

    return {
        "environment": report["environment"],
        "actions": actions
    }

if __name__ == "__main__":
    print(json.dumps(build_plan(), indent=2))
