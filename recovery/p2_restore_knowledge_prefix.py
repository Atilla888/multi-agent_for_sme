"""Restore only the exact recoverable prefix of M07 service/test evidence."""

from __future__ import annotations

import ast
import hashlib
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Asus\Desktop\PlatformRecovery")
sys.path.insert(0, str(SOURCE))
from recover_session import (  # noqa: E402
    PRIMARY,
    collect_calls,
    line_for_body,
    safe_output,
    update_lines,
)


def main() -> None:
    calls, _ = collect_calls(PRIMARY, "PRIMARY")
    specs = {
        "services/backend/src/platform_backend/knowledge/service.py": [3292, 3391, 3597, 3774],
        "tests/integration/test_knowledge.py": [3420, 3435, 3523, 3558, 3788, 3802],
    }
    ready: dict[str, str] = {}
    for relative, orders in specs.items():
        rows = [call for call in calls if call["order"] in orders]
        if [row["order"] for row in rows] != orders:
            raise RuntimeError(f"missing evidence for {relative}")
        lines: list[str] | None = None
        for call in rows:
            if call["status"] != "EXECUTED SUCCESSFULLY":
                raise RuntimeError(f"unsuccessful evidence at line {call['order']}")
            section = next((s for s in call["sections"] if s["path"] == relative), None)
            if section is None:
                raise RuntimeError(f"target absent at line {call['order']}")
            if section["action"] == "Add" and lines is None:
                lines = line_for_body(section["body"])
            elif section["action"] == "Update" and lines is not None:
                lines = update_lines(lines, section["body"])
            else:
                raise RuntimeError(f"unexpected action at line {call['order']}")
        if lines is None or not safe_output(relative, lines):
            raise RuntimeError(f"unsafe or empty source: {relative}")
        content = "\n".join(lines) + "\n"
        ast.parse(content, filename=relative)
        target = ROOT / "platform" / relative
        if target.exists():
            raise RuntimeError(f"refusing overwrite: {relative}")
        ready[relative] = content
    for relative, content in ready.items():
        target = ROOT / "platform" / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8", newline="\n")
        print(f"{relative}: {len(content.splitlines())} lines; prefix SHA-256 {hashlib.sha256(target.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    main()
