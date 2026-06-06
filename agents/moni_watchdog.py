#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import subprocess, socket, json, time, os

BASE = Path.home() / "LVTP"
EVENTS = BASE / "memory/events"
LOGS = BASE / "memory/logs"
OBS = BASE / "observability"
STATE = OBS / "moni_watchdog_state.json"

for p in [EVENTS, LOGS, OBS]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()
WATCH = ["MONI", "MONI_LOOP", "MONI_EVENT_WORKER"]

def now():
    return datetime.now(timezone.utc).isoformat()

def sh(cmd):
    p = subprocess.run(cmd, shell=True, text=True, capture_output=True, executable="/bin/bash")
    return p.returncode, p.stdout, p.stderr

def event(kind, data):
    row = {"timestamp": now(), "node": NODE, "kind": kind, "data": data}
    with open(EVENTS / "moni_watchdog.jsonl", "a") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

def check_pm2():
    code, out, err = sh("pm2 jlist")
    if code != 0:
        event("WATCHDOG_PM2_ERROR", {"stderr": err})
        return []

    try:
        apps = json.loads(out)
    except Exception as e:
        event("WATCHDOG_PARSE_ERROR", {"error": str(e)})
        return []

    findings = []

    for app in apps:
        name = app.get("name")
        status = app.get("pm2_env", {}).get("status")
        restarts = app.get("pm2_env", {}).get("restart_time", 0)

        if name in WATCH and status != "online":
            findings.append({"name": name, "status": status, "action": "restart"})
            sh(f"pm2 restart {name} --update-env")
            event("WATCHDOG_RESTART", {"name": name, "previous_status": status})

        if name in WATCH and restarts > 20:
            event("WATCHDOG_HIGH_RESTARTS", {"name": name, "restarts": restarts})

    return findings

def check_storage():
    code, out, err = sh("df -P ~ | tail -1 | awk '{print $5}' | tr -d '%'")
    try:
        usage = int(out.strip())
    except:
        usage = -1

    if usage >= 85:
        event("WATCHDOG_STORAGE_HIGH", {"usage_percent": usage})

    return usage

def cycle():
    findings = check_pm2()
    usage = check_storage()

    state = {
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "storage_percent": usage,
        "findings": findings
    }

    STATE.write_text(json.dumps(state, indent=2, ensure_ascii=False))

    print(f"✅ WATCHDOG OK | node={NODE} | storage={usage}% | findings={len(findings)}", flush=True)

def main():
    interval = int(os.getenv("MONI_WATCHDOG_INTERVAL", "60"))
    print(f"MONI_WATCHDOG START | node={NODE} | interval={interval}", flush=True)

    while True:
        try:
            cycle()
        except Exception as e:
            event("WATCHDOG_ERROR", {"error": str(e)})
            print("ERROR:", e, flush=True)
        time.sleep(interval)

if __name__ == "__main__":
    main()
