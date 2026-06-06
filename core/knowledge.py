from pathlib import Path
import json
import datetime

BASE = Path.home() / "LVTP"
DB = BASE / "knowledge" / "incidents.jsonl"

def remember(kind, title, solution, metadata=None):

    DB.parent.mkdir(parents=True, exist_ok=True)

    item = {
        "time": datetime.datetime.now().isoformat(),
        "kind": kind,
        "title": title,
        "solution": solution,
        "metadata": metadata or {}
    }

    with open(DB, "a") as f:
        f.write(json.dumps(item) + "\n")

    return item

def search(kind=None):

    if not DB.exists():
        return []

    out = []

    for line in DB.read_text().splitlines():

        if not line.strip():
            continue

        obj = json.loads(line)

        if kind and obj["kind"] != kind:
            continue

        out.append(obj)

    return out

if __name__ == "__main__":

    remember(
        "bootstrap",
        "LVTP local registry created",
        "Registry, planner, executor and recovery engine installed"
    )

    print(json.dumps(search(), indent=2))
