"""Pure offline safety tests; do not access active MONI runtime."""
import ast
import importlib.util
from pathlib import Path
import tempfile
import unittest

P = Path(__file__).resolve().parents[1] / "scripts" / "moni_v10_stage_chat_fallback.py"
spec = importlib.util.spec_from_file_location('stage_moni', P)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

LLM = 'def ask(message):\n    return message\n'
CHAT = (
    'def respond(message):\n'
    '    if message == "status":\n'
    '        return "status result"\n'
    '    return "Unrecognized"\n'
)

class SafeStageTests(unittest.TestCase):
    def test_patch_preserves_known_commands(self):
        candidate, data = mod.build_candidate(CHAT, LLM)
        self.assertEqual(data['injected_lines'], 8)
        self.assertIn(mod.TAG, candidate)
        self.assertIn('return "status result"', candidate)
        ast.parse(candidate)
        import sys, types
        fake = types.ModuleType('llm_router')
        fake.ask = lambda message: f'model said: {message}'
        original = sys.modules.get('llm_router')
        sys.modules['llm_router'] = fake
        try:
            scope = {}
            exec(compile(candidate, '<mock>', 'exec'), scope)
            self.assertEqual(scope['respond']('status'), 'status result')
            self.assertEqual(scope['respond']('hello'), 'model said: hello')
            fake.ask = lambda message: ''
            self.assertEqual(scope['respond']('hello'), 'Unrecognized')
        finally:
            if original is None:
                del sys.modules['llm_router']
            else:
                sys.modules['llm_router'] = original

    def test_refuses_conditional_terminal(self):
        with self.assertRaisesRegex(ValueError, 'no unconditional'):
            mod.build_candidate('def respond(message):\n    if message:\n        return "done"\n', LLM)

    def test_refuses_async_model(self):
        with self.assertRaisesRegex(ValueError, 'Async'):
            mod.build_candidate(CHAT, 'async def ask(message):\n    return message\n')

    def test_refuses_non_string_terminal(self):
        with self.assertRaisesRegex(ValueError, 'not a simple string'):
            mod.build_candidate('def respond(message):\n    return message\n', LLM)

    def test_refuses_duplicate(self):
        once, _ = mod.build_candidate(CHAT, LLM)
        with self.assertRaisesRegex(ValueError, 'Already patched'):
            mod.build_candidate(once, LLM)

    def test_does_not_write_to_live_runtime(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / 'moni_chat.py').write_text(CHAT, encoding='utf-8')
            (root / 'llm_router.py').write_text(LLM, encoding='utf-8')
            before = (root / 'moni_chat.py').read_bytes()
            candidate, report = mod.build_candidate(CHAT, LLM)
            (root / 'staged.py').write_text(candidate, encoding='utf-8')
            self.assertEqual(before, (root / 'moni_chat.py').read_bytes())
            self.assertNotEqual(report['original_sha256'], report['candidate_sha256'])

if __name__ == '__main__':
    unittest.main()
