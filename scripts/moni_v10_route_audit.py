#!/usr/bin/env python3
"""Inspect MONI V10's routing shape without executing local runtime or exposing literals."""
import ast
import json
from pathlib import Path

ROOT = Path.home() / 'MONI_V10_UNIFIED_RUNTIME' / 'runtime' / 'conversation'
TARGETS = {'moni_chat.py': ('respond', 'router'), 'llm_router.py': ('ask',)}
KNOWN = {'ask', 'respond', 'router', 'classify', 'record', 'status', 'available', 'build_context', 'save_exchange', 'answer_chronology'}


def func_name(expr):
    if isinstance(expr, ast.Name):
        return expr.id
    if isinstance(expr, ast.Attribute):
        if isinstance(expr.value, ast.Name):
            return f'{expr.value.id}.{expr.attr}'
        return expr.attr
    return None


def summarize(node):
    calls = []
    outcomes = []
    for stmt in ast.walk(node):
        if isinstance(stmt, ast.Call):
            name = func_name(stmt.func)
            if name and name.split('.')[-1] in KNOWN:
                calls.append(name)
        elif isinstance(stmt, ast.Return):
            value = stmt.value
            if isinstance(value, ast.Call):
                kind = 'call:' + str(func_name(value.func) or 'dynamic')
            else:
                kind = type(value).__name__ if value is not None else 'None'
            outcomes.append({'line': stmt.lineno, 'kind': kind})
    return {
        'name': node.name,
        'starts_at': node.lineno,
        'branch_count': sum(isinstance(n, (ast.If, ast.Match, ast.Try, ast.IfExp)) for n in ast.walk(node)),
        'known_calls': sorted(set(calls)),
        'returns': sorted(outcomes, key=lambda x: x['line'])[:40],
        'uses_dynamic_lookup': any(isinstance(n, ast.Call) and func_name(n.func) in ('getattr', 'eval', 'exec') for n in ast.walk(node)),
    }


def inspect(root=ROOT):
    response = {}
    for file, wanted in TARGETS.items():
        path = root / file
        if not path.is_file():
            response[file] = {'error': 'not found'}
            continue
        try:
            tree = ast.parse(path.read_text(encoding='utf-8'), filename=file)
        except (SyntaxError, UnicodeError, OSError) as exc:
            response[file] = {'error': type(exc).__name__}
            continue
        response[file] = [summarize(n) for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name in wanted]
    return response


if __name__ == '__main__':
    print(json.dumps({'read_only': True, 'routing': inspect()}, indent=2, ensure_ascii=False))
