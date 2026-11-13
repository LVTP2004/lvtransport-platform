"""Synthetic private-I/O doubles; no real approval, account, token or API call."""
import base64
import copy
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("authority", ROOT / "tools/founder_os/github_review_authority.py")
a = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = a
spec.loader.exec_module(a)


class ProtectedReviewTests(unittest.TestCase):
    def setUp(self):
        self.f = json.loads((ROOT / "tests/fixtures/github-review-authority.json").read_bytes())
        self.record = self.f["record"]
        self.policy = a.AuthorityPolicy("LVTP2004/lvtransport-platform", "main", "proposals/synthetic.json",
                                        frozenset({2}), ("synthetic-project", "none", ("proposal.review",)))
        self.now = datetime(2026, 11, 13, 12, 1, tzinfo=timezone.utc)
        self.calls = []

    def get(self, path):
        self.calls.append(path)
        if path.endswith("/protection"): key = "protection"
        elif "/rules/branches/" in path: key = "rules"
        elif "/branches/" in path: key = "branch"
        elif "/reviews?" in path: key = "reviews"
        elif path.endswith("/permission"): key = "permission"
        elif "/contents/" in path: key = "content"
        else: key = "pr"
        return copy.deepcopy(self.f[key])

    def inspect(self, code=None, policy=True, token="synthetic_test_double_not_a_credential"):
        with patch.object(a.GitHubAPI, "get", side_effect=self.get), \
             patch.object(a.GitHubAPI, "review_gate", side_effect=lambda *_: copy.deepcopy(self.f["gate"])), \
             patch.object(a, "_utcnow", return_value=self.now):
            result = a.register_founder_decision(json.dumps(self.record).encode(),
                                               policy=self.policy if policy else None, token=token)
        self.assertIs(result["can_dispatch"], False)
        self.assertIs(result["approval_granted"], False)
        self.assertEqual(result["operational_status"], "UNKNOWN")
        if code:
            self.assertEqual(result["status"], "BLOCKED")
            self.assertEqual(result["reason_code"], code)
            self.assertFalse(result["review_verified"])
            self.assertIsNone(result["record"])
        return result

    def test_configured_synthetic_source_checks_twice_not_a_live_claim(self):
        before = copy.deepcopy(self.record)
        result = self.inspect()
        self.assertEqual(result["status"], "VERIFIED_REVIEW")
        self.assertTrue(result["review_verified"])
        self.assertEqual(result["record"], before)
        self.assertEqual(self.record, before)
        self.assertEqual(sum("/reviews?" in p for p in self.calls), 2)

    def test_missing_owner_config_or_token_blocks_before_io(self):
        self.inspect("AUTHORITY_POLICY_NOT_CONFIGURED", policy=False)
        self.inspect("GITHUB_READ_TOKEN_REQUIRED", token=None)
        self.assertEqual(self.calls, [])

    def test_current_repository_conditions_block(self):
        self.f["branch"]["protected"] = False
        self.inspect("BRANCH_NOT_PROTECTED")

    def test_no_admin_read_or_api_failure_cannot_become_authorization(self):
        with patch.object(a.GitHubAPI, "get", side_effect=a.Blocked("GITHUB_HTTP_403")):
            result = a.inspect_protected_review(json.dumps(self.record).encode(), policy=self.policy,
                                               token="synthetic_token")
        self.assertEqual(result["reason_code"], "GITHUB_HTTP_403")
        self.assertFalse(result["review_verified"])

    def test_protection_bypass_missing_staleness_or_codeowners_unsupported(self):
        self.f["protection"]["required_pull_request_reviews"]["dismiss_stale_reviews"] = False
        self.inspect("REVIEW_PROTECTION_INSUFFICIENT")
        self.setUp()
        self.f["protection"]["required_pull_request_reviews"]["bypass_pull_request_allowances"]["users"] = [{"id": 2}]
        self.inspect("REVIEW_BYPASS_NOT_ALLOWED")
        self.setUp()
        self.f["protection"]["required_pull_request_reviews"]["require_code_owner_reviews"] = True
        self.inspect("REVIEW_REQUIREMENTS_UNSUPPORTED")

    def test_active_ruleset_or_github_review_gate_unclear_blocks(self):
        self.f["rules"] = [{"type": "pull_request"}]
        self.inspect("ACTIVE_RULESET_REQUIRES_ADAPTER")
        self.setUp()
        self.f["gate"]["reviewDecision"] = "REVIEW_REQUIRED"
        self.inspect("GITHUB_REVIEW_GATE_NOT_SATISFIED")

    def test_draft_closed_fork_or_changed_head_blocks(self):
        self.f["pr"]["draft"] = True
        self.inspect("PR_NOT_OPEN_READY")
        self.setUp()
        self.f["pr"]["head"]["sha"] = "c" * 40
        self.inspect("PR_LOCATION_OR_HEAD_CHANGED")
        self.setUp()
        self.f["pr"]["head"]["repo"]["full_name"] = "OTHER/fork"
        self.inspect("PR_LOCATION_OR_HEAD_CHANGED")

    def test_actor_id_bot_author_or_permission_denied_blocks(self):
        self.f["reviews"][0]["user"]["type"] = "Bot"
        self.inspect("ACTOR_NOT_ENROLLED_OR_SELF_APPROVAL")
        self.setUp()
        self.f["pr"]["user"]["id"] = 2
        self.inspect("ACTOR_NOT_ENROLLED_OR_SELF_APPROVAL")
        self.setUp()
        self.f["permission"]["permission"] = "read"
        self.inspect("ACTOR_PERMISSION_UNVERIFIABLE")

    def test_dismissed_stale_or_superseded_review_blocks(self):
        self.f["reviews"][0]["state"] = "DISMISSED"
        self.inspect("REVIEW_NOT_APPROVED_FOR_HEAD")
        self.setUp()
        newer = copy.deepcopy(self.f["reviews"][0]); newer.update(id=23, submitted_at="2026-11-13T12:00:01Z", state="CHANGES_REQUESTED")
        self.f["reviews"].append(newer)
        self.inspect("REVIEW_SUPERSEDED")

    def test_ordinary_code_review_without_explicit_intent_is_not_authority(self):
        self.f["reviews"][0]["body"] = "LGTM"
        self.inspect("GITHUB_OR_INPUT_UNVERIFIABLE")
        self.setUp()
        intent = json.loads(self.f["reviews"][0]["body"]); intent["scope_sha256"] = "d" * 64
        self.f["reviews"][0]["body"] = json.dumps(intent)
        self.inspect("REVIEW_INTENT_MISMATCH")

    def test_expired_or_changed_issued_at_and_rejected_intent_block(self):
        self.now = datetime(2026, 11, 13, 12, 10, tzinfo=timezone.utc)
        self.inspect("REVIEW_EXPIRED_OR_FUTURE")
        self.setUp(); self.record["issued_at"] = "2026-11-13T11:59:59Z"
        self.inspect("REVIEW_ISSUED_AT_MISMATCH")
        self.setUp(); self.record["decision"] = "REJECT"
        self.inspect("DECISION_NOT_APPROVAL")

    def test_tampered_bytes_scope_or_fake_verified_field_block(self):
        self.f["content"]["content"] = base64.b64encode(b"altered").decode()
        self.inspect("GIT_BLOB_MISMATCH")
        self.setUp(); self.record["scope"]["operations"] = ["service.restart"]
        self.inspect("RECORD_SCOPE_NOT_ALLOWED")
        self.setUp(); self.record["authenticated"] = True
        self.inspect("INVALID_FIELDS")

    def test_snapshot_race_blocks_even_when_both_individually_eligible(self):
        original = self.get
        count = 0
        def changing(path):
            nonlocal count
            response = original(path)
            if path.endswith("/permission"):
                count += 1
                if count == 2: response["user"]["untrusted_extra"] = True
            return response
        self.get = changing
        self.inspect("GITHUB_STATE_CHANGED_DURING_VERIFICATION")

    def test_reference_atlas_proposal_bytes_work_without_importing_atlas_engine(self):
        p = {"schema": "moni/atlas-vnext-data/v1-draft", "kind": "proposal", "data": {
            "proposal_id": "synthetic-atlas", "created_at": "2026-11-13T11:59:59Z", "scope": self.record["scope"],
            "sources": [{"repository": "LVTP2004/lvtransport-platform", "commit": "c" * 40, "path": "synthetic/input.txt", "sha256": "d" * 64, "observed_at": "2026-11-13T11:59:00Z", "source_node": "unattributed"}], "claims": [{"claim_id": "synthetic", "classification": "proposal", "origin": "human", "text": "Synthetic only", "source_indexes": [0]}]}, "policy": {
            "trust": "UNVERIFIED", "operational_status": "UNKNOWN", "identity_verified": False,
            "authorization_verified": False, "approval_granted": False, "can_dispatch": False, "production_allowed": False}}
        raw = json.dumps(p).encode(); sha = hashlib.sha256(raw).hexdigest()
        self.f["content"].update(content=base64.b64encode(raw).decode(), size=len(raw),
            sha=hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest())
        self.record["proposal_sha256"] = sha
        intent = json.loads(self.f["reviews"][0]["body"]); intent["proposal_sha256"] = sha
        self.f["reviews"][0]["body"] = json.dumps(intent)
        self.assertTrue(self.inspect()["review_verified"])

    def test_tls_fixed_host_no_redirects_and_no_secret_error_output(self):
        connection = MagicMock(); response = connection.getresponse.return_value
        response.status = 302
        with patch.object(a, "HTTPSConnection", return_value=connection) as ctor:
            api = a.GitHubAPI("synthetic_token")
            with self.assertRaises(a.Blocked): api.get("/repos/example/project")
        self.assertEqual(ctor.call_args.args[0], "api.github.com")
        self.assertTrue(ctor.call_args.kwargs["context"].check_hostname)
        connection.close.assert_called_once()
        with patch.object(a.GitHubAPI, "get", side_effect=RuntimeError("PRIVATE_TOKEN")):
            result = a.inspect_protected_review(json.dumps(self.record).encode(), policy=self.policy, token="synthetic_token")
        self.assertNotIn("PRIVATE_TOKEN", json.dumps(result))


    def test_missing_bypass_metadata_cannot_mean_empty_allowances(self):
        del self.f["protection"]["required_pull_request_reviews"]["bypass_pull_request_allowances"]
        self.inspect("REVIEW_BYPASS_NOT_ALLOWED")

    def test_mutable_or_unverifiable_protected_branch_blocks(self):
        for field in ("allow_force_pushes", "allow_deletions"):
            self.setUp()
            self.f["protection"][field]["enabled"] = True
            self.inspect("PROTECTED_BRANCH_MUTABILITY_UNVERIFIABLE")
            del self.f["protection"][field]
            self.inspect("PROTECTED_BRANCH_MUTABILITY_UNVERIFIABLE")

    def test_later_comment_is_not_approval_and_does_not_revoke_explicit_approval(self):
        comment = copy.deepcopy(self.f["reviews"][0])
        comment.update(id=23, state="COMMENTED", submitted_at="2026-11-13T12:00:01Z", body="ordinary comment")
        self.f["reviews"].append(comment)
        self.assertTrue(self.inspect()["review_verified"])
        self.f["reviews"] = [comment]
        self.inspect("REVIEW_NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
