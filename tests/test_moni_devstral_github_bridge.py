"""Offline tests for the manual, proposal-only MONI ↔ Devstral relay."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "moni_devstral_github_bridge.py"
spec = importlib.util.spec_from_file_location("moni_devstral_github_bridge", SCRIPT)
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

ISSUE = {
    "number": 12, "state": "open", "title": "[MONI-DEVSTRAL] Plan read-only audit",
    "body": "Review the plan only; change nothing.",
}


class TestBridge(unittest.TestCase):
    def test_endpoint_only_local_or_tailscale(self):
        self.assertEqual(
            bridge.ollama_endpoint("http://100.80.158.108:11434"),
            "http://100.80.158.108:11434",
        )
        self.assertEqual(
            bridge.ollama_endpoint("http://127.0.0.1:11434"),
            "http://127.0.0.1:11434",
        )
        for bad in ["https://100.80.158.108:11434", "http://8.8.8.8:11434",
                    "http://100.80.158.108:8080", "http://user:pass@localhost:11434",
                    "http://localhost:11434/execute", "", "http://localhost:bad"]:
            with self.subTest(bad=bad), self.assertRaises(bridge.BridgeError):
                bridge.ollama_endpoint(bad)

    def test_issue_restrictions(self):
        self.assertEqual(bridge.validate_issue(ISSUE)["number"], 12)
        for extra in [{"state": "closed"}, {"title": "not prefixed"},
                      {"pull_request": {"url": "https://example.org"}}]:
            issue = {**ISSUE, **extra}
            with self.assertRaises(bridge.BridgeError):
                bridge.validate_issue(issue)

    def test_default_plan_never_publishes(self):
        with patch.object(bridge, "gh_api", return_value=ISSUE) as github, \
             patch.object(bridge, "ask_devstral", return_value="Plan reviewed.") as model, \
             patch.dict(os.environ, {"MONI_OLLAMA_URL": "http://100.80.158.108:11434"}), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(bridge.main(["plan", "12"]), 0)
        github.assert_called_once_with("repos/LVTP2004/lvtransport-platform/issues/12")
        model.assert_called_once()
        self.assertIn("NOT published", output.getvalue())

    def test_publish_requires_explicit_flags(self):
        with self.assertRaises(bridge.BridgeError):
            bridge.main(["plan", "12", "--publish"])
        with self.assertRaises(bridge.BridgeError):
            bridge.main(["plan", "12", "--approve-publish"])

    def test_publish_posts_only_a_proposal_comment(self):
        with patch.object(bridge, "gh_api", side_effect=[ISSUE, {"id": 1}]) as github, \
             patch.object(bridge, "ask_devstral", return_value="Proposed audit steps"), \
             patch.dict(os.environ, {"MONI_OLLAMA_URL": "http://100.80.158.108:11434"}), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(bridge.main(["plan", "12", "--publish", "--approve-publish"]), 0)
        self.assertEqual(github.call_count, 2)
        args, kwargs = github.call_args_list[1]
        self.assertEqual(args[0], "repos/LVTP2004/lvtransport-platform/issues/12/comments")
        self.assertEqual(args[1], "POST")
        self.assertIn("PROPOSAL ONLY", args[2]["body"])

    def test_model_uses_text_only_no_tools(self):
        expected = {"content": [{"type": "text", "text": "Safe read-only plan"}]}
        with patch.object(bridge, "urlopen") as open_url:
            open_url.return_value.__enter__.return_value.read.return_value = json.dumps(expected).encode()
            response = bridge.ask_devstral("http://127.0.0.1:11434", ISSUE)
            request = open_url.call_args.args[0]
        self.assertEqual(response, "Safe read-only plan")
        payload = json.loads(request.data.decode())
        self.assertEqual(payload["model"], "devstral:latest")
        self.assertNotIn("tools", payload)
        self.assertEqual(request.full_url, "http://127.0.0.1:11434/v1/messages")

    def test_issue_list_only_prefixed(self):
        items = [
            {**ISSUE, "html_url": "https://github.com/LVTP2004/lvtransport-platform/issues/12"},
            {**ISSUE, "number": 9, "title": "Unrelated", "html_url": "https://example.com/9"},
        ]
        with patch.object(bridge, "gh_api", return_value=items) as github, \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(bridge.main(["list"]), 0)
        github.assert_called_once()
        self.assertIn("#12", output.getvalue())
        self.assertNotIn("#9", output.getvalue())


if __name__ == "__main__":
    unittest.main()
