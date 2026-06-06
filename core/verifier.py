from pathlib import Path
import json
import datetime

def verify(execution_report):
    results = execution_report.get("results", [])

    checks = []

    for item in results:
        status = item.get("status", "UNKNOWN")

        checks.append({
            "action": item.get("action"),
            "status": status,
            "verified": status in [
                "MANUAL_REQUIRED",
                "WAITING_DEPLOY_PIPELINE",
                "SUCCESS"
            ]
        })

    return {
        "time": datetime.datetime.now().isoformat(),
        "checks": checks,
        "verdict": all(c["verified"] for c in checks)
    }

if __name__ == "__main__":
    sample = {
        "results": [
            {
                "action":"git push origin main",
                "status":"MANUAL_REQUIRED"
            },
            {
                "action":"deploy_on_vps",
                "status":"WAITING_DEPLOY_PIPELINE"
            }
        ]
    }

    print(json.dumps(
        verify(sample),
        indent=2
    ))
