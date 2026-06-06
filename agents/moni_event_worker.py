#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, socket, subprocess, hashlib, time, os

BASE = Path.home() / "LVTP"
INBOX = BASE / "memory/commands/inbox.jsonl"
DONE = BASE / "memory/commands/processed.txt"
RESULTS = BASE / "memory/results"
STATE = BASE / "observability/moni_event_worker_state.json"

for p in [INBOX.parent, RESULTS, STATE.parent]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()

ACTIONS = {
    "healthcheck": "python3 ~/LVTP/agents/moni_healthcheck.py",
    "route_events": "python3 ~/LVTP/agents/moni_event_router.py",
    "moni_once": "python3 ~/LVTP/agents/moni_daemon.py",
    "pm2_list": "pm2 list",
    "storage_status": "du -sh ~/LVTP && df -h ~"
}

def now():
    return datetime.now(timezone.utc).isoformat()

def eid(line):
    return hashlib.sha256(line.encode()).hexdigest()[:16]

def load_done():
    return set(DONE.read_text().splitlines()) if DONE.exists() else set()

def mark_done(x):
    with open(DONE, "a") as f:
        f.write(x + "\n")

def run_action(action):
    if action not in ACTIONS:
        return 1, "", f"Action not allowed: {action}"

    p = subprocess.run(
        ACTIONS[action],
        shell=True,
        text=True,
        capture_output=True,
        executable="/bin/bash"
    )
    return p.returncode, p.stdout, p.stderr

def process_once():
    if not INBOX.exists():
        INBOX.touch()

    done = load_done()
    count = 0

    for line in INBOX.read_text(errors="ignore").splitlines():
        if not line.strip():
            continue

        cid = eid(line)

        if cid in done:
            continue

        try:
            cmd = json.loads(line)
        except Exception as e:
            cmd = {"action": "invalid", "error": str(e)}

        action = cmd.get("action", "unknown")
        code, out, err = run_action(action)

        result = {
            "timestamp": now(),
            "node": NODE,
            "command_id": cid,
            "action": action,
            "return_code": code,
            "stdout": out[-4000:],
            "stderr": err[-4000:],
            "status": "OK" if code == 0 else "ERROR"
        }

        with open(RESULTS / "command_results.jsonl", "a") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

        mark_done(cid)
        count += 1

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "processed_last_cycle": count,
        "status": "OK"
    }, indent=2, ensure_ascii=False))

    print(f"✅ MONI_EVENT_WORKER cycle OK | node={NODE} | processed={count}", flush=True)

def main():
    interval = int(os.getenv("MONI_WORKER_INTERVAL", "60"))
    print(f"MONI_EVENT_WORKER START | node={NODE} | interval={interval}", flush=True)

    while True:
        try:
            process_once()
        except Exception as e:
            STATE.write_text(json.dumps({
                "timestamp": now(),
                "node": NODE,
                "status": "ERROR",
                "error": str(e)
            }, indent=2, ensure_ascii=False))
            print("ERROR:", e, flush=True)

        time.sleep(interval)

if __name__ == "__main__":
    main()
