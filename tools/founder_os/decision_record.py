"""Offline binding checks for unverified Founder OS candidates, never authority.

No file/network/clock reads, identity callbacks, persistence or execution. The
caller supplies pinned proposal bytes, independently expected location and UTC
time. Even a complete match cannot authenticate that caller, location or person.
The commercial API and its auth providers are deliberately not imported.
"""
import hashlib
import json
import re
from datetime import datetime, timedelta
from urllib.parse import urlsplit

MAX_RECORD_BYTES = 16 * 1024
MAX_PROPOSAL_BYTES = 1024 * 1024
IDENT = r"[A-Za-z0-9_.:-]{1,128}"
SCOPE = {"capability", "target_node", "instance_id", "environment", "policy_version"}
PROPOSAL = {"id", "revision", "repository", "path", "hash_profile", "file_sha256", "expires_at"}
ACTOR = {"issuer", "subject", "authenticated_at", "evidence_ref", "verification_status"}
FIELDS = {"schema", "record_state", "approval_id", "request_id", "proposal", "scope",
          "actor", "decision", "reason_code", "reason", "received_at", "issued_at",
          "expires_at", "challenge_ref", "integrity_ref", "journal_ref",
          "revocation_status", "authentication_verified", "approval_granted",
          "can_dispatch", "operational_status"}
CONSTANTS = {
    "schema": "founder/approval-record/v1-draft", "record_state": "UNVERIFIED_CANDIDATE",
    "revocation_status": "NOT_CHECKED", "authentication_verified": False,
    "approval_granted": False, "can_dispatch": False, "operational_status": "UNKNOWN",
    "integrity_ref": None, "journal_ref": None,
}


def _match(pattern, value):
    return type(value) is str and re.fullmatch(pattern, value) is not None


def _object(value, fields):
    return type(value) is dict and set(value) == fields


def _scope(value):
    return (_object(value, SCOPE)
            and all(_match(IDENT, value[k]) for k in SCOPE - {"capability"})
            and _match(r"[a-z][a-z0-9_.:-]{0,127}", value["capability"]))


def _text(value, limit):
    return (type(value) is str and 0 < len(value) <= limit
            and not re.search(r"[\x00-\x1f\x7f]", value))


def _utc(value):
    if not _match(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z", value):
        raise ValueError("UTC timestamp required")
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if not 1970 <= result.year <= 9998:
        raise ValueError("unsupported timestamp")
    return result


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise ValueError("duplicate key")
        result[key] = value
    return result


def _number(_value):
    # This contract uses strings/booleans/null, not numbers. No NaN or Infinity.
    raise ValueError("numbers unsupported")


def _parse(raw, limit):
    if type(raw) is not bytes or not 0 < len(raw) <= limit:
        raise ValueError("bounded UTF-8 bytes required")
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs,
                      parse_constant=_number, parse_float=_number, parse_int=_number)


def _shape(record):
    if not _object(record, FIELDS):
        return False
    if any(type(record[k]) is not type(v) or record[k] != v for k, v in CONSTANTS.items()):
        return False
    if not all(_match(IDENT, record[k]) for k in ("approval_id", "request_id", "challenge_ref")):
        return False
    if (record["decision"] not in ("APPROVE", "REJECT")
            or not _match(r"[A-Z0-9_]{1,64}", record["reason_code"])
            or not _text(record["reason"], 512) or not _scope(record["scope"])):
        return False
    p, a = record["proposal"], record["actor"]
    if not _object(p, PROPOSAL) or not _object(a, ACTOR):
        return False
    path = p["path"]
    if (not _match(IDENT, p["id"]) or not _match(r"[0-9a-f]{40}", p["revision"])
            or not _match(r"[0-9a-f]{64}", p["file_sha256"])
            or not _text(p["repository"], 200)
            or not _match(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", p["repository"])
            or any(part in {".", "..", ".git"} for part in p["repository"].split("/"))
            or not _text(path, 1024) or not _match(r"[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*", path)
            or any(part in {".", "..", ".git"} for part in path.split("/"))
            or p["hash_profile"] != "EXACT_MANIFEST_BYTES_V1"):
        return False
    if (not _text(a["issuer"], 512) or not urlsplit(a["issuer"]).scheme
            or not _text(a["subject"], 128) or a["authenticated_at"] is not None
            or a["evidence_ref"] is not None or a["verification_status"] != "UNVERIFIED"):
        return False
    return True


def _result(reason, matches=False):
    return {"record_state": "UNVERIFIED_CANDIDATE", "reason_code": reason,
            "binding_checks_passed": matches, "authentication_verified": False,
            "revocation_status": "NOT_CHECKED", "approval_granted": False,
            "can_dispatch": False, "operational_status": "UNKNOWN"}


def inspect_record(record_bytes, *, proposal_bytes, expected_locator, now):
    """Check a candidate, not accept/persist an approval or verify a session.

    expected_locator must contain id/repository/revision/path supplied outside
    the candidate. No Git download is performed or authenticated. The frozen
    JSON projection requires proposal_id/scope/expires_at; other proposal fields
    are opaque and hash-covered. This is NOT a validator of a full action schema.
    All numeric JSON is conservatively rejected in this draft projection.
    Repeated identical candidates are never accepted or claimed replay-protected.
    Errors return fixed codes, never input values, tokens, identities or text.
    """
    try:
        record = _parse(record_bytes, MAX_RECORD_BYTES)
        if not _shape(record):
            return _result("INVALID_CANDIDATE")
        if not _object(expected_locator, {"id", "repository", "revision", "path"}):
            return _result("EXPECTED_LOCATION_REQUIRED")
        if any(type(expected_locator[k]) is not str
               or expected_locator[k] != record["proposal"][k] for k in expected_locator):
            return _result("PROPOSAL_LOCATION_MISMATCH")
        if type(proposal_bytes) is not bytes or not 0 < len(proposal_bytes) <= MAX_PROPOSAL_BYTES:
            return _result("PROPOSAL_BYTES_REQUIRED")
        if hashlib.sha256(proposal_bytes).hexdigest() != record["proposal"]["file_sha256"]:
            return _result("PROPOSAL_HASH_MISMATCH")
        frozen = _parse(proposal_bytes, MAX_PROPOSAL_BYTES)
        if (type(frozen) is not dict or not {"proposal_id", "scope", "expires_at"} <= set(frozen)
                or not _scope(frozen["scope"])):
            return _result("PROPOSAL_PROJECTION_MISSING")
        if frozen["proposal_id"] != record["proposal"]["id"] or frozen["scope"] != record["scope"]:
            return _result("PROPOSAL_SCOPE_MISMATCH")
        if record["proposal"]["expires_at"] != frozen["expires_at"]:
            return _result("PROPOSAL_EXPIRY_MISMATCH")
        if record["approval_id"] == record["request_id"]:
            return _result("DISTINCT_IDS_REQUIRED")
        if (type(now) is not datetime or now.utcoffset() != timedelta(0)
                or not 1970 <= now.year <= 9998):
            return _result("CLOCK_UNVERIFIED")
        received, issued, expires = (_utc(record[k]) for k in ("received_at", "issued_at", "expires_at"))
        if not received <= issued <= now < expires <= _utc(frozen["expires_at"]):
            return _result("EXPIRED_OR_INCONSISTENT_TIME")
        # Even APPROVE + matching hashes/scope/time cannot verify a human.
        return _result("IDENTITY_AND_DURABLE_APPROVAL_NOT_CONFIGURED", True)
    except (ValueError, TypeError, OverflowError, RecursionError):
        return _result("INVALID_CANDIDATE_OR_PROPOSAL")
