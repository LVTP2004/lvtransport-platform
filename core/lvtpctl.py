#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys, datetime

BASE = Path.home() / "LVTP"
REGISTRY = BASE / "config/platform_registry.json"
REPORTS = BASE / "ops-manager/reports"

def sh(cmd):
    return subprocess.run(cmd, shell=True, text=True, capture_output=True)

def load():
    return json.loads(REGISTRY.read_text())

def service(name):
    return load()["canonical"][name]

def report(name, body):
    REPORTS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = REPORTS / f"{stamp}-{name}.md"
    path.write_text(body)
    print(f"REPORT={path}")

def services():
    reg = load()
    for name, svc in reg["canonical"].items():
        print(f"{name}: type={svc.get('type')} recovery={svc.get('recovery')}")

def health():
    reg = load()
    lines = ["# LVTP HEALTH", f"time={datetime.datetime.now().isoformat()}", ""]
    ok = True

    for name, svc in reg["canonical"].items():
        status = "unknown"

        if "health" in svc:
            r = sh(f"curl -fsS --max-time 8 {svc['health']} >/dev/null")
            status = "ok" if r.returncode == 0 else "fail"

        elif svc.get("type") == "systemd":
            r = sh(f"systemctl is-active {svc['service']}")
            status = r.stdout.strip() or "fail"

        elif "pm2_name" in svc:
            r = sh(f"pm2 jlist | grep -q '\"name\":\"{svc['pm2_name']}\"'")
            status = "registered" if r.returncode == 0 else "missing"

        lines.append(f"{name}={status}")
        if status in ("fail", "missing", "inactive"):
            ok = False

    lines.append("")
    lines.append(f"verdict={'OK' if ok else 'ATTENTION_REQUIRED'}")
    body = "\n".join(lines)
    print(body)
    report("lvtpctl-health", body)

def restart(name):
    svc = service(name)

    if name == "api":
        cmd = f"""
cd {svc['path']} &&
pm2 delete {svc['pm2_name']} 2>/dev/null || true
PORT={svc['port']} NODE_ENV=production pm2 start {svc['script']} --name {svc['pm2_name']} --cwd {svc['path']}
pm2 save --force
"""
    elif svc.get("type") == "systemd":
        cmd = f"sudo systemctl restart {svc['service']}"
    elif "pm2_name" in svc:
        cmd = f"pm2 restart {svc['pm2_name']} --update-env"
    else:
        print(f"No restart rule for {name}")
        sys.exit(1)

    r = sh(cmd)
    print(r.stdout)
    print(r.stderr, file=sys.stderr)
    sys.exit(r.returncode)

def main():
    if len(sys.argv) < 2:
        print("usage: lvtpctl services|health|restart <service>")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "services":
        services()
    elif cmd == "health":
        health()
    elif cmd == "restart":
        if len(sys.argv) < 3:
            print("usage: lvtpctl restart <service>")
            sys.exit(1)
        restart(sys.argv[2])
    else:
        print(f"unknown command: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
