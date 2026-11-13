"""Synthetic offline candidates only; no user/session/provider or runtime calls."""
import copy
import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("decision_record", ROOT / "tools/founder_os/decision_record.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def raw(value):
    return json.dumps(value, separators=(",", ":")).encode()


class DecisionRecordTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 13, 12, 0, 1, tzinfo=timezone.utc)
        scope = dict(capability="node.status", target_node="aspire", instance_id="synthetic-instance",
                     environment="synthetic", policy_version="synthetic-v1")
        self.frozen = dict(proposal_id="synthetic-proposal", scope=scope,
                           expires_at="2026-11-13T12:01:00Z", action="synthetic-no-execution")
        self.proposal = raw(self.frozen)
        self.locator = dict(id="synthetic-proposal", repository="LVTP2004/lvtransport-platform",
                            revision="a" * 40, path="synthetic/proposal.json")
        self.record = dict(module.CONSTANTS, approval_id="synthetic-decision", request_id="synthetic-request",
            proposal=dict(self.locator, expires_at=self.frozen["expires_at"], hash_profile="EXACT_MANIFEST_BYTES_V1",
                          file_sha256=hashlib.sha256(self.proposal).hexdigest()), scope=copy.deepcopy(scope),
            actor=dict(issuer="urn:synthetic:unverified", subject="synthetic-claim",
                       authenticated_at=None, evidence_ref=None, verification_status="UNVERIFIED"),
            decision="APPROVE", reason_code="SYNTHETIC_REVIEW", reason="Synthetic offline test only",
            received_at="2026-11-13T12:00:00Z", issued_at="2026-11-13T12:00:00Z",
            expires_at="2026-11-13T12:00:30Z", challenge_ref="synthetic-reference-not-consumed")

    def inspect(self, expected=None, **changes):
        args = dict(proposal_bytes=self.proposal, expected_locator=self.locator, now=self.now)
        args.update(changes)
        result = module.inspect_record(raw(self.record), **args)
        for key in ("authentication_verified", "approval_granted", "can_dispatch"):
            self.assertIs(result[key], False)
        self.assertEqual(result["operational_status"], "UNKNOWN")
        self.assertEqual(result["record_state"], "UNVERIFIED_CANDIDATE")
        self.assertEqual(result["revocation_status"], "NOT_CHECKED")
        if expected:
            self.assertEqual(result["reason_code"], expected)
        return result

    def test_matching_approve_is_unverified_and_does_not_grant_authority(self):
        result = self.inspect("IDENTITY_AND_DURABLE_APPROVAL_NOT_CONFIGURED")
        self.assertTrue(result["binding_checks_passed"])

    def test_copied_proposal_expiry_must_match_frozen_bytes(self):
        self.record["proposal"]["expires_at"] = "2026-11-13T12:02:00Z"
        self.inspect("PROPOSAL_EXPIRY_MISMATCH")

    def test_reject_is_never_a_permission(self):
        self.record["decision"] = "REJECT"
        self.inspect("IDENTITY_AND_DURABLE_APPROVAL_NOT_CONFIGURED")

    def test_anonymous_actor_and_client_verification_flags_cannot_authenticate(self):
        original = copy.deepcopy(self.record)
        for key in ("authentication_verified", "approval_granted", "can_dispatch"):
            self.record = copy.deepcopy(original)
            self.record[key] = True
            self.inspect("INVALID_CANDIDATE")
        for actor in (None, {}, dict(original["actor"], verification_status="VERIFIED"),
                      dict(original["actor"], authenticated_at="2026-11-13T12:00:00Z")):
            self.record = dict(original, actor=actor)
            self.inspect("INVALID_CANDIDATE")

    def test_exact_bytes_including_whitespace_must_match(self):
        self.inspect("PROPOSAL_HASH_MISMATCH", proposal_bytes=self.proposal + b"\n")
        self.inspect("PROPOSAL_HASH_MISMATCH", proposal_bytes=raw(dict(self.frozen, action="changed")))

    def test_every_scope_field_and_proposal_id_are_bound(self):
        for key in self.record["scope"]:
            original = self.record["scope"][key]
            self.record["scope"][key] = "other"
            self.inspect("PROPOSAL_SCOPE_MISMATCH")
            self.record["scope"][key] = original
        self.frozen["proposal_id"] = "other"
        self.proposal = raw(self.frozen)
        self.record["proposal"]["file_sha256"] = hashlib.sha256(self.proposal).hexdigest()
        self.inspect("PROPOSAL_SCOPE_MISMATCH")

    def test_location_is_expected_independently_and_missing_context_fails(self):
        self.inspect("EXPECTED_LOCATION_REQUIRED", expected_locator=None)
        for key in self.locator:
            self.inspect("PROPOSAL_LOCATION_MISMATCH", expected_locator=dict(self.locator, **{key: "other"}))

    def test_expiry_boundary_future_or_inconsistent_times_fail(self):
        original = copy.deepcopy(self.record)
        for field, value in (("expires_at", "2026-11-13T12:00:01Z"),
                             ("expires_at", "2026-11-13T12:02:00Z"),
                             ("issued_at", "2026-11-13T12:00:02Z"),
                             ("received_at", "2026-11-13T12:00:01Z")):
            self.record = copy.deepcopy(original)
            self.record[field] = value
            self.inspect("EXPIRED_OR_INCONSISTENT_TIME")

    def test_invalid_or_non_utc_dates_and_clock_do_not_raise_or_authorize(self):
        for stamp in ("2026-02-30T00:00:00Z", "2026-11-13T12:00:00+01:00", None, [], True):
            self.record["expires_at"] = stamp
            self.inspect("INVALID_CANDIDATE_OR_PROPOSAL")
        self.setUp()
        self.inspect("CLOCK_UNVERIFIED", now=self.now.replace(tzinfo=None))

    def test_ids_paths_and_unknown_fields_fail(self):
        self.record["approval_id"] = self.record["request_id"]
        self.inspect("DISTINCT_IDS_REQUIRED")
        self.setUp()
        for path in ("../proposal", "/proposal", "x/.git/data", "x//y", "x/../y"):
            self.record["proposal"]["path"] = path
            self.inspect("INVALID_CANDIDATE")
        self.setUp()
        self.record["actor"]["role"] = "admin"
        self.inspect("INVALID_CANDIDATE")

    def test_byte_bounds_duplicates_invalid_unicode_and_numbers_fail_closed(self):
        bad = [b"", b"\xff", b"x" * (module.MAX_RECORD_BYTES + 1),
               raw(self.record).replace(b'"UNVERIFIED"', b'"UNVERIFIED","verification_status":"VERIFIED"'),
               raw(self.record).replace(b'"APPROVE"', b'NaN'), b'{"x":1,"x":2}']
        for payload in bad:
            result = module.inspect_record(payload, proposal_bytes=self.proposal,
                                            expected_locator=self.locator, now=self.now)
            self.assertFalse(result["approval_granted"])
            self.assertFalse(result["binding_checks_passed"])
        self.inspect("PROPOSAL_BYTES_REQUIRED", proposal_bytes=b"x" * (module.MAX_PROPOSAL_BYTES + 1))

    def test_repetition_and_edited_hash_do_not_create_an_accepted_record(self):
        a, b = self.inspect(), self.inspect()
        self.assertEqual(a, b)
        self.proposal += b"\n"
        self.record["proposal"]["file_sha256"] = hashlib.sha256(self.proposal).hexdigest()
        self.inspect("IDENTITY_AND_DURABLE_APPROVAL_NOT_CONFIGURED")

    def test_proposal_projection_is_required_not_an_action_validator(self):
        self.proposal = b'{}'
        self.record["proposal"]["file_sha256"] = hashlib.sha256(self.proposal).hexdigest()
        self.inspect("PROPOSAL_PROJECTION_MISSING")

    def test_no_io_mutation_or_sensitive_values_in_result(self):
        before = copy.deepcopy(self.record)
        import socket
        import subprocess
        with patch("builtins.open", side_effect=AssertionError("file I/O")), \
             patch.object(socket, "create_connection", side_effect=AssertionError("network")), \
             patch.object(subprocess, "run", side_effect=AssertionError("process")):
            result = self.inspect()
        self.assertEqual(self.record, before)
        self.assertNotIn(self.record["actor"]["subject"], json.dumps(result))
        self.assertNotIn(self.record["reason"], json.dumps(result))

    def test_candidate_field_sets_match_existing_json_schema(self):
        schema = json.loads((ROOT / "docs/architecture/contracts/founder-approval-record.v1.schema.json").read_bytes())
        self.assertEqual(set(schema["required"]), module.FIELDS)
        for name, fields in (("proposal", module.PROPOSAL), ("scope", module.SCOPE), ("actor", module.ACTOR)):
            self.assertEqual(set(schema["properties"][name]["required"]), fields)
        for key, value in module.CONSTANTS.items():
            entry = schema["properties"][key]
            if "const" in entry:
                self.assertEqual(entry["const"], value)


if __name__ == "__main__":
    unittest.main()
