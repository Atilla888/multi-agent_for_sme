"""One-time, fail-closed extraction of non-secret P2 sources from preserved evidence.

The primary journal remains read-only. This script refuses to overwrite targets;
it does not replay shell commands, credentials, or ambiguous patches.
"""

from __future__ import annotations

import ast
import hashlib
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLATFORM = ROOT / "platform"
PRIMARY = Path(r"C:\Users\Asus\Desktop\PlatformRecovery\evidence\primary-2026-09-29.jsonl")
RECOVERY_TOOL = Path(r"C:\Users\Asus\Desktop\PlatformRecovery")
sys.path.insert(0, str(RECOVERY_TOOL))
from recover_session import decode_patch, patch_sections, safe_output, update_lines  # noqa: E402


def records(*numbers: int) -> dict[int, dict]:
    wanted = set(numbers)
    result: dict[int, dict] = {}
    with PRIMARY.open(encoding="utf-8") as stream:
        for number, line in enumerate(stream, 1):
            if number in wanted:
                result[number] = json.loads(line)["payload"]
    if result.keys() != wanted:
        raise RuntimeError("missing source evidence record")
    return result


def output(payload: dict) -> str:
    item = payload["item"]
    if item["type"] != "CommandExecution" or item["exit_code"] != 0:
        raise RuntimeError("source command was not successful")
    return item["stdout"].replace("\r\n", "\n")


def unique_split(source: str, markers: list[str]) -> list[str]:
    positions = [0]
    for marker in markers:
        if source.count(marker) != 1:
            raise RuntimeError("source boundary not unique")
        positions.append(source.index(marker))
    positions.append(len(source))
    if positions != sorted(positions):
        raise RuntimeError("source boundaries out of order")
    return [source[positions[i]:positions[i + 1]] for i in range(len(positions) - 1)]


def postgres_patch(source: str, payload: dict) -> str:
    patch, issue = decode_patch(payload["input"])
    if issue or patch is None:
        raise RuntimeError("PostgreSQL update is not literal")
    sections = [s for s in patch_sections(patch) if s["path"] == "services/backend/src/platform_backend/repositories/postgres.py"]
    if len(sections) != 1 or sections[0]["action"] != "Update":
        raise RuntimeError("unexpected PostgreSQL patch target")
    return "\n".join(update_lines(source.splitlines(), sections[0]["body"])) + "\n"


def main() -> None:
    evidence = records(3157, 3275, 3604, 4692, 4859)
    grouped = output(evidence[4692])
    brain_service, brain_contracts, executor = unique_split(grouped, [
        '"""Typed, non-LLM seven-part Business Brain contract and provenance.',
        '"""Trusted, non-LLM executor for the ten frozen business tools.',
    ])
    grouped = output(evidence[3157])
    postgres, context, errors, sources = unique_split(grouped, [
        '"""Trusted execution scope; never assembled from',
        '"""Stable, safe failures shared by domain ser',
        '"""Small authorized providers for the seven-part, read-only c',
    ])
    # Bound the final short ports file by the independently recovered sources tail.
    source_tail = "\n".join(sources.splitlines()[455:458])
    ports_output = output(evidence[4859])
    if ports_output.count(source_tail) != 1:
        raise RuntimeError("ports/source boundary not unique")
    ports = ports_output[:ports_output.index(source_tail)]
    postgres = postgres_patch(postgres, evidence[3275])
    postgres = postgres_patch(postgres, evidence[3604])
    files = {
        "services/backend/src/platform_backend/repositories/postgres.py": postgres,
        "services/backend/src/platform_backend/brain/contracts.py": brain_contracts,
        "services/backend/src/platform_backend/brain/service.py": brain_service,
        "services/backend/src/platform_backend/brain/sources.py": sources,
        "services/backend/src/platform_backend/tools/executor.py": executor,
        "services/backend/src/platform_backend/tools/ports.py": ports,
    }
    # Validate every candidate before any write.
    for relative, content in files.items():
        if not content.endswith("\n") or not safe_output(relative, content.splitlines()):
            raise RuntimeError(f"unsafe or incomplete candidate: {relative}")
        ast.parse(content, filename=relative)
        if (PLATFORM / relative).exists():
            raise RuntimeError(f"refusing overwrite: {relative}")
    for relative, content in files.items():
        target = PLATFORM / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8", newline="\n")
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        print(f"{relative}: {len(content.splitlines())} lines; SHA-256 {digest}")


if __name__ == "__main__":
    main()
