#!/usr/bin/env python3
"""Stage a fail-closed MONI V10 fallback patch; NEVER change installed runtime.

Reads local source to validate its structure, but never runs or imports it.
Outputs a private candidate in a caller-chosen staging directory only.
"""
import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat

TAG = 'MONI_V10_MODEL_FALLBACK_V1'
DEFAULT_ROOT = Path.home() / 'MONI_V10_UNIFIED_RUNTIME' / 'runtime' / 'conversation'
MAX_SOURCE_BYTES = 1024 * 1024


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
    for function in (fn, model):
        args = function.args
        if (len(args.args) != 1 or args.args[0].arg != 'message'
                or args.posonlyargs or args.kwonlyargs or args.vararg
                or args.kwarg or args.defaults):
            raise ValueError(f'{function.name}(message) signature not matched')
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


def _absolute(path: Path) -> Path:
    path = path.expanduser()
    if not path.is_absolute() or '..' in path.parts:
        raise ValueError('Absolute paths without parent traversal are required')
    return path


def _directory(path: Path, *, create: bool = False) -> int:
    # Walk with pinned directory descriptors; resolve() would hide symlinks.
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for index, name in enumerate(path.parts[1:]):
            if create:
                try:
                    os.mkdir(name, mode=0o700, dir_fd=fd)
                except FileExistsError:
                    pass
            next_fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = next_fd
            # /tmp itself is shared; every directory beneath it must be private.
            if create and index > 0:
                info = os.fstat(fd)
                if info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) & 0o077:
                    raise ValueError('Staging directories must be private and owned by this user')
        return fd
    except BaseException:
        os.close(fd)
        raise


def _source(root_fd: int, name: str) -> str:
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=root_fd)
    with os.fdopen(fd, 'rb') as source:
        info = os.fstat(source.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_size > MAX_SOURCE_BYTES:
            raise ValueError('Source must be a bounded regular file')
        data = source.read(MAX_SOURCE_BYTES + 1)
        if len(data) > MAX_SOURCE_BYTES:
            raise ValueError('Source exceeded size limit')
    return data.decode('utf-8')


def stage_candidate(root: Path, out: Path) -> dict:
    root, out = _absolute(root), _absolute(out)
    if out == Path('/tmp') or not out.is_relative_to('/tmp'):
        raise ValueError('Staging must be a private directory beneath /tmp')
    if out.is_relative_to(root) or root.is_relative_to(out):
        raise ValueError('Staging must not overlap the installed runtime')
    root_fd = _directory(root)
    try:
        candidate, report = build_candidate(_source(root_fd, 'moni_chat.py'),
                                             _source(root_fd, 'llm_router.py'))
    finally:
        os.close(root_fd)
    out_fd = _directory(out, create=True)
    try:
        # O_EXCL rejects existing files, hard links and even dangling symlinks.
        # Mode is private at creation, not chmod(path) after a public write.
        fd = os.open('moni_chat.py', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                     0o600, dir_fd=out_fd)
        with os.fdopen(fd, 'w', encoding='utf-8') as target:
            os.fchmod(target.fileno(), 0o600)
            target.write(candidate)
        # Do not report a pathname whose ancestors were swapped during staging.
        check_fd = _directory(out)
        try:
            before, after = os.fstat(out_fd), os.fstat(check_fd)
            if (before.st_dev, before.st_ino) != (after.st_dev, after.st_ino):
                raise ValueError('Staging directory changed during write')
        finally:
            os.close(check_fd)
    finally:
        os.close(out_fd)
    return {**report, 'status': 'STAGED_FOR_REVIEW',
            'installed_runtime_untouched': True, 'candidate_path': str(out / 'moni_chat.py')}


def main() -> int:
    parser = argparse.ArgumentParser(description='Stage a safe MONI conversation fallback upgrade')
    parser.add_argument('--root', type=Path, default=DEFAULT_ROOT)
    parser.add_argument('--stage-dir', type=Path, default=Path('/tmp/moni-v10-review'))
    args = parser.parse_args()
    try:
        print(json.dumps(stage_candidate(args.root, args.stage_dir), ensure_ascii=False, indent=2))
        return 0
    except (OSError, UnicodeError, SyntaxError, ValueError) as exc:
        print(json.dumps({'status': 'REFUSED', 'installed_runtime_untouched': True,
                          'reason': str(exc)}, ensure_ascii=False))
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
