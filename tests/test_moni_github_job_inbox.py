"""Offline security and behavior tests for the MONI GitHub job inbox."""
import importlib.util
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from uuid import uuid4

SPEC = importlib.util.spec_from_file_location(
    "moni_github_job_inbox",
    Path(__file__).resolve().parents[1] / "scripts" / "moni_github_job_inbox.py")
worker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(worker)
NOW = datetime(2026, 11, 10, 13, 0, tzinfo=timezone.utc)


def make_issue(task="ping", *, login="leovargas-max", ttl=1, rid=None):
    return {
        "number": 123, "state": "open", "user": {"login": login},
        "title": f"[MONI-JOB] {task}",
        "body": "MONI_JOB_V1\n" + json.dumps({
            "schema": 1, "task": task, "target": "minisforum",
            "request_id": rid or str(uuid4()),
            "expires_at": (NOW + timedelta(hours=ttl)).isoformat(),
        }),
    }


class JobTests(unittest.TestCase):
    def test_valid_ping(self):
        job = worker.decode_request(make_issue(), NOW)
        self.assertEqual(job["task"], "ping")
        self.assertTrue(worker.execute_readonly(job["task"])["ready"])

    def test_wrong_host_rejected_even_for_valid_job(self):
        issue = make_issue()
        def fake_api(path, method="GET", payload=None):
            raise AssertionError("must reject before fetching GitHub")
        with self.assertRaisesRegex(worker.TaskRejected, "wrong local node"):
            worker.run_once(publish=False, api=fake_api, now=NOW, hostname="aspire")

    def test_untrusted_author_rejected(self):
        with self.assertRaisesRegex(worker.TaskRejected, "untrusted"):
            worker.decode_request(make_issue(login="internet-user"), NOW)

    def test_unlisted_task_rejected(self):
        for name in ("shell", "sudo", "write_file", "deploy", "git_push"):
            with self.subTest(name=name), self.assertRaises(worker.TaskRejected):
                worker.decode_request(make_issue(task=name), NOW)

    def test_expired_and_oversized_window_rejected(self):
        for ttl in (-1, 24*8):
            with self.subTest(ttl=ttl), self.assertRaises(worker.TaskRejected):
                worker.decode_request(make_issue(ttl=ttl), NOW)

    def test_schema_extra_field_rejected(self):
        issue = make_issue()
        document = json.loads(issue["body"][len(worker.BODY_PREFIX):])
        document["command"] = "rm -rf /"
        issue["body"] = worker.BODY_PREFIX + json.dumps(document)
        with self.assertRaises(worker.TaskRejected):
            worker.decode_request(issue, NOW)

    def test_issue_title_mismatch_rejected(self):
        issue = make_issue()
        issue["title"] = "[MONI-JOB] runtime_inventory"
        with self.assertRaises(worker.TaskRejected):
            worker.decode_request(issue, NOW)

    def test_pull_requests_rejected(self):
        issue = make_issue()
        issue["pull_request"] = {"url": "somewhere"}
        with self.assertRaises(worker.TaskRejected):
            worker.decode_request(issue, NOW)

    def test_inventory_never_discloses_literals(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "moni_chat.py").write_text(
                "PASSWORD='SUPERSECRET'\ndef respond(message):\n return 'TOPPRIVATE'\n",
                encoding="utf-8")
            report = worker.inventory(root)
        self.assertIn("moni_chat.py", report["modules"])
        self.assertEqual(report["modules"]["moni_chat.py"]["function_count"], 1)
        self.assertNotIn("SUPERSECRET", str(report))
        self.assertNotIn("TOPPRIVATE", str(report))

    def test_dry_run_never_posts(self):
        issue = make_issue()
        calls = []
        def fake_api(path, method="GET", payload=None):
            calls.append((path, method, payload))
            return [issue]
        result = worker.run_once(publish=False, api=fake_api, now=NOW, hostname="leonardo-AI-Series")
        self.assertEqual(len(result), 1)
        self.assertEqual(len(calls), 1)
        self.assertFalse(result[0]["published"])

    def test_publish_only_sanitized_result(self):
        issue = make_issue()
        calls = []
        def fake_api(path, method="GET", payload=None):
            calls.append((path, method, payload))
            if path.endswith("issues?state=open&per_page=100"):
                return [issue]
            if path.endswith("comments?per_page=100"):
                return []
            return {"id": 9}
        result = worker.run_once(publish=True, api=fake_api, now=NOW, hostname="leonardo-AI-Series")
        self.assertTrue(result[0]["published"])
        self.assertEqual(calls[-1][1], "POST")
        self.assertNotIn("request_id", calls[-1][2]["body"])
        self.assertIn("READ_ONLY", calls[-1][2]["body"])

    def test_duplicate_report_skips_post(self):
        issue = make_issue()
        request_id = json.loads(issue["body"][len(worker.BODY_PREFIX):])["request_id"]
        def fake_api(path, method="GET", payload=None):
            if path.endswith("issues?state=open&per_page=100"):
                return [issue]
            if path.endswith("comments?per_page=100"):
                return [{"user": {"login": worker.AUTHOR},
                         "body": worker.result_marker(123, request_id)}]
            raise AssertionError("unexpected posting or request")
        result = worker.run_once(publish=True, api=fake_api, now=NOW, hostname="leonardo-AI-Series")
        self.assertTrue(result[0]["skipped_existing"])
        self.assertFalse(result[0]["published"])


if __name__ == "__main__":
    unittest.main()
