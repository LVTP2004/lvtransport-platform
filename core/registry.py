from pathlib import Path
import json
import socket

BASE = Path.home() / "LVTP"
HOST = socket.gethostname().lower()

LOCAL = BASE / "config/platform_registry.local.json"
VPS = BASE / "config/platform_registry.vps.json"
DEFAULT = BASE / "config/platform_registry.json"

def registry_path():
    if "aspire" in HOST or "leonardovargas" in HOST:
        return LOCAL
    if VPS.exists():
        return VPS
    return DEFAULT

REGISTRY = registry_path()

def load_registry():
    with open(REGISTRY, "r", encoding="utf-8") as f:
        return json.load(f)

def get_service(name):
    return load_registry()["canonical"][name]

if __name__ == "__main__":
    reg = load_registry()
    print(json.dumps({
        "host": socket.gethostname(),
        "registry": str(REGISTRY),
        "environment": reg.get("environment", "unknown"),
        "services": list(reg.get("canonical", {}).keys())
    }, indent=2))
