"""Offline tests of sanitized MONI routing inspection."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "moni_v10_route_audit.py"
spec = importlib.util.spec_from_file_location("moni_v10_route_audit", SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class TestRouteAudit(unittest.TestCase):
    def test_routes_keep_calls_and_hide_literals(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / "moni_chat.py").write_text(
                'def respond(message):\n'
                ' if message == "super-private":\n'
                '  return "CREDENTIAL-ABC"\n'
                ' return router("dry", message)\n'
                'def router(a,b):\n'
                ' return "error-code-123"\n', encoding="utf-8")
            (root / "llm_router.py").write_text(
                'def ask(message):\n'
                ' return save_exchange(message, "private")\n', encoding="utf-8")
            output = str(mod.inspect(root))
            self.assertIn("router", output)
            self.assertIn("save_exchange", output)
            self.assertNotIn("super-private", output)
            self.assertNotIn("CREDENTIAL-ABC", output)
            self.assertNotIn("error-code-123", output)
            self.assertNotIn("private", output)

    def test_missing_runtime_files(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertIn("not found", str(mod.inspect(Path(d))))


if __name__ == "__main__":
    unittest.main()
