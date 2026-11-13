"""GitHub protected-review authority v1-draft; disabled without owner policy/token.

Only explicit calls perform authenticated HTTPS reads to api.github.com. No
Firebase, node access, storage, review submission, merge or dispatch. A returned
record is an unsigned locator: every consumer MUST reverify live, not trust it.
"""
import base64
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
from http.client import HTTPSConnection
import json
import re
import ssl
from urllib.parse import quote

RECORD_SCHEMA = "founder/github-protected-review/v1-draft"
PROPOSAL_SCHEMA = "founder/authorized-proposal/v1-draft"
INTENT_SCHEMA = "founder/github-review-intent/v1-draft"
ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}\Z")
REPO = re.compile(r"[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+\Z")
SHA40 = re.compile(r"[0-9a-f]{40}\Z")
SHA256 = re.compile(r"[0-9a-f]{64}\Z")
RECORD_FIELDS = {"schema", "repository", "pull_number", "head_sha", "proposal_path",
                 "proposal_sha256", "scope", "actor_id", "review_id", "decision", "issued_at", "expires_at"}


class Blocked(ValueError):
    pass


def require(condition, code):
    if not condition:
        raise Blocked(code)


def _pairs(items):
    result = {}
    for k, v in items:
        require(k not in result, "DUPLICATE_JSON_KEY")
        result[k] = v
    return result


def _constant(_value):
    raise Blocked("INVALID_JSON_NUMBER")


def _json(raw, maximum=65536):
    require(type(raw) is bytes and 0 < len(raw) <= maximum, "JSON_SIZE_OR_TYPE")
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)


def _shape(value, keys):
    require(type(value) is dict and set(value) == keys, "INVALID_FIELDS")


