#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, socket, hashlib, shutil

BASE = Path.home() / "LVTP"
INBOX = BASE / "memory/mentor_inbox"
LESSONS = BASE / "memory/lessons"
EVENTS = BASE / "memory/events"
OBS = BASE / "observability"
STATE = OBS / "moni_mentor_ingestor_state.json"

for p in [INBOX, LESSONS, EVENTS, OBS]:
    p.mkdir(parents=True, exist_ok=True)

NODE = socket.gethostname()

def now():
    return datetime.now(timezone.utc).isoformat()

def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()[:12]

def write_event(kind, data):
    row = {
        "timestamp": now(),
        "node": NODE,
        "kind": kind,
        "data": data
    }
    with open(EVENTS / "moni_mentor_ingestor.jsonl", "a") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

def validate(exp):
    required = ["source", "topic", "lesson", "priority", "safe_to_apply"]
    missing = [k for k in required if k not in exp]
    if missing:
        return False, f"missing fields: {missing}"
    if exp["source"] != "chatgpt_mentor":
        return False, "source must be chatgpt_mentor"
    return True, "ok"

def ingest_file(path):
    text = path.read_text(errors="ignore")
    try:
        exp = json.loads(text)
    except Exception as e:
        write_event("MENTOR_INGEST_INVALID_JSON", {"file": str(path), "error": str(e)})
        return False

    ok, msg = validate(exp)
    if not ok:
        write_event("MENTOR_INGEST_REJECTED", {"file": str(path), "reason": msg})
        return False

    exp["ingested_at"] = now()
    exp["ingested_by_node"] = NODE

    lesson_id = sha(json.dumps(exp, sort_keys=True, ensure_ascii=False))
    out = LESSONS / f"mentor_lesson_{lesson_id}.json"
    out.write_text(json.dumps(exp, indent=2, ensure_ascii=False))

    processed_dir = INBOX / "processed"
    processed_dir.mkdir(exist_ok=True)
    shutil.move(str(path), str(processed_dir / path.name))

    write_event("MENTOR_LESSON_INGESTED", {
        "lesson_file": str(out),
        "topic": exp.get("topic"),
        "priority": exp.get("priority")
    })

    return True

def main():
    count = 0
    for path in sorted(INBOX.glob("*.json")):
        if ingest_file(path):
            count += 1

    STATE.write_text(json.dumps({
        "timestamp": now(),
        "node": NODE,
        "status": "OK",
        "ingested": count
    }, indent=2, ensure_ascii=False))

    print("✅ MONI MENTOR INGESTOR OK")
    print("Nodo:", NODE)
    print("Lessons ingested:", count)

if __name__ == "__main__":
    main()
