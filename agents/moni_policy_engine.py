#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import subprocess, socket, json, os

BASE = Path.home() / "LVTP"
CONFIG = BASE / "config/moni_policy.json"
EVENTS = BASE / "memory/events"
RESULTS = BASE / "memory/results"
STATE = BASE / "observability/moni_policy_state.json"

for p in [CONFIG.parent, EVENTS, RESULTS, STATE.parent]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()

def now():
    return datetime.now(timezone.utc).isoformat()

def sh(cmd):
    p = subprocess.run(cmd, shell=True, text=True, capture_output=True, executable="/bin/bash")
    return p.returncode, p.stdout, p.stderr

def load_policy():
    return json.loads(CONFIG.read_text())

def write_event(kind, data):
    row = {"timestamp": now(), "node": NODE, "kind": kind, "data": data}
    with open(EVENTS / "moni_policy.jsonl", "a") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

def disk_percent():
    code, out, err = sh("df -P ~ | tail -1 | awk '{print $5}' | tr -d '%'")
    try:
        return int(out.strip())
    except:
        return -1

def pm2_status():
    code, out, err = sh("pm2 jlist")
    if code != 0:
        return []
    try:
        return json.loads(out)
    except:
        return []

def append_command(action):
    cmd = {
        "timestamp": now(),
        "source": NODE,
        "target": "local",
        "action": action
    }
    with open(BASE / "memory/commands/inbox.jsonl", "a") as f:
        f.write(json.dumps(cmd, ensure_ascii=False) + "\n")
    return cmd

def evaluate():
    policy = load_policy()
    findings = []
    actions = []

    storage = disk_percent()

    if storage >= policy["storage_max_percent"]:
        finding = {"type": "STORAGE_HIGH", "storage_percent": storage}
        findings.append(finding)
        write_event("POLICY_STORAGE_HIGH", finding)

        action = policy["actions"].get("storage_high")
        if action:
            actions.append(append_command(action))

    apps = pm2_status()
    watched = set(policy["watched_processes"])

    for app in apps:
        name = app.get("name")
        status = app.get("pm2_env", {}).get("status")

        if name in watched and status != "online":
            finding = {"type": "PROCESS_DOWN", "name": name, "status": status}
            findings.append(finding)
            write_event("POLICY_PROCESS_DOWN", finding)

            if policy.get("auto_restart"):
                sh(f"pm2 restart {name} --update-env")
                write_event("POLICY_AUTO_RESTART", {"name": name})

    if not findings:
        actions.append(append_command(policy["actions"]["routine"]))
        write_event("POLICY_ROUTINE_OK", {"storage_percent": storage})

    state = {
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "storage_percent": storage,
        "findings": findings,
        "actions": actions
    }

    STATE.write_text(json.dumps(state, indent=2, ensure_ascii=False))

    print("✅ MONI POLICY ENGINE OK")
    print("Nodo:", NODE)
    print("Storage:", storage)
    print("Findings:", len(findings))
    print("Actions:", len(actions))

if __name__ == "__main__":
    evaluate()
