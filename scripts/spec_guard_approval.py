#!/usr/bin/env python3
"""Verify a signed, GitHub-bound receipt for protected paths.

Run only from a trusted checkout. Success validates scope, never a merge.
"""
import argparse
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
import urllib.error
import urllib.request


REPOSITORY = "LVTP2004/lvtransport-platform"
NAMESPACE = "spec-guard@lvtransport.be"
SCHEMA = "lvtransport-spec-guard/v1"
SHA = re.compile(r"[0-9a-f]{40}")
UTC_TIME = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z")
PROTECTED = re.compile(
    rb"^(apps/api/|apps/admin/|apps/web/src/pages/Admin\.tsx|"
    rb"apps/web/src/pages/Driver\.tsx|package\.json|pnpm-lock\.yaml|\.github/)"
)
SIGNATURE_HEADER = "-----BEGIN SSH SIGNATURE-----\n"
SIGNATURE = re.compile(
    r"-----BEGIN SSH SIGNATURE-----\n(?:[A-Za-z0-9+/=]+\n)+"
    r"-----END SSH SIGNATURE-----\n?"
)
MAX_RECEIPT_LENGTH = 8192
MAX_APPROVAL_AGE = timedelta(hours=24)


class ApprovalError(ValueError):
    pass


def require(condition, reason):
    if not condition:
        raise ApprovalError(reason)


@dataclass(frozen=True)
class Scope:
    pr: int
    comment_id: int
    owner_id: int
    base_sha: str
    head_sha: str
    paths_sha256: str

    def message(self, approved_at: str) -> str:
        return (
            f"schema={SCHEMA}\nrepository={REPOSITORY}\npull_request={self.pr}\n"
            f"comment_id={self.comment_id}\nowner_id={self.owner_id}\nbase_ref=main\n"
            f"base_sha={self.base_sha}\nhead_sha={self.head_sha}\n"
            f"protected_paths_sha256={self.paths_sha256}\n"
            f"decision=approve-protected-scope\napproved_at={approved_at}\n"
        )


def protected_paths(repository: Path, base_sha: str, head_sha: str) -> list[bytes]:
    for sha in (base_sha, head_sha):
        require(isinstance(sha, str) and SHA.fullmatch(sha), "Invalid commit identifier")
    result = subprocess.run(
        ["git", "--no-replace-objects", "-C", str(repository), "diff", "--no-ext-diff",
         "--no-textconv", "--no-renames", "--name-only", "-z", f"{base_sha}...{head_sha}", "--"],
        check=True, capture_output=True, timeout=20,
    )
    paths = {name for name in result.stdout.split(b"\0") if PROTECTED.match(name)}
    return sorted(paths)


def scope_from_github(pr, comment, expected_pr, expected_comment, owner_id, repository):
    require(type(owner_id) is int and owner_id > 0, "Owner ID must be configured by a trusted operator")
    require(pr.get("number") == expected_pr and pr.get("state") == "open", "Unexpected or closed PR")
    base, head = pr["base"], pr["head"]
    require(base["ref"] == "main" and base["repo"]["full_name"] == REPOSITORY
            and head["repo"]["full_name"] == REPOSITORY, "Unexpected repository or base branch")
    require(comment.get("id") == expected_comment
            and comment.get("issue_url") == f"https://api.github.com/repos/{REPOSITORY}/issues/{expected_pr}",
            "Comment does not belong to this PR")
    require(comment.get("user", {}).get("id") == owner_id
            and comment["user"].get("type") == "User" and comment.get("performed_via_github_app") is None,
            "Comment is not directly attributable to the configured owner")
    paths = protected_paths(repository, base["sha"], head["sha"])
    require(paths, "No protected paths require this receipt")
    digest = hashlib.sha256(b"\0".join(paths) + b"\0").hexdigest()
    return Scope(expected_pr, expected_comment, owner_id, base["sha"], head["sha"], digest)


def verify(comment, scope: Scope, allowed_signers: Path, now: datetime):
    body = comment.get("body")
    require(isinstance(body, str) and len(body) <= MAX_RECEIPT_LENGTH, "Invalid receipt size")
    document = body.replace("\r\n", "\n")
    position = document.find(SIGNATURE_HEADER)
    require(position > 0, "Missing SSH signature")
    payload, signature = document[:position], document[position:]
    require(SIGNATURE.fullmatch(signature), "Invalid SSH signature format")
    line = payload.splitlines()[-1]
    approved_at = line.removeprefix("approved_at=")
    require(UTC_TIME.fullmatch(approved_at), "Invalid approval timestamp")
    require(payload == scope.message(approved_at), "Receipt does not match the current scope")
    try:
        timestamp = datetime.strptime(approved_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        raise ApprovalError("Invalid approval timestamp") from None
    require(timestamp <= now <= timestamp + MAX_APPROVAL_AGE, "Receipt is expired or future-dated")
    require(allowed_signers.is_file(), "Trusted signer configuration is missing")
    with TemporaryDirectory(prefix="lvtp-spec-guard-") as temp:
        signature_file = Path(temp) / "receipt.sig"
        signature_file.write_text(signature + ("" if signature.endswith("\n") else "\n"), encoding="ascii")
        result = subprocess.run(
            ["ssh-keygen", "-Y", "verify", "-f", str(allowed_signers.resolve()), "-I",
             f"github-user-{scope.owner_id}", "-n", NAMESPACE, "-s", str(signature_file)],
            input=payload.encode("ascii"), capture_output=True, timeout=10,
        )
    require(result.returncode == 0, "Signature is not valid for the configured owner")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def read_github(path: str, token: str):
    opener = urllib.request.build_opener(NoRedirect())
    request = urllib.request.Request(f"https://api.github.com/repos/{REPOSITORY}/{path}", headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "LVTransport-Spec-Guard",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with opener.open(request, timeout=10) as response:
        data = response.read(524289)
    require(len(data) <= 524288, "GitHub response too large")
    return json.loads(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr", type=int, required=True)
    parser.add_argument("--comment-id", type=int, required=True)
    parser.add_argument("--owner-id", type=int, required=True)
    parser.add_argument("--repository-dir", type=Path, required=True)
    parser.add_argument("--allowed-signers", type=Path, required=True)
    args = parser.parse_args()
    try:
        require(args.pr > 0 and args.comment_id > 0, "Positive PR and comment IDs required")
        token = os.environ.get("GH_TOKEN")
        require(token, "A read-only GitHub credential is required")
        pr_route = f"pulls/{args.pr}"
        comment_route = f"issues/comments/{args.comment_id}"
        pr, comment = read_github(pr_route, token), read_github(comment_route, token)
        scope = scope_from_github(pr, comment, args.pr, args.comment_id, args.owner_id, args.repository_dir)
        verify(comment, scope, args.allowed_signers, datetime.now(timezone.utc))
        current_pr, current_comment = read_github(pr_route, token), read_github(comment_route, token)
        current_scope = scope_from_github(current_pr, current_comment, args.pr, args.comment_id,
                                          args.owner_id, args.repository_dir)
        require(current_scope == scope and current_comment["body"] == comment["body"],
                "PR or receipt changed during verification")
        print(json.dumps({"result": "verified-protected-scope", "pr": scope.pr,
                          "head_sha": scope.head_sha, "protected_paths_sha256": scope.paths_sha256}))
    except ApprovalError as error:
        print(f"Spec Guard receipt rejected: {error}", file=sys.stderr)
        return 1
    except (KeyError, TypeError, ValueError, OSError, subprocess.SubprocessError):
        print("Spec Guard receipt could not be verified", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
