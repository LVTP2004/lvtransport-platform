#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, socket, hashlib

BASE = Path.home() / "LVTP"
EVENTS = BASE / "memory/events"
PROCESSED = BASE / "memory/processed"
STATE = BASE / "observability/event_router_state.json"

EVENTS.mkdir(parents=True, exist_ok=True)
PROCESSED.mkdir(parents=True, exist_ok=True)
STATE.parent.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()

def now():
    return datetime.now(timezone.utc).isoformat()

def event_id(line):
    return hashlib.sha256(line.encode("utf-8")).hexdigest()[:16]

def load_processed():
    db = PROCESSED / "processed_events.txt"
    if not db.exists():
        return set()
    return set(db.read_text().splitlines())

def save_processed(eid):
    with open(PROCESSED / "processed_events.txt", "a") as f:
        f.write(eid + "\n")

def route_event(event):
    kind = event.get("kind") or event.get("status") or event.get("sync") or "UNKNOWN"

    if kind in ["MONI_DAEMON_START", "OPENAI_API_OPERATIVE"]:
        action = "OBSERVE"
    elif kind in ["MONI_ANALYSIS_COMPLETE"]:
        action = "INDEX_MEMORY"
    elif kind in ["linux_vps", "vps_linux"]:
        action = "SYNC_CONFIRMED"
    else:
        action = "LOG_ONLY"

    routed = {
        "timestamp": now(),
        "node": NODE,
        "source_event": event,
        "action": action,
        "status": "ROUTED"
    }

    with open(EVENTS / "moni_routed_events.jsonl", "a") as f:
        f.write(json.dumps(routed, ensure_ascii=False) + "\n")

    return action

def main():
    processed = load_processed()
    count = 0

    for path in EVENTS.glob("*.jsonl"):
        if path.name == "moni_routed_events.jsonl":
            continue

        for line in path.read_text(errors="ignore").splitlines():
            if not line.strip():
                continue

            eid = event_id(path.name + line)

            if eid in processed:
                continue

            try:
                event = json.loads(line)
            except Exception:
                event = {"raw": line, "file": path.name}

            route_event(event)
            save_processed(eid)
            count += 1

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "processed_new_events": count,
        "status": "OK"
    }, indent=2, ensure_ascii=False))

    print("✅ MONI EVENT ROUTER OK")
    print("Nodo:", NODE)
    print("Eventos nuevos procesados:", count)
    print("Estado:", STATE)

if __name__ == "__main__":
    main()
