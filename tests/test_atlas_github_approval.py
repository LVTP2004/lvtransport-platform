"""Offline synthetic GitHub responses; no actual authorization is exercised."""
import base64
import copy
from datetime import datetime, timedelta, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

PATH = Path(__file__).resolve().parents[1] / 'scripts/founder_os/atlas_github_approval.py'
spec = importlib.util.spec_from_file_location('founder_approval', PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class SyntheticGitHub:
    def __init__(self):
        self.now = datetime(2026, 11, 13, 12, 1, tzinfo=timezone.utc)
        self.proposal = {'schema': 'moni/atlas-vnext-data/v1-draft', 'kind': 'proposal',
            'data': {'scope': {'project': 'MONI', 'target_node': 'none', 'operations': ['map.read']},
                     'description': 'SYNTHETIC ONLY'}, 'policy': {'trust': 'UNVERIFIED'}}
        self.proposal_bytes = mod.canonical(self.proposal)
        self.request = mod.build_request(self.proposal_bytes, issued_at='2026-11-13T12:00:00Z',
                                         expires_at='2026-11-13T12:10:00Z')
        self.raw = mod.canonical(self.request)
        self.oid = hashlib.sha1(b'blob ' + str(len(self.raw)).encode() + b'\0' + self.raw).hexdigest()
        self.protected = {'enforce_admins': {'enabled': True}, 'allow_force_pushes': {'enabled': False},
            'allow_deletions': {'enabled': False}, 'required_pull_request_reviews': {
                'dismiss_stale_reviews': True, 'require_last_push_approval': True,
                'required_approving_review_count': 1,
                'bypass_pull_request_allowances': {'users': [], 'teams': [], 'apps': []}}}
        self.pr = {'state': 'open', 'draft': False, 'merged': False, 'user': {'id': 9000},
                   'head': {'sha': 'a' * 40, 'repo': {'full_name': mod.REPOSITORY}},
                   'base': {'ref': 'main', 'sha': 'b' * 40, 'repo': {'full_name': mod.REPOSITORY}}}
        self.reviews = [{'id': 5001, 'state': 'APPROVED', 'commit_id': 'a' * 40,
                         'submitted_at': '2026-11-13T12:00:30Z',
                         'user': {'id': 9001, 'login': 'synthetic-founder', 'type': 'User'}}]
        self.permission = {'permission': 'write', 'user': {'id': 9001}}
        self.files = [{'filename': mod.REQUEST_PATH, 'status': 'added', 'sha': self.oid}]
        self.rules = []
        self.graph = {'headRefOid': 'a' * 40, 'baseRefName': 'main', 'reviewDecision': 'APPROVED'}
        self.pr_reads = 0
        self.change_head = False

    def get(self, path):
        if path.endswith('/branches/main/protection'): result = self.protected
        elif '/rulesets?' in path: result = self.rules
        elif path.endswith('/pulls/7'):
            self.pr_reads += 1
            result = copy.deepcopy(self.pr)
            if self.change_head and self.pr_reads > 1: result['head']['sha'] = 'c' * 40
        elif '/files?' in path: result = self.files
        elif '/reviews?' in path: result = self.reviews
        elif '/git/blobs/' in path:
            result = {'encoding': 'base64', 'sha': self.oid, 'size': len(self.raw),
                      'content': base64.b64encode(self.raw).decode()}
        elif path.endswith('/permission'): result = self.permission
        else: raise AssertionError('unexpected API route')
        return copy.deepcopy(result)

    def decision(self, number):
        assert number == 7
        return copy.deepcopy(self.graph)


class GitHubApprovalTests(unittest.TestCase):
    def setUp(self): self.api = SyntheticGitHub()

    def collect(self): return mod._collect(self.api, 7, self.api.now)

    def test_complete_synthetic_reference_is_not_an_authorization(self):
        record = self.collect()
        self.assertEqual(record['status'], 'PENDING_MONI_VERIFICATION')
        self.assertEqual(record['proposal_sha256'], hashlib.sha256(self.api.proposal_bytes).hexdigest())
        self.assertEqual(record['actors'][0]['actor_id'], 9001)
        self.assertFalse(record['approval_granted'])
        self.assertFalse(record['can_dispatch'])

    def test_unprotected_admin_bypass_weak_reviews_and_rulesets_block(self):
        for mutator in (
            lambda a: a.protected.update(enforce_admins={'enabled': False}),
            lambda a: a.protected['required_pull_request_reviews'].update(dismiss_stale_reviews=False),
            lambda a: a.protected['required_pull_request_reviews'].update(require_last_push_approval=False),
            lambda a: a.protected['required_pull_request_reviews'].update(required_approving_review_count=0),
            lambda a: a.protected['required_pull_request_reviews']['bypass_pull_request_allowances'].update(users=[{}]),
            lambda a: a.protected.update(allow_force_pushes={'enabled': True}),
            lambda a: a.rules.append({'enforcement': 'active'})):
            self.api = SyntheticGitHub(); mutator(self.api)
            with self.assertRaises(mod.Blocked): self.collect()

    def test_expired_request_hash_scope_and_changed_blob_are_rejected(self):
        for field, value in [('expires_at', '2026-11-13T12:01:00Z'),
                             ('proposal_sha256', 'f' * 64), ('scope', {})]:
            request = copy.deepcopy(self.api.request); request[field] = value
            with self.assertRaises(mod.Blocked): mod.validate_request(request, self.api.now)
        self.api.raw += b' '
        with self.assertRaises(mod.Blocked): self.collect()

    def test_wrong_commit_dismissed_stale_bot_self_and_permission_block(self):
        for mutate in (
            lambda a: a.reviews[0].update(commit_id='c' * 40),
            lambda a: a.reviews[0].update(state='DISMISSED'),
            lambda a: a.reviews[0].update(submitted_at='2026-11-13T11:00:00Z'),
            lambda a: a.reviews[0]['user'].update(type='Bot'),
            lambda a: a.pr['user'].update(id=9001),
            lambda a: a.permission.update(permission='read'),
            lambda a: a.permission['user'].update(id=9002)):
            self.api = SyntheticGitHub(); mutate(self.api)
            with self.assertRaises(mod.Blocked): self.collect()

    def test_reject_comment_does_not_approve_and_later_rejection_wins(self):
        self.api.reviews.append({**copy.deepcopy(self.api.reviews[0]), 'id': 5002, 'state': 'COMMENTED'})
        self.assertEqual(self.collect()['decision'], 'approve')
        self.api.reviews.append({**copy.deepcopy(self.api.reviews[0]), 'id': 5003, 'state': 'CHANGES_REQUESTED'})
        self.api.graph['reviewDecision'] = 'CHANGES_REQUESTED'
        self.assertEqual(self.collect()['decision'], 'reject')

    def test_draft_other_repo_branch_files_and_pagination_limit_block(self):
        for mutate in (
            lambda a: a.pr.update(draft=True), lambda a: a.pr['base'].update(ref='other'),
            lambda a: a.pr['head']['repo'].update(full_name='other/repo'),
            lambda a: a.files.append(dict(a.files[0], filename='apps/api/evil.ts')),
            lambda a: a.reviews.extend(copy.deepcopy(a.reviews) * 99),
            lambda a: a.graph.update(reviewDecision='REVIEW_REQUIRED')):
            self.api = SyntheticGitHub(); mutate(self.api)
            with self.assertRaises(mod.Blocked): self.collect()

    def test_race_between_reads_and_quorum_fail_closed(self):
        self.api.change_head = True
        with self.assertRaises(mod.Blocked): self.collect()
        self.api = SyntheticGitHub()
        self.api.protected['required_pull_request_reviews']['required_approving_review_count'] = 2
        with self.assertRaises(mod.Blocked): self.collect()

    def test_public_entry_blocks_missing_or_unverifiable_evidence(self):
        with patch.object(mod.GitHubReadOnly, 'get', side_effect=mod.Blocked('unavailable')):
            result = mod.collect_record(7)
        self.assertEqual(result['status'], 'BLOCKED')
        self.assertFalse(result['approval_granted'])

    def test_strict_json_and_no_actor_or_permission_in_request(self):
        for raw in (b'{"x":1,"x":2}', b'{"x":NaN}', b'[' * 2000):
            with self.assertRaises(mod.Blocked): mod.load(raw)
        with self.assertRaises(mod.Blocked):
            mod.validate_request({**self.api.request, 'authenticated': True}, self.api.now)
        with self.assertRaises(mod.Blocked):
            mod.build_request(json.dumps(self.api.proposal, indent=2).encode(),
                              issued_at=self.api.request['issued_at'], expires_at=self.api.request['expires_at'])

    def test_transport_is_fixed_host_readonly_no_mutations_or_secret_arguments(self):
        fake = subprocess.CompletedProcess([], 0, stdout=b'{}')
        with patch.dict(os.environ, {'GH_HOST': 'attacker.invalid', 'GH_DEBUG': 'api'}), \
             patch.object(mod.subprocess, 'run', return_value=fake) as run:
            mod.GitHubReadOnly().get(mod.ROOT + '/pulls/7')
        args = run.call_args.args[0]
        self.assertEqual(args[:5], ['/usr/bin/gh', 'api', '--hostname', 'github.com', '-H'])
        self.assertIn('GET', args)
        self.assertNotIn('GH_DEBUG', run.call_args.kwargs['env'])
        self.assertEqual(run.call_args.kwargs['env']['GH_HOST'], 'github.com')


if __name__ == '__main__': unittest.main()