def _stamp(value):
    require(type(value) is str and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z", value), "INVALID_UTC_TIME")
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(1970 <= result.year <= 9998, "INVALID_UTC_TIME")
    return result


def _utcnow():
    return datetime.now(timezone.utc)


def _scope(value):
    _shape(value, {"project", "target_node", "operations"})
    require(all(type(value[k]) is str and ID.fullmatch(value[k]) for k in ("project", "target_node")), "INVALID_SCOPE")
    ops = value["operations"]
    require(type(ops) is list and 0 < len(ops) <= 128
            and all(type(x) is str and ID.fullmatch(x) for x in ops)
            and ops == sorted(set(ops)), "INVALID_SCOPE")
    return (value["project"], value["target_node"], tuple(ops))


def _scope_hash(scope):
    return hashlib.sha256(json.dumps(scope, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def _path(value):
    require(type(value) is str and 0 < len(value) <= 1024 and not value.startswith("/")
            and "\\" not in value and not re.search(r"[\x00-\x1f\x7f]", value)
            and all(x not in {"", ".", "..", ".git"} for x in value.split("/")), "INVALID_PROPOSAL_PATH")


@dataclass(frozen=True)
class AuthorityPolicy:
    """Owner-installed configuration OUTSIDE the proposed commit/request body.

    human_ids is an owner-attested enrollment of GitHub account IDs belonging
    to authorized humans; GitHub User != proof of personhood or per-review MFA.
    expected_scope is (project, target_node, sorted tuple of operations).
    No default enrollment or enabled policy is supplied by this implementation.
    """
    repository: str
    base_branch: str
    proposal_path: str
    human_ids: frozenset
    expected_scope: tuple


class GitHubAPI:
    """Fixed host, TLS verification, bounded JSON, no redirects or write endpoints."""
    def __init__(self, token):
        require(type(token) is str and re.fullmatch(r"[A-Za-z0-9_]+", token) and len(token) <= 512, "GITHUB_READ_TOKEN_REQUIRED")
        self._token = token

    def _request(self, method, path, body=None):
        require((method == "GET" and path.startswith("/repos/"))
                or (method == "POST" and path == "/graphql"), "READ_ENDPOINT_ONLY")
        connection = HTTPSConnection("api.github.com", timeout=5, context=ssl.create_default_context())
        try:
            connection.request(method, path, body=body, headers={
                "Authorization": "Bearer " + self._token, "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "Founder-Review-Authority-v1",
                "Cache-Control": "no-cache", "Content-Type": "application/json"})
            response = connection.getresponse()
            require(response.status == 200, "GITHUB_HTTP_" + str(response.status))
            require(not response.getheader("Link", ""), "PAGINATION_UNSUPPORTED")
            return _json(response.read(1048577), 1048576)
        finally:
            connection.close()

    def get(self, path):
        return self._request("GET", path)

    def review_gate(self, repository, number):
        # Static read query; never a caller-supplied GraphQL query or mutation.
        owner, name = repository.split("/")
        query = "query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){headRefOid baseRefName reviewDecision mergeStateStatus isDraft state}}}"
        result = self._request("POST", "/graphql", json.dumps({"query": query,
            "variables": {"owner": owner, "name": name, "number": number}}).encode())
        require(type(result) is dict and not result.get("errors"), "GITHUB_GRAPHQL_UNVERIFIABLE")
        return result["data"]["repository"]["pullRequest"]


def _policy(policy):
    require(type(policy) is AuthorityPolicy, "AUTHORITY_POLICY_NOT_CONFIGURED")
    require(type(policy.repository) is str and REPO.fullmatch(policy.repository), "INVALID_AUTHORITY_POLICY")
    require(type(policy.base_branch) is str and 0 < len(policy.base_branch) <= 255
            and not re.search(r"[\x00-\x1f\x7f]", policy.base_branch), "INVALID_AUTHORITY_POLICY")
    _path(policy.proposal_path)
    require(type(policy.human_ids) is frozenset and 0 < len(policy.human_ids) <= 128
            and all(type(i) is int and i > 0 for i in policy.human_ids), "HUMAN_ENROLLMENT_NOT_CONFIGURED")
    require(type(policy.expected_scope) is tuple and len(policy.expected_scope) == 3
            and type(policy.expected_scope[2]) is tuple, "SCOPE_POLICY_NOT_CONFIGURED")
    require(_scope({"project": policy.expected_scope[0], "target_node": policy.expected_scope[1],
                    "operations": list(policy.expected_scope[2])}) == policy.expected_scope, "INVALID_AUTHORITY_POLICY")


def _record(record, policy):
    _shape(record, RECORD_FIELDS)
    require(record["schema"] == RECORD_SCHEMA and record["repository"] == policy.repository
            and record["proposal_path"] == policy.proposal_path, "RECORD_LOCATION_OR_VERSION_MISMATCH")
    for key in ("pull_number", "actor_id", "review_id"):
        require(type(record[key]) is int and 0 < record[key] < 2147483647, "INVALID_RECORD_ID")
    require(type(record["head_sha"]) is str and SHA40.fullmatch(record["head_sha"])
            and type(record["proposal_sha256"]) is str and SHA256.fullmatch(record["proposal_sha256"]), "INVALID_RECORD_HASH")
    require(_scope(record["scope"]) == policy.expected_scope, "RECORD_SCOPE_NOT_ALLOWED")
    require(record["decision"] == "APPROVE", "DECISION_NOT_APPROVAL")
    _stamp(record["issued_at"])
    _stamp(record["expires_at"])


def _snapshot(api, record, policy, now):
    prefix = "/repos/" + policy.repository
    pr_path = prefix + "/pulls/" + str(record["pull_number"])
    pr = api.get(pr_path)
    require(type(pr["user"]["id"]) is int and pr["user"]["id"] > 0, "PR_AUTHOR_UNVERIFIABLE")
    require(pr["state"] == "open" and pr.get("merged") is False and pr.get("draft") is False, "PR_NOT_OPEN_READY")
    require(pr["base"]["repo"]["full_name"] == policy.repository
            and pr["head"]["repo"]["full_name"] == policy.repository
            and pr["base"]["ref"] == policy.base_branch
            and pr["head"]["sha"] == record["head_sha"], "PR_LOCATION_OR_HEAD_CHANGED")
    branch_path = prefix + "/branches/" + quote(policy.base_branch, safe="")
    branch = api.get(branch_path)
    require(branch["protected"] is True, "BRANCH_NOT_PROTECTED")
    protection = api.get(branch_path + "/protection")
    reviews_policy = protection["required_pull_request_reviews"]
    require(protection["enforce_admins"]["enabled"] is True
            and reviews_policy["dismiss_stale_reviews"] is True
            and reviews_policy["require_last_push_approval"] is True, "REVIEW_PROTECTION_INSUFFICIENT")
    # V1 deliberately blocks richer requirements; never advise weakening them.
    require(type(reviews_policy["required_approving_review_count"]) is int
            and reviews_policy["required_approving_review_count"] == 1
            and reviews_policy["require_code_owner_reviews"] is False, "REVIEW_REQUIREMENTS_UNSUPPORTED")
    bypass = reviews_policy.get("bypass_pull_request_allowances", {"users": [], "teams": [], "apps": []})
    require(type(bypass) is dict and all(bypass.get(k) == [] for k in ("users", "teams", "apps")), "REVIEW_BYPASS_NOT_ALLOWED")
    rules = api.get(prefix + "/rules/branches/" + quote(policy.base_branch, safe=""))
    require(rules == [], "ACTIVE_RULESET_REQUIRES_ADAPTER")
    gate = api.review_gate(policy.repository, record["pull_number"])
    require(gate["headRefOid"] == record["head_sha"] and gate["baseRefName"] == policy.base_branch
            and gate["reviewDecision"] == "APPROVED" and gate["mergeStateStatus"] == "CLEAN"
            and gate["isDraft"] is False and gate["state"] == "OPEN", "GITHUB_REVIEW_GATE_NOT_SATISFIED")
    reviews = api.get(pr_path + "/reviews?per_page=100")
    require(type(reviews) is list and len(reviews) < 100, "REVIEW_LIST_INCOMPLETE")
    selected = [r for r in reviews if r.get("id") == record["review_id"]]
    require(len(selected) == 1, "REVIEW_NOT_FOUND")
    review = selected[0]
    require(type(review["id"]) is int and review["id"] == record["review_id"], "REVIEW_ID_UNVERIFIABLE")
    user = review["user"]
    require(type(user["id"]) is int and user["id"] == record["actor_id"]
            and user["id"] in policy.human_ids and user["type"] == "User"
            and user["id"] != pr["user"]["id"], "ACTOR_NOT_ENROLLED_OR_SELF_APPROVAL")
    require(type(user["login"]) is str and re.fullmatch(r"[A-Za-z0-9-]{1,39}", user["login"]), "INVALID_GITHUB_ACTOR")
    require(review["state"] == "APPROVED" and review["commit_id"] == record["head_sha"], "REVIEW_NOT_APPROVED_FOR_HEAD")
    submitted = _stamp(review["submitted_at"])
    require(review["submitted_at"] == record["issued_at"], "REVIEW_ISSUED_AT_MISMATCH")
    actor_reviews = [r for r in reviews if r["user"]["id"] == user["id"] and r.get("submitted_at")]
    require(max(actor_reviews, key=lambda r: (_stamp(r["submitted_at"]), r["id"]))["id"] == review["id"], "REVIEW_SUPERSEDED")
    permission = api.get(prefix + "/collaborators/" + quote(user["login"], safe="") + "/permission")
    require(permission["user"]["id"] == user["id"] and permission["user"]["login"] == user["login"]
            and permission["permission"] in {"admin", "write"}
            and permission["role_name"] in {"admin", "maintain", "write"}, "ACTOR_PERMISSION_UNVERIFIABLE")
    intent = _json(review["body"].encode(), 16384)
    _shape(intent, {"schema", "head_sha", "proposal_path", "proposal_sha256", "scope_sha256", "decision", "expires_at"})
    require(intent == {"schema": INTENT_SCHEMA, "head_sha": record["head_sha"], "proposal_path": record["proposal_path"],
            "proposal_sha256": record["proposal_sha256"], "scope_sha256": _scope_hash(record["scope"]),
            "decision": "APPROVE", "expires_at": record["expires_at"]}, "REVIEW_INTENT_MISMATCH")
    expires = _stamp(record["expires_at"])
    require(submitted <= now < expires and expires - submitted <= timedelta(minutes=15), "REVIEW_EXPIRED_OR_FUTURE")
    content = api.get(prefix + "/contents/" + quote(policy.proposal_path, safe="/") + "?ref=" + record["head_sha"])
    require(content["type"] == "file" and content["path"] == policy.proposal_path
            and content["encoding"] == "base64" and type(content["size"]) is int
            and 0 < content["size"] <= 65536, "PROPOSAL_FILE_UNVERIFIABLE")
    raw = base64.b64decode("".join(content["content"].split()), validate=True)
    require(len(raw) == content["size"] and hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == content["sha"], "GIT_BLOB_MISMATCH")
    require(hashlib.sha256(raw).hexdigest() == record["proposal_sha256"], "PROPOSAL_HASH_MISMATCH")
    proposal = _json(raw)
    if proposal.get("schema") == PROPOSAL_SCHEMA:
        _shape(proposal, {"schema", "proposal_id", "scope", "expires_at"})
        data = proposal
        require(proposal["expires_at"] == record["expires_at"], "PROPOSAL_SCOPE_OR_EXPIRY_MISMATCH")
    else:
        # Read #98's frozen data shape; never import its engine or alter its files.
        _shape(proposal, {"schema", "kind", "data", "policy"})
        require(proposal["schema"] == "moni/atlas-vnext-data/v1-draft"
                and proposal["kind"] == "proposal", "UNSUPPORTED_PROPOSAL_VERSION")
        expected = {"trust": "UNVERIFIED", "operational_status": "UNKNOWN", "identity_verified": False,
                    "authorization_verified": False, "approval_granted": False, "can_dispatch": False, "production_allowed": False}
        _shape(proposal["policy"], set(expected))
        require(all(type(proposal["policy"][k]) is type(v) and proposal["policy"][k] == v
                    for k, v in expected.items()), "PROPOSAL_AUTHORITY_CLAIM_FORBIDDEN")
        data = proposal["data"]
        _shape(data, {"proposal_id", "created_at", "scope", "sources", "claims"})
        require(_stamp(data["created_at"]) <= submitted
                and all(type(data[k]) is list and 0 < len(data[k]) <= 128 for k in ("sources", "claims")), "INVALID_ATLAS_PROPOSAL")
    require(type(data["proposal_id"]) is str and ID.fullmatch(data["proposal_id"])
            and _scope(data["scope"]) == policy.expected_scope
            and data["scope"] == record["scope"], "PROPOSAL_SCOPE_OR_EXPIRY_MISMATCH")
    # Compare security-relevant source state twice; no claim of an atomic GitHub transaction.
    return {"head": pr["head"]["sha"], "base": pr["base"]["sha"], "protection": protection,
            "gate": gate, "reviews": reviews, "permission": permission, "blob": content["sha"]}


def inspect_protected_review(record_bytes, *, policy=None, token=None):
    """Verify now using GitHub, never a caller-provided authenticated boolean.

    Output is a current observation, not a signed/durable/replay-safe credential.
    No callback/transport/simulation option can be supplied in the public API.
    Unit tests patch private I/O explicitly; those results are synthetic only.
    """
    output = {"status": "BLOCKED", "reason_code": "UNVERIFIABLE", "review_verified": False,
              "approval_granted": False, "can_dispatch": False, "operational_status": "UNKNOWN", "record": None, "checked_at": None}
    try:
        _policy(policy)
        record = _json(record_bytes, 16384)
        _record(record, policy)
        api = GitHubAPI(token)
        started = _utcnow()
        first = _snapshot(api, record, policy, started)
        second = _snapshot(api, record, policy, _utcnow())
        finished = _utcnow()
        require(first == second, "GITHUB_STATE_CHANGED_DURING_VERIFICATION")
        require(timedelta(0) <= finished - started <= timedelta(seconds=30)
                and finished < _stamp(record["expires_at"]), "VERIFICATION_WINDOW_EXPIRED")
        output.update(status="VERIFIED_REVIEW", reason_code="GITHUB_PROTECTED_REVIEW_RECHECKED",
                      review_verified=True, record=record, checked_at=finished.isoformat().replace("+00:00", "Z"))
    except Blocked as exc:
        output["reason_code"] = str(exc)
    except Exception:
        # Never expose HTTP bodies, source values, auth tokens or exception text.
        output["reason_code"] = "GITHUB_OR_INPUT_UNVERIFIABLE"
    return output


def register_founder_decision(record_bytes, *, policy=None, token=None):
    """Return a re-verifiable locator, not persistence or an authorization token."""
    return inspect_protected_review(record_bytes, policy=policy, token=token)
