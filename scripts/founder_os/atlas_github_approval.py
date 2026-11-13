"""Founder OS GitHub review reference, not a bearer authorization or API login.

Only existing GitHub credentials, read queries and fixed github.com repository.
MONI must independently re-fetch every fact; this collector never grants access.
"""
import argparse
import base64
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
import re
import subprocess
import time

REPOSITORY = 'LVTP2004/lvtransport-platform'
ROOT = 'repos/' + REPOSITORY
REQUEST_PATH = 'docs/founder/approvals/atlas-request.json'
RECORD_SCHEMA = 'moni/atlas-github-review-reference/v1'
REQUEST_SCHEMA = 'moni/atlas-github-review-request/v1'
HEX = re.compile(r'[0-9a-f]{40}\Z')
QUERY = '''query($number:Int!){repository(owner:"LVTP2004",name:"lvtransport-platform"){
pullRequest(number:$number){headRefOid baseRefName reviewDecision}}}'''


class Blocked(ValueError):
    pass


def need(condition, reason):
    if not condition:
        raise Blocked(reason)


def _pairs(items):
    result = {}
    for key, value in items:
        need(key not in result, 'DUPLICATE_JSON_KEY')
        result[key] = value
    return result


def _constant(_value):
    raise Blocked('NONSTANDARD_JSON')


def load(raw):
    need(type(raw) is bytes and len(raw) <= 131072, 'JSON_SIZE')
    try:
        return json.loads(raw, object_pairs_hook=_pairs, parse_constant=_constant)
    except (ValueError, UnicodeError, RecursionError) as exc:
        raise Blocked('INVALID_JSON') from exc


def canonical(value):
    budget = [4096]
    def check(item, depth=0):
        budget[0] -= 1
        need(budget[0] >= 0 and depth <= 16, 'JSON_COMPLEXITY')
        if type(item) is dict:
            need(all(type(k) is str for k in item), 'JSON_KEYS')
            for child in item.values(): check(child, depth + 1)
        elif type(item) is list:
            for child in item: check(child, depth + 1)
        else:
            need(item is None or type(item) in (str, bool, int), 'JSON_TYPE')
    check(value)
    try:
        result = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    except UnicodeError as exc:
        raise Blocked('JSON_TEXT') from exc
    need(len(result) <= 131072, 'JSON_SIZE')
    return result


