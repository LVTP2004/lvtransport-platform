#!/usr/bin/env python3
"""Stage a fail-closed MONI V10 fallback patch; NEVER change installed runtime.

Reads local source to validate its structure, but never runs or imports it.
Outputs a private candidate in a caller-chosen staging directory only.
"""
import argparse
import ast
import hashlib
import json
from pathlib import Path

TAG = 'MONI_V10_MODEL_FALLBACK_V1'
DEFAULT_ROOT = Path.home() / 'MONI_V10_UNIFIED_RUNTIME' / 'runtime' / 'conversation'


def build_candidate(source: str, llm_source: str) -> tuple[str, dict]:
    if TAG in source:
        raise ValueError('Already patched; refusing a duplicate insertion')
    module = ast.parse(source)
    llm = ast.parse(llm_source)
    respond = [n for n in module.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == 'respond']
    ask = [n for n in llm.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == 'ask']
    if len(respond) != 1 or len(ask) != 1:
        raise ValueError('Expected exactly one top-level respond() and ask()')
    fn, model = respond[0], ask[0]
    if isinstance(fn, ast.AsyncFunctionDef) or isinstance(model, ast.AsyncFunctionDef):
        raise ValueError('Async functions require a separately reviewed integration')
    if not fn.args.args or fn.args.args[0].arg != 'message':
        raise ValueError('respond(message) signature not matched')
    if len(model.args.args) != 1 or model.args.args[0].arg != 'message':
        raise ValueError('ask(message) signature not matched')
    # Only insert immediately before a final unconditional *top-level* return.
    if not fn.body or not isinstance(fn.body[-1], ast.Return):
        raise ValueError('respond() has no unconditional final return; no safe patch point')
    terminal = fn.body[-1]
    if not isinstance(terminal.value, ast.Constant) or not isinstance(terminal.value.value, str):
        raise ValueError('Final fallback is not a simple string literal')
    if terminal.end_lineno != terminal.lineno:
        raise ValueError('Multiline fallback needs manual review')
    lines = source.splitlines(keepends=True)
    if not lines or not lines[terminal.lineno - 1].lstrip().startswith('return '):
        raise ValueError('Unexpected fallback source line')
    prefix = lines[terminal.lineno - 1].split('return ', 1)[0]
    if not prefix.isspace() or len(prefix) < 4:
        raise ValueError('Unexpected return indentation')
    block = [
        f'{prefix}# {TAG}: local conversation only; no arbitrary tool execution.\n',
        f'{prefix}try:\n',
        f'{prefix}    from llm_router import ask as _moni_local_ask\n',
        f'{prefix}    _moni_text = _moni_local_ask(message)\n',
        f'{prefix}    if isinstance(_moni_text, str) and _moni_text.strip():\n',
        f'{prefix}        return _moni_text\n',
        f'{prefix}except (ImportError, OSError, TimeoutError, ValueError, TypeError):\n',
        f'{prefix}    pass\n',
    ]
    candidate = ''.join(lines[:terminal.lineno - 1] + block + lines[terminal.lineno - 1:])
    ast.parse(candidate)
    return candidate, {
        'safe_point': 'final unconditional string return in respond()',
        'fallback_line': terminal.lineno,
        'injected_lines': len(block),
        'original_sha256': hashlib.sha256(source.encode('utf-8')).hexdigest(),
        'candidate_sha256': hashlib.sha256(candidate.encode('utf-8')).hexdigest(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description='Stage a safe MONI conversation fallback upgrade')
    parser.add_argument('--root', type=Path, default=DEFAULT_ROOT)
    parser.add_argument('--stage-dir', type=Path, default=Path('/tmp/moni-v10-review'))
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    out = args.stage_dir.expanduser().resolve()
    try:
        # Fail closed on symlinks, prevents accidentally reading a different runtime.
        for name in ('moni_chat.py', 'llm_router.py'):
            if (root / name).is_symlink():
                raise ValueError(f'Symlink refused for {name}')
        source = (root / 'moni_chat.py').read_text(encoding='utf-8')
        llm_source = (root / 'llm_router.py').read_text(encoding='utf-8')
        candidate, report = build_candidate(source, llm_source)
        out.mkdir(parents=True, exist_ok=True)
        target = out / 'moni_chat.py'
        if target.exists():
            raise ValueError('Staging candidate already exists; refusing overwrite')
        target.write_text(candidate, encoding='utf-8')
        target.chmod(0o600)
        print(json.dumps({**report, 'status': 'STAGED_FOR_REVIEW',
                          'installed_runtime_untouched': True, 'candidate_path': str(target)},
                         ensure_ascii=False, indent=2))
        return 0
    except (OSError, UnicodeError, SyntaxError, ValueError) as exc:
        print(json.dumps({'status': 'REFUSED', 'installed_runtime_untouched': True,
                          'reason': str(exc)}, ensure_ascii=False))
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
