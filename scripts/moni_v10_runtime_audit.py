#!/usr/bin/env python3
"""Safe, read-only inspection of actual MONI V10 conversational runtime files.

Reports paths and AST symbol NAMES only. Never prints source code, environment
variables, tokens, memory contents, prompts, or service configuration.
"""
import argparse
import ast
import json
from pathlib import Path

REQUIRED = ("moni_chat.py", "context_builder.py", "conversation_memory.py", "llm_router.py")


def inspect_runtime(root: Path) -> dict:
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
            except (OSError, UnicodeError, SyntaxError) as exc:
                item["syntax"] = type(exc).__name__
        files.append(item)
    return {"root": str(root), "read_only": True, "files": files,
            "found_all": all(f["exists"] for f in files)}


def main() -> int:
    parser = argparse.ArgumentParser(description="MONI V10 read-only runtime inventory")
    parser.add_argument("--root", type=Path,
                        default=Path.home()/"MONI_V10_UNIFIED_RUNTIME"/"runtime"/"conversation")
    args = parser.parse_args()
    print(json.dumps(inspect_runtime(args.root.expanduser()), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