def stamp(value):
    need(type(value) is str and re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z', value), 'UTC_REQUIRED')
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as exc:
        raise Blocked('INVALID_TIME') from exc


def validate_request(value, now):
    need(type(value) is dict and set(value) == {
        'schema', 'proposal', 'proposal_sha256', 'scope', 'issued_at', 'expires_at'}, 'REQUEST_FIELDS')
    need(value['schema'] == REQUEST_SCHEMA, 'REQUEST_SCHEMA')
    proposal = value['proposal']
    need(type(proposal) is dict and proposal.get('schema') == 'moni/atlas-vnext-data/v1-draft'
         and proposal.get('kind') == 'proposal', 'PROPOSAL_SCHEMA')
    need(type(proposal.get('data')) is dict, 'PROPOSAL_DATA')
    scope = proposal['data'].get('scope')
    need(type(scope) is dict and set(scope) == {'project', 'target_node', 'operations'}, 'SCOPE_FIELDS')
    need(value['scope'] == scope and scope == {
        'project': 'MONI', 'target_node': 'none', 'operations': ['map.read']}, 'SCOPE_NOT_SUPPORTED')
    need(hashlib.sha256(canonical(proposal)).hexdigest() == value['proposal_sha256'], 'PROPOSAL_HASH')
    issued, expires = stamp(value['issued_at']), stamp(value['expires_at'])
    need(issued <= now < expires and timedelta(0) < expires - issued <= timedelta(minutes=15), 'REQUEST_EXPIRED')
    return value


def build_request(proposal_bytes, *, issued_at, expires_at):
    """Prepare review data only; no actor supplied and no approval created."""
    proposal = load(proposal_bytes)
    need(canonical(proposal) == proposal_bytes, 'CANONICAL_PROPOSAL_BYTES_REQUIRED')
    value = {'schema': REQUEST_SCHEMA, 'proposal': proposal,
             'proposal_sha256': hashlib.sha256(proposal_bytes).hexdigest(),
             'scope': proposal.get('data', {}).get('scope'),
             'issued_at': issued_at, 'expires_at': expires_at}
    return validate_request(value, stamp(issued_at))


class GitHubReadOnly:
    def _call(self, args):
        env = {k: os.environ[k] for k in ('HOME', 'XDG_CONFIG_HOME', 'GH_CONFIG_DIR',
               'GH_TOKEN', 'GITHUB_TOKEN') if k in os.environ}
        env.update(PATH='/usr/bin:/bin', GH_HOST='github.com', GH_PROMPT_DISABLED='1')
        try:
            result = subprocess.run(['/usr/bin/gh', 'api', '--hostname', 'github.com',
                '-H', 'Accept: application/vnd.github+json', '-H', 'Cache-Control: no-cache',
                '-H', 'X-GitHub-Api-Version: 2022-11-28',
                *args], env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL, timeout=15, check=False)
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise Blocked('GITHUB_UNAVAILABLE') from exc
        need(result.returncode == 0 and len(result.stdout) <= 1048576, 'GITHUB_UNVERIFIABLE')
        return load(result.stdout) if len(result.stdout) <= 131072 else self._large(result.stdout)

    @staticmethod
    def _large(raw):
        try:
            return json.loads(raw, object_pairs_hook=_pairs, parse_constant=_constant)
        except (ValueError, UnicodeError, RecursionError) as exc:
            raise Blocked('GITHUB_JSON_INVALID') from exc

    def get(self, path):
        need(path.startswith(ROOT + '/') and '..' not in path, 'GITHUB_PATH')
        return self._call(['--method', 'GET', path])

    def decision(self, number):
        value = self._call(['--method', 'POST', 'graphql', '-f', 'query=' + QUERY, '-F', 'number=' + str(number)])
        need(type(value) is dict and not value.get('errors'), 'GRAPHQL_UNVERIFIABLE')
        return value['data']['repository']['pullRequest']


def protection(api):
    try:
        value = api.get(ROOT + '/branches/main/protection')
    except Blocked as exc:
        raise Blocked('PROTECTION_MISSING_OR_UNREADABLE') from exc
    need(value.get('enforce_admins', {}).get('enabled') is True, 'ADMIN_BYPASS')
    need(value.get('allow_force_pushes', {}).get('enabled') is False
         and value.get('allow_deletions', {}).get('enabled') is False, 'MUTABLE_PROTECTED_BRANCH')
    review = value.get('required_pull_request_reviews')
    need(type(review) is dict and review.get('dismiss_stale_reviews') is True
         and review.get('require_last_push_approval') is True, 'REVIEW_PROTECTION_INSUFFICIENT')
    count = review.get('required_approving_review_count')
    need(type(count) is int and 1 <= count <= 6, 'REVIEW_QUORUM')
    bypass = review.get('bypass_pull_request_allowances')
    need(type(bypass) is dict and all(bypass.get(k) == [] for k in ('users', 'teams', 'apps')), 'REVIEW_BYPASS')
    rules = api.get(ROOT + '/rulesets?includes_parents=true&per_page=100')
    need(type(rules) is list and len(rules) < 100
         and all(r.get('enforcement') == 'disabled' for r in rules), 'UNSUPPORTED_RULESET')
    return value


def _collect(api, number, now):
    need(type(number) is int and 0 < number < 100000000, 'PR_NUMBER')
    protected = protection(api)
    pr = api.get(ROOT + '/pulls/' + str(number))
    need(pr['state'] == 'open' and pr['draft'] is False and pr['merged'] is False, 'PR_NOT_REVIEWABLE')
    head = pr['head']['sha']
    need(type(head) is str and HEX.fullmatch(head) and pr['base']['ref'] == 'main'
         and pr['base']['repo']['full_name'] == REPOSITORY
         and pr['head']['repo']['full_name'] == REPOSITORY, 'PR_SCOPE')
    prefix = ROOT + '/pulls/' + str(number)
    files = api.get(prefix + '/files?per_page=100')
    need(type(files) is list and len(files) == 1 and files[0]['filename'] == REQUEST_PATH
         and files[0]['status'] in ('added', 'modified') and HEX.fullmatch(files[0]['sha']), 'REQUEST_ONLY_PR_REQUIRED')
    oid = files[0]['sha']
    blob = api.get(ROOT + '/git/blobs/' + oid)
    need(blob.get('encoding') == 'base64' and 0 < blob.get('size', 0) <= 131072, 'REQUEST_BLOB')
    raw = base64.b64decode(blob['content'])
    need(len(raw) == blob['size'] and blob.get('sha') == oid
         and hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest() == oid,
         'REQUEST_BLOB_INTEGRITY')
    request = validate_request(load(raw), now)
    reviews = api.get(prefix + '/reviews?per_page=100')
    need(type(reviews) is list and len(reviews) < 100, 'REVIEW_LIST_LIMIT')
    latest = {}
    for review in reviews:
        if review['state'] in ('APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'):
            user = review['user']
            need(type(user['id']) is int and type(review['id']) is int, 'REVIEW_ID')
            previous = latest.get(user['id'])
            if previous is None or review['id'] > previous['id']: latest[user['id']] = review
    actors = []
    for review in latest.values():
        if review['state'] == 'DISMISSED' or review['commit_id'] != head: continue
        user = review['user']
        need(user['type'] == 'User' and re.fullmatch(r'[A-Za-z0-9-]{1,39}', user['login']), 'HUMAN_REVIEW_REQUIRED')
        need(user['id'] != pr['user']['id'], 'SELF_APPROVAL')
        when = stamp(review['submitted_at'])
        need(stamp(request['issued_at']) <= when <= now and now - when <= timedelta(minutes=15), 'REVIEW_STALE')
        perm = api.get(ROOT + '/collaborators/' + user['login'] + '/permission')
        need(perm['permission'] in ('write', 'maintain', 'admin') and perm['user']['id'] == user['id'], 'ACTOR_PERMISSION')
        actors.append({'actor_id': user['id'], 'actor_login': user['login'], 'review_id': review['id'],
                       'decision': 'approve' if review['state'] == 'APPROVED' else 'reject',
                       'submitted_at': review['submitted_at']})
    need(bool(actors), 'NO_CURRENT_HUMAN_DECISION')
    graph = api.decision(number)
    expected = 'CHANGES_REQUESTED' if any(a['decision'] == 'reject' for a in actors) else 'APPROVED'
    need(graph == {'headRefOid': head, 'baseRefName': 'main', 'reviewDecision': expected}, 'GITHUB_REVIEW_GATE')
    need(len([a for a in actors if a['decision'] == 'approve']) >= protected['required_pull_request_reviews']['required_approving_review_count']
         or expected == 'CHANGES_REQUESTED', 'REVIEW_QUORUM')
    again = api.get(prefix)
    need(again['head']['sha'] == head and again['base']['sha'] == pr['base']['sha']
         and again['state'] == 'open' and again['draft'] is False and again['merged'] is False, 'PR_CHANGED')
    need(protection(api) == protected and api.get(prefix + '/reviews?per_page=100') == reviews
         and api.decision(number) == graph, 'AUTHORITY_CHANGED')
    return {'schema': RECORD_SCHEMA, 'status': 'PENDING_MONI_VERIFICATION',
            'repository': REPOSITORY, 'pull_request': number, 'head_sha': head,
            'request_blob_sha': oid, 'request_sha256': hashlib.sha256(raw).hexdigest(),
            'proposal_sha256': request['proposal_sha256'], 'scope': request['scope'],
            'decision': 'reject' if expected == 'CHANGES_REQUESTED' else 'approve',
            'actors': sorted(actors, key=lambda a: a['actor_id']), 'expires_at': request['expires_at'],
            'trust': 'UNVERIFIED_UNTIL_MONI_RECHECK', 'approval_granted': False, 'can_dispatch': False}


def collect_record(number):
    """Production entry: no injected client/clock/identity; GitHub reads only."""
    start = time.monotonic()
    try:
        result = _collect(GitHubReadOnly(), number, datetime.now(timezone.utc))
        need(time.monotonic() - start <= 60, 'COLLECTION_TOO_SLOW')
        need(datetime.now(timezone.utc) < stamp(result['expires_at']), 'REQUEST_EXPIRED')
        return result
    except (Blocked, KeyError, TypeError, ValueError, AttributeError, OverflowError):
        return {'schema': RECORD_SCHEMA, 'status': 'BLOCKED', 'reason': 'GITHUB_AUTHORITY_UNVERIFIABLE',
                'repository': REPOSITORY, 'approval_granted': False, 'can_dispatch': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Collect an untrusted GitHub approval reference; no mutation')
    parser.add_argument('--pull-request', type=int, required=True)
    result = collect_record(parser.parse_args().pull_request)
    print(json.dumps(result, sort_keys=True))
    raise SystemExit(0 if result['status'] == 'PENDING_MONI_VERIFICATION' else 2)
