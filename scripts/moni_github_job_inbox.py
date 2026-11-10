#!/usr/bin/env python3
"""MONI V10 GitHub inbox: read-only jobs, no shell execution of issue content.

Runs only when intentionally invoked locally. No service installation, no ssh,
no arbitrary command execution, and no modification of the MONI runtime.
"""
import argparse
import ast
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any

REPO = "LVTP2004/lvtransport-platform"
AUTHOR = "leovargas-max"
PREFIX = "[MONI-JOB] "
BODY_PREFIX = "MONI_JOB_V1\n"
RESULT_PREFIX = "MONI_RESULT_V1"
TASKS = frozenset(("ping", "runtime_inventory"))
RUNTIME = Path.home() / "MONI_V10_UNIFIED_RUNTIME/runtime/conversation"
RUNTIME_FILES = ("moni_chat.py", "llm_router.py", "context_builder.py",
                 "conversation_memory.py")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")


class TaskRejected(ValueError):
    pass


class GitHubFailure(RuntimeError):
    pass


def decode_request(issue: dict, now: datetime | None = None) -> dict:
    """Verify author, target, expiration, task and minimal JSON envelope."""
    if now is None:
        now = datetime.now(timezone.utc)
    if issue.get("state") != "open" or issue.get("pull_request"):
        raise TaskRejected("not an open issue")
    if not isinstance(issue.get("user"), dict) or issue["user"].get("login") != AUTHOR:
        raise TaskRejected("untrusted issue author")
    number = issue.get("number")
    if type(number) is not int or number <= 0:
        raise TaskRejected("invalid issue number")
    title = issue.get("title")
    body = issue.get("body")
    if not isinstance(title, str) or not title.startswith(PREFIX):
        raise TaskRejected("not a MONI job")
    if not isinstance(body, str) or len(body) > 1200 or not body.startswith(BODY_PREFIX):
        raise TaskRejected("invalid job envelope")
    try:
        obj = json.loads(body[len(BODY_PREFIX):])
    except (ValueError, TypeError) as exc:
        raise TaskRejected("invalid JSON job request") from exc
    if not isinstance(obj, dict) or set(obj) != {"schema", "task", "request_id", "expires_at", "target"}:
        raise TaskRejected("invalid job fields")
    task = obj["task"]
    if type(task) is not str or task not in TASKS or title != PREFIX + task:
        raise TaskRejected("task not on allowlist")
    if obj["schema"] != 1 or obj["target"] != "minisforum":
        raise TaskRejected("wrong job schema or target")
    rid = obj["request_id"]
    if type(rid) is not str or not UUID_RE.fullmatch(rid):
        raise TaskRejected("invalid request id")
    if type(obj["expires_at"]) is not str:
        raise TaskRejected("invalid expiry")
    try:
        expires = datetime.fromisoformat(obj["expires_at"].replace("Z", "+00:00"))
    except ValueError as exc:
        raise TaskRejected("invalid ISO expiry") from exc
    if expires.tzinfo is None or not (now < expires <= now + timedelta(days=7)):
        raise TaskRejected("job expired or exceeds seven-day maximum")
    return {"issue": number, "task": task, "request_id": rid}


def inventory(root: Path = RUNTIME) -> dict[str, Any]:
    """Only disclose existence and syntax validity; never source or file paths."""
    result = {}
    for name in RUNTIME_FILES:
        path = root / name
        if path.is_symlink() or not path.is_file():
            result[name] = {"present": False, "syntax_ok": False}
            continue
        try:
            tree = ast.parse(path.read_text(encoding="utf-8"))
            result[name] = {"present": True, "syntax_ok": True,
                            "function_count": sum(isinstance(n, (ast.FunctionDef,
                                                ast.AsyncFunctionDef)) for n in tree.body)}
        except (OSError, UnicodeError, SyntaxError):
            result[name] = {"present": True, "syntax_ok": False}
    return {"modules": result, "read_only": True}


def execute_readonly(task: str, root: Path = RUNTIME) -> dict:
    if task == "ping":
        return {"ready": True, "bridge": "moni-v10-github-inbox-v1",
                "mode": "READ_ONLY", "shell_execution": False}
    if task == "runtime_inventory":
        return inventory(root)
    raise TaskRejected("task not allowed")


def gh_api(path: str, method: str = "GET", payload: dict | None = None) -> Any:
    """Fixed GitHub API argv. Never interpolate untrusted issue body into argv."""
    argv = ["gh", "api", "-X", method]
    if payload is not None:
        argv.extend(["--input", "-"])
    argv.append(path)
    try:
        completed = subprocess.run(argv, input=(json.dumps(payload) if payload is not None else None),
                                   capture_output=True, text=True, check=True, timeout=25)
        return json.loads(completed.stdout)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
            json.JSONDecodeError, FileNotFoundError) as exc:
        raise GitHubFailure("GitHub API unavailable; no job executed") from exc


def result_marker(issue: int, request_id: str) -> str:
    return f"<!-- {RESULT_PREFIX}:{issue}:{request_id} -->"


def formatted_result(job: dict, result: dict) -> str:
    marker = result_marker(job["issue"], job["request_id"])
    # All output keys and values are produced locally; no issue text is echoed.
    compact = json.dumps({"schema": 1, "job": job["task"], "result": result},
                         sort_keys=True, separators=(",", ":"))
    return f"{marker}\nMONI V10 — resultado automático de diagnóstico, solo lectura.\n\n{compact}"


def already_reported(issue: int, rid: str, api=gh_api) -> bool:
    data = api(f"repos/{REPO}/issues/{issue}/comments?per_page=100")
    marker = result_marker(issue, rid)
    if not isinstance(data, list):
        raise GitHubFailure("unexpected GitHub comments payload")
    # Only trust an authorized account's prior signed-in comment.
    return any(isinstance(x, dict) and
               isinstance(x.get("user"), dict) and
               x["user"].get("login") == AUTHOR and
               marker in (x.get("body") or "") for x in data)


def run_once(*, publish: bool = False, api=gh_api, root: Path = RUNTIME,
             now: datetime | None = None) -> list[dict]:
    if now is None:
        now = datetime.now(timezone.utc)
    issues = api(f"repos/{REPO}/issues?state=open&per_page=100")
    if not isinstance(issues, list):
        raise GitHubFailure("unexpected issues payload")
    output = []
    for issue in issues:
        if len(output) >= 10:
            break
        try:
            job = decode_request(issue, now)
        except TaskRejected:
            continue
        # Read-only operations only. No arbitrary shell commands from requests.
        result = execute_readonly(job["task"], root)
        row = {"issue": job["issue"], "task": job["task"], "result": result,
               "published": False}
        if publish:
            if already_reported(job["issue"], job["request_id"], api):
                row["skipped_existing"] = True
            else:
                api(f"repos/{REPO}/issues/{job['issue']}/comments", "POST",
                    {"body": formatted_result(job, result)})
                row["published"] = True
        output.append(row)
    return output


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="MONI V10 allowlisted GitHub job inbox")
    parser.add_argument("--once", action="store_true", required=True,
                        help="Fetch at most 10 read-only jobs then exit")
    parser.add_argument("--publish-readonly", action="store_true",
                        help="Return sanitized results to public GitHub issues")
    args = parser.parse_args(argv)
    try:
        results = run_once(publish=args.publish_readonly)
    except (GitHubFailure, TaskRejected) as exc:
        print(json.dumps({"status": "ERROR", "reason": str(exc)}, ensure_ascii=False))
        return 2
    print(json.dumps({"status": "OK", "dry_run": not args.publish_readonly,
                      "results": results}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
