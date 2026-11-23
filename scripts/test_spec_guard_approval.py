import copy
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from pathlib import Path
import io
import subprocess
import tempfile
import unittest
from unittest.mock import patch


import spec_guard_approval as guard


class SpecGuardApprovalTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        self.repo = self.root / "repo"
        self.repo.mkdir()
        self.run_command("git", "init", "-q")
        self.run_command("git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid",
                         "commit", "--allow-empty", "-qm", "base")
        base = self.run_command("git", "rev-parse", "HEAD").strip()
        for name in ("apps/api/a.ts", "apps/admin/b.ts", "README.md"):
            file = self.repo / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text("synthetic\n")
        self.run_command("git", "add", ".")
        self.run_command("git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid",
                         "commit", "-qm", "candidate")
        head = self.run_command("git", "rev-parse", "HEAD").strip()
        self.pr = {"number": 7, "state": "open",
                   "base": {"sha": base, "ref": "main", "repo": {"full_name": guard.REPOSITORY}},
                   "head": {"sha": head, "repo": {"full_name": guard.REPOSITORY}}}
        self.comment = {"id": 12, "issue_url": f"https://api.github.com/repos/{guard.REPOSITORY}/issues/7",
                        "user": {"id": 42, "type": "User"}, "performed_via_github_app": None}
        self.scope = guard.scope_from_github(self.pr, self.comment, 7, 12, 42, self.repo)
        self.receipt_number = 0
        self.time = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)
        self.key = self.root / "test-owner"
        self.other_key = self.root / "test-other"
        for key in (self.key, self.other_key):
            self.run_command("ssh-keygen", "-q", "-t", "ed25519", "-N", "", "-f", str(key))
        self.allowed = self.root / "allowed"
        self.allowed.write_text("github-user-42 " + Path(str(self.key) + ".pub").read_text())

    def run_command(self, *command):
        return subprocess.run(command, cwd=self.repo, capture_output=True, check=True,
                              timeout=10, text=True).stdout

    def sign(self, scope=None, key=None, time=None, namespace=guard.NAMESPACE):
        message = (scope or self.scope).message((time or self.time).strftime("%Y-%m-%dT%H:%M:%SZ"))
        self.receipt_number += 1
        receipt = self.root / f"receipt-{self.receipt_number}"
        receipt.write_text(message)
        self.run_command("ssh-keygen", "-Y", "sign", "-f", str(key or self.key), "-n", namespace, str(receipt))
        return {**self.comment, "body": message + Path(str(receipt) + ".sig").read_text()}

    def test_exact_owner_receipt_and_protected_path_digest(self):
        self.assertEqual(guard.protected_paths(self.repo, self.scope.base_sha, self.scope.head_sha),
                         [b"apps/admin/b.ts", b"apps/api/a.ts"])
        self.assertEqual(len(self.scope.paths_sha256), 64)
        guard.verify(self.sign(), self.scope, self.allowed, self.time)

    def test_receipt_fails_for_another_pr_comment_owner_base_head_or_digest(self):
        signed = self.sign()
        for delta in [
            {"pr": 8}, {"comment_id": 13}, {"owner_id": 43}, {"base_sha": "a" * 40},
            {"head_sha": "b" * 40}, {"paths_sha256": "c" * 64},
        ]:
            with self.subTest(delta=delta), self.assertRaises(guard.ApprovalError):
                guard.verify(signed, replace(self.scope, **delta), self.allowed, self.time)

    def test_unsigned_untrusted_key_expiration_and_wrong_namespace_fail(self):
        invalid = [
            {**self.comment, "body": "approved"},
            self.sign(key=self.other_key),
            self.sign(time=self.time - timedelta(hours=25)),
            self.sign(time=self.time + timedelta(seconds=1)),
            self.sign(namespace="unrelated@example.invalid"),
        ]
        for receipt in invalid:
            with self.assertRaises(guard.ApprovalError):
                guard.verify(receipt, self.scope, self.allowed, self.time)

    def test_github_metadata_rejects_bot_delegation_closed_pr_and_fork(self):
        for overrides in [
            {"user": {"id": 43, "type": "User"}},
            {"user": {"id": 42, "type": "Bot"}},
            {"performed_via_github_app": {"id": 1}},
            {"issue_url": f"https://api.github.com/repos/{guard.REPOSITORY}/issues/8"},
        ]:
            with self.assertRaises(guard.ApprovalError):
                guard.scope_from_github(self.pr, {**self.comment, **overrides}, 7, 12, 42, self.repo)
        bad_pr = copy.deepcopy(self.pr)
        bad_pr["head"]["repo"]["full_name"] = "external/fork"
        for pr in (bad_pr, {**self.pr, "state": "closed"}):
            with self.assertRaises(guard.ApprovalError):
                guard.scope_from_github(pr, self.comment, 7, 12, 42, self.repo)

    def test_rechecks_receipt_against_live_github_state(self):
        now = datetime.now(timezone.utc).replace(microsecond=0)
        signed = self.sign(time=now)
        argv = ["spec_guard_approval.py", "--pr", "7", "--comment-id", "12", "--owner-id", "42",
                "--repository-dir", str(self.repo), "--allowed-signers", str(self.allowed)]
        for latest, expected in [(signed, 0), ({**signed, "body": "withdrawn"}, 1)]:
            with patch.dict("os.environ", {"GH_TOKEN": "synthetic-token"}), patch("sys.argv", argv), \
                 patch.object(guard, "read_github", side_effect=[self.pr, signed, self.pr, latest]), \
                 redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                self.assertEqual(guard.main(), expected)

    def test_protected_rename_accounts_for_both_paths(self):
        self.run_command("git", "mv", "apps/api/a.ts", "apps/admin/a.ts")
        self.run_command("git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid",
                         "commit", "-qm", "rename")
        renamed = self.run_command("git", "rev-parse", "HEAD").strip()
        self.assertEqual(guard.protected_paths(self.repo, self.scope.head_sha, renamed),
                         [b"apps/admin/a.ts", b"apps/api/a.ts"])


if __name__ == "__main__":
    unittest.main()
