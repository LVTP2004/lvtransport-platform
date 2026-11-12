"""Offline tests. No GitHub, Ollama or MONI services are accessed."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / f"{name}.py")
    result = importlib.util.module_from_spec(spec)
    import sys
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


policy = module("moni_v10_conversation_policy")
audit = module("moni_v10_runtime_audit")


class PolicyTests(unittest.TestCase):
    def test_only_explicit_bools_verify(self):
        flags = policy.verified_capabilities({"atlas_read": "true", "devstral_plan": True})
        self.assertFalse(flags["atlas_read"])
        self.assertTrue(flags["devstral_plan"])

    def test_unknown_or_unverified_blocked(self):
        self.assertFalse(policy.propose_route("shell", {"shell": True}).allowed)
        self.assertFalse(policy.propose_route("forge_stage", {}).allowed)

    def test_mutations_require_approval(self):
        self.assertFalse(policy.propose_route("github_write", {"github_write": True}).allowed)
        self.assertTrue(policy.propose_route("github_write", {"github_write": True}, approved=True).allowed)
        self.assertTrue(policy.propose_route("atlas_read", {"atlas_read": True}).allowed)

    def test_prompt_truthfulness_and_guardrails(self):
        prompt = policy.build_system_prompt({"atlas_read": True})
        self.assertIn("atlas_read: verificado", prompt)
        self.assertIn("github_write: no verificado", prompt)
        self.assertIn("DRY_RUN", prompt)

    def test_history_keeps_last_turn_and_skips_system(self):
        msgs = [{"role":"system", "content":"SECRET"},
                {"role":"user", "content":"x"*200},
                {"role":"assistant", "content":"done"},
                {"role":"user", "content":"current task"}]
        recent = policy.compact_history(msgs, max_chars=64)
        self.assertEqual(recent[-1]["content"], "current task")
        self.assertNotIn("SECRET", str(recent))
        self.assertLessEqual(sum(len(m["content"]) for m in recent),64)

    def test_history_minimum_budget(self):
        with self.assertRaises(ValueError):
            policy.compact_history([], max_chars=20)

    def test_audit_reads_symbols_not_contents(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/"moni_chat.py").write_text("TOKEN = 'do-not-disclose'\ndef run():\n    pass\n", encoding="utf-8")
            result=audit.inspect_runtime(root)
        self.assertFalse(result["found_all"])
        self.assertEqual(result["files"][0]["symbols"], ["run"])
        self.assertNotIn("do-not-disclose", str(result))

    def test_audit_syntax_failure_non_destructive(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            (root/"moni_chat.py").write_text("def broken(:",encoding="utf-8")
            result=audit.inspect_runtime(root)
            self.assertEqual((root/"moni_chat.py").read_text(), "def broken(:")
        self.assertEqual(result["files"][0]["syntax"], "SyntaxError")


    def test_interface_map_shows_known_calls_and_no_literal_values(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/"moni_chat.py").write_text(
                "from llm_router import ask\n"
                "SECRET='do-not-disclose'\n"
                "def respond(text, *, model=None):\n"
                "    return ask('hidden-secret-prompt', text)\n"
                "class Controller:\n"
                "    def process(self, query):\n"
                "        return respond(query)\n", encoding="utf-8")
            result = audit.inspect_runtime(root, interfaces=True)
        entry = result["files"][0]["interfaces"]
        self.assertEqual(entry["local_module_imports"], ["llm_router"])
        self.assertEqual(entry["functions"][0]["params"], ["text", "model"])
        self.assertEqual(entry["functions"][0]["known_calls"], ["ask"])
        self.assertNotIn("do-not-disclose", str(result))
        self.assertNotIn("hidden-secret-prompt", str(result))

    def test_default_does_not_disclose_interfaces(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/"moni_chat.py").write_text("def main(secret_key): pass", encoding="utf-8")
            result = audit.inspect_runtime(root)
        self.assertNotIn("interfaces", result["files"][0])



if __name__ == "__main__":
    unittest.main()
