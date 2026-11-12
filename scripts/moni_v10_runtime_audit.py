#!/usr/bin/env python3
"""Read-only structural inspection of the four existing MONI V10 Python modules.

Never imports or executes inspected modules. The default reports only top-level
symbol names. --interfaces also lists function parameter names and references
to a small allowlist of known runtime functions; never source or values.
"""
import argparse
import ast
import json
from pathlib import Path

REQUIRED = ("moni_chat.py", "context_builder.py", "conversation_memory.py", "llm_router.py")
RUNTIME_MODULES = frozenset(p[:-3] for p in REQUIRED)
KNOWN_CALLS = frozenset((
    "ask", "available", "opener", "build_context", "keywords", "read_pairs",
    "save_exchange", "load_recent", "memory_status", "answer_chronology",
    "classify", "normalize", "record", "respond", "router", "status", "self_test",
    "MemoryStore",
))


def _params(node: ast.AST) -> list[str]:
    args = node.args
    return [x.arg for x in (*args.posonlyargs, *args.args, *args.kwonlyargs)] + (
        [args.vararg.arg] if args.vararg else []
    ) + ([args.kwarg.arg] if args.kwarg else [])


def _calls(node: ast.AST) -> list[str]:
    names = set()
    for child in ast.walk(node):
        if isinstance(child, ast.Call):
            func = child.func
            # Report only allowed API names, never call arguments or values.
            name = func.id if isinstance(func, ast.Name) else (
                func.attr if isinstance(func, ast.Attribute) else ""
            )
            if name in KNOWN_CALLS:
                names.add(name)
    return sorted(names)


def _interfaces(tree: ast.Module) -> dict:
    imports = set()
    functions = []
    classes = []
    for node in tree.body:
        if isinstance(node, ast.Import):
            imports.update(
                name.name.partition(".")[0] for name in node.names
                if name.name.partition(".")[0] in RUNTIME_MODULES
            )
        elif isinstance(node, ast.ImportFrom):
            base = (node.module or "").partition(".")[0]
            if base in RUNTIME_MODULES:
                imports.add(base)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append({"name": node.name, "params": _params(node),
                              "known_calls": _calls(node)})
        elif isinstance(node, ast.ClassDef):
            classes.append({
                "name": node.name,
                "methods": [{"name": child.name, "params": _params(child),
                             "known_calls": _calls(child)}
                            for child in node.body
                            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef))]
            })
    return {"local_module_imports": sorted(imports),
            "functions": sorted(functions, key=lambda x: x["name"]),
            "classes": sorted(classes, key=lambda x: x["name"])}


def inspect_runtime(root: Path, *, interfaces: bool = False) -> dict:
    files = []
    for name in REQUIRED:
        path = root / name
        item = {"name": name, "exists": path.is_file()}
        if path.is_file():
            try:
                tree = ast.parse(path.read_text(encoding="utf-8"), filename=name)
                item["syntax"] = "ok"
                item["symbols"] = sorted(node.name for node in tree.body
                                         if isinstance(node, (ast.FunctionDef,
                                                              ast.AsyncFunctionDef,
                                                              ast.ClassDef)))[:50]
                if interfaces:
                    item["interfaces"] = _interfaces(tree)
            except (OSError, UnicodeError, SyntaxError) as exc:
                item["syntax"] = type(exc).__name__
        files.append(item)
    return {"root": str(root), "read_only": True, "files": files,
            "found_all": all(f["exists"] for f in files)}


def main() -> int:
    parser = argparse.ArgumentParser(description="MONI V10 read-only runtime inventory")
    parser.add_argument("--root", type=Path,
                        default=Path.home()/"MONI_V10_UNIFIED_RUNTIME"/"runtime"/"conversation")
    parser.add_argument("--interfaces", action="store_true",
                        help="Include parameter names and known runtime calls (never values)")
    args = parser.parse_args()
    print(json.dumps(inspect_runtime(args.root.expanduser(), interfaces=args.interfaces),
                     indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
