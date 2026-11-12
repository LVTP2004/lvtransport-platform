"""Pure offline safety tests; do not access active MONI runtime."""
import ast
import importlib.util
import contextlib
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

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
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(dir='/tmp')
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.root = self.base / 'runtime'
        self.root.mkdir(mode=0o700)
        (self.root / 'moni_chat.py').write_text(CHAT)
        (self.root / 'llm_router.py').write_text(LLM)
        self.out = self.base / 'staging'
        self.originals = {p.name: p.read_bytes() for p in self.root.iterdir()}

    def assert_runtime_unchanged(self):
        self.assertEqual(self.originals, {p.name: p.read_bytes() for p in self.root.iterdir()})

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

    def test_cli_stages_private_candidate_without_importing_runtime(self):
        marker = self.base / 'must-not-exist'
        source = f'raise RuntimeError({str(marker)!r})\n' + CHAT
        (self.root / 'moni_chat.py').write_text(source)
        self.originals['moni_chat.py'] = source.encode()
        output = io.StringIO()
        with patch('sys.argv', ['stage', '--root', str(self.root), '--stage-dir', str(self.out)]), \
             contextlib.redirect_stdout(output):
            self.assertEqual(mod.main(), 0)
        report = json.loads(output.getvalue())
        self.assertEqual(report['status'], 'STAGED_FOR_REVIEW')
        candidate = Path(report['candidate_path'])
        ast.parse(candidate.read_text())
        self.assertEqual(stat.S_IMODE(candidate.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.out.stat().st_mode), 0o700)
        self.assert_runtime_unchanged()
        self.assertFalse(marker.exists())

    def test_rejects_relative_traversal_outside_tmp_and_runtime_overlap(self):
        for out in (Path('relative'), Path('/var/tmp/candidate'), Path('/tmp'),
                    self.base / '..' / 'escape', self.root, self.root / 'nested', self.base):
            with self.subTest(out=str(out)), self.assertRaises((ValueError, OSError)):
                mod.stage_candidate(self.root, out)
            self.assert_runtime_unchanged()

    def test_refuses_existing_candidate_symlink_and_hardlink(self):
        self.out.mkdir(mode=0o700)
        target = self.out / 'moni_chat.py'
        for kind in ('file', 'symlink', 'dangling', 'hardlink'):
            if kind == 'file': target.write_text('keep me')
            if kind == 'symlink': target.symlink_to(self.root / 'moni_chat.py')
            if kind == 'dangling': target.symlink_to(self.base / 'absent.py')
            if kind == 'hardlink': os.link(self.root / 'moni_chat.py', target)
            with self.subTest(kind=kind), self.assertRaises(OSError):
                mod.stage_candidate(self.root, self.out)
            self.assert_runtime_unchanged()
            self.assertFalse((self.base / 'absent.py').exists())
            if kind == 'file': self.assertEqual(target.read_text(), 'keep me')
            target.unlink()

    def test_refuses_symlinked_source_or_directory_ancestors(self):
        for name in ('moni_chat.py', 'llm_router.py'):
            target = self.root / name
            original = target.read_bytes()
            backup = self.base / ('source-' + name)
            target.rename(backup)
            target.symlink_to(backup)
            with self.assertRaises(OSError): mod.stage_candidate(self.root, self.out)
            self.assertEqual(backup.read_bytes(), original)
            target.unlink()
            backup.rename(target)
        alias = self.base / 'alias'
        alias.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(OSError): mod.stage_candidate(alias, self.out)
        self.out.mkdir(mode=0o700)
        stage_alias = self.base / 'stage-alias'
        stage_alias.symlink_to(self.out, target_is_directory=True)
        with self.assertRaises(OSError): mod.stage_candidate(self.root, stage_alias / 'child')
        self.assert_runtime_unchanged()

    def test_refuses_public_staging_permissions(self):
        self.out.mkdir(mode=0o700)
        self.out.chmod(0o755)
        with self.assertRaisesRegex(ValueError, 'private'):
            mod.stage_candidate(self.root, self.out)
        self.assert_runtime_unchanged()
        self.assertFalse((self.out / 'moni_chat.py').exists())

    def test_refuses_staging_owned_by_another_user(self):
        # Only the ownership query is substituted; no chown or privileges needed.
        with patch.object(mod.os, 'getuid', return_value=os.getuid() + 1):
            with self.assertRaisesRegex(ValueError, 'owned'):
                mod.stage_candidate(self.root, self.out)
        self.assert_runtime_unchanged()

    def test_swapped_directory_does_not_redirect_writes_into_runtime(self):
        real_open = os.open
        moved = self.base / 'moved-staging'
        def racing_open(path, flags, *args, **kwargs):
            if path == 'moni_chat.py' and flags & os.O_CREAT:
                self.out.rename(moved)
                self.out.symlink_to(self.root, target_is_directory=True)
            return real_open(path, flags, *args, **kwargs)
        with patch.object(mod.os, 'open', side_effect=racing_open), self.assertRaises(OSError):
            mod.stage_candidate(self.root, self.out)
        self.assert_runtime_unchanged()
        self.assertTrue((moved / 'moni_chat.py').is_file())

    def test_symlink_race_cannot_overwrite_installed_source(self):
        real_open = os.open
        def racing_open(path, flags, *args, **kwargs):
            if path == 'moni_chat.py' and flags & os.O_CREAT:
                (self.out / 'moni_chat.py').symlink_to(self.root / 'moni_chat.py')
            return real_open(path, flags, *args, **kwargs)
        with patch.object(mod.os, 'open', side_effect=racing_open), self.assertRaises(OSError):
            mod.stage_candidate(self.root, self.out)
        self.assert_runtime_unchanged()

    def test_refuses_special_source_file_without_blocking(self):
        (self.root / 'llm_router.py').unlink()
        os.mkfifo(self.root / 'llm_router.py', 0o600)
        with self.assertRaisesRegex(ValueError, 'regular file'):
            mod.stage_candidate(self.root, self.out)
        self.assertEqual((self.root / 'moni_chat.py').read_text(), CHAT)

    def test_refuses_unmatched_signatures_and_oversized_source(self):
        for source in ('def ask(message, *, required):\n    pass\n',
                       'def ask(message, *args):\n    pass\n'):
            with self.assertRaisesRegex(ValueError, 'signature'):
                mod.build_candidate(CHAT, source)
        (self.root / 'llm_router.py').write_text('#' * (mod.MAX_SOURCE_BYTES + 1))
        with self.assertRaisesRegex(ValueError, 'bounded'):
            mod.stage_candidate(self.root, self.out)

    def test_cli_refusal_reports_no_installation(self):
        output = io.StringIO()
        with patch('sys.argv', ['stage', '--root', str(self.root), '--stage-dir', str(self.root)]), \
             contextlib.redirect_stdout(output):
            self.assertEqual(mod.main(), 2)
        report = json.loads(output.getvalue())
        self.assertEqual(report['status'], 'REFUSED')
        self.assertTrue(report['installed_runtime_untouched'])
        self.assert_runtime_unchanged()

if __name__ == '__main__':
    unittest.main()
