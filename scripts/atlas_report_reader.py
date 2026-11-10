#!/usr/bin/env python3
"""Read-only Atlas cycle report metadata from the authorized Aspire host.

Does not run Atlas, expose report bodies, write memory, or authorize operations.
This is diagnostic metadata, not cryptographic Atlas attestation.
"""
import hashlib
import json
from pathlib import Path
import shlex
import subprocess

HOST = "100.71.225.29"
USER = "leonardo-vargas"
KEY = Path.home() / ".ssh/id_ed25519"

REMOTE = r"""
from pathlib import Path
import hashlib
import json
base = Path.home() / "aspire_atlas_restore"
pointer = base / "state/latest-cycle-report.txt"
allowed = (base / "reports").resolve(strict=True)
if pointer.is_symlink() or not pointer.is_file():
    raise SystemExit("DENIED_POINTER")
raw = pointer.read_text(encoding="utf-8").strip()
if not raw or len(raw) > 512:
    raise SystemExit("DENIED_POINTER")
target = Path(raw).resolve(strict=True)
if not target.is_relative_to(allowed) or not target.is_file():
    raise SystemExit("DENIED_PATH")
if target.is_symlink() or target.stat().st_size > 1048576:
    raise SystemExit("DENIED_FILE")
data = target.read_bytes()
if len(data) > 1048576:
    raise SystemExit("DENIED_SIZE")
headings = [
    line[:120] for line in data.decode("utf-8", errors="replace").splitlines()
    if line.startswith("## ")
][:20]
print(json.dumps({
    "kind": "atlas_cycle_report_metadata",
    "source_node": "aspire",
    "filename": target.name,
    "bytes": len(data),
    "sha256": hashlib.sha256(data).hexdigest(),
    "headings": headings,
    "content_returned": False,
    "signed_attestation": False,
    "atlas_agent_invoked": False,
    "operational_status": "NOT_VERIFIED"
}, ensure_ascii=False))
"""

def read_atlas_metadata():
    # SSH executes a remote shell: quote the entire -c payload explicitly.
    remote_command = "python3 -c " + shlex.quote(REMOTE)
    command = [
        "ssh", "-T", "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes",
        "-o", "StrictHostKeyChecking=yes", "-o", "ConnectTimeout=5",
        "-o", "ConnectionAttempts=1", "-i", str(KEY),
        f"{USER}@{HOST}", remote_command
    ]
    result = subprocess.run(
        command, capture_output=True, text=True, timeout=20, check=False
    )
    if result.returncode != 0:
        raise RuntimeError("ATLAS_READ_UNAVAILABLE")
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("ATLAS_INVALID_JSON") from exc
    if (
        not isinstance(payload, dict)
        or payload.get("kind") != "atlas_cycle_report_metadata"
        or payload.get("source_node") != "aspire"
        or payload.get("content_returned") is not False
        or payload.get("signed_attestation") is not False
        or payload.get("atlas_agent_invoked") is not False
        or payload.get("operational_status") != "NOT_VERIFIED"
        or not isinstance(payload.get("sha256"), str)
        or len(payload["sha256"]) != 64
        or not all(c in "0123456789abcdef" for c in payload["sha256"])
    ):
        raise RuntimeError("ATLAS_INVALID_RESPONSE")
    return payload

if __name__ == "__main__":
    try:
        print(json.dumps(read_atlas_metadata(), indent=2, ensure_ascii=False))
    except (RuntimeError, subprocess.TimeoutExpired, OSError) as exc:
        print(json.dumps({
            "kind": "atlas_cycle_report_metadata",
            "status": "UNAVAILABLE",
            "reason": type(exc).__name__
        }))
        raise SystemExit(1)
