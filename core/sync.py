from LVTP.core.registry import load_registry
from pathlib import Path
import subprocess, datetime, json, os

BASE = Path.home() / "LVTP"
REPORTS = BASE / "ops-manager/reports"

def sh(cmd, cwd=None):
    return subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)

def sync():
    reg = load_registry()
    root = BASE
    REPORTS.mkdir(parents=True, exist_ok=True)

    status = sh("git status --porcelain", cwd=root)
    has_changes = bool(status.stdout.strip())

    result = {
        "time": datetime.datetime.now().isoformat(),
        "environment": reg.get("environment", "unknown"),
        "root": str(root),
        "has_changes": has_changes,
        "actions": []
    }

    if not (root / ".git").exists():
        result["actions"].append({
            "action": "git_check",
            "status": "NO_GIT_REPOSITORY",
            "message": "LVTP local no parece ser repo git."
        })
        return result

    if not has_changes:
        result["actions"].append({
            "action": "sync",
            "status": "NO_CHANGES"
        })
        return result

    add = sh("git add .", cwd=root)
    result["actions"].append({
        "action": "git add .",
        "returncode": add.returncode,
        "stderr": add.stderr[-1000:]
    })

    msg = "LVTP Aspire sync " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit = sh(f'git commit -m "{msg}"', cwd=root)
    result["actions"].append({
        "action": "git commit",
        "returncode": commit.returncode,
        "stdout": commit.stdout[-1000:],
        "stderr": commit.stderr[-1000:]
    })

    if commit.returncode != 0:
        return result

    push = sh("git push origin main", cwd=root)
    result["actions"].append({
        "action": "git push origin main",
        "returncode": push.returncode,
        "stdout": push.stdout[-1000:],
        "stderr": push.stderr[-1000:]
    })

    return result

if __name__ == "__main__":
    result = sync()
    print(json.dumps(result, indent=2))
