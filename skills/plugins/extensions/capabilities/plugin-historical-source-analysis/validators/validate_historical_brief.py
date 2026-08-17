"""Validate a HistAgent plugin capability historical research brief submission.

The submission JSON is produced by ResearchSpec's script-validator runner and contains
`outputs` entries. This validator accepts an absolute output path so the workspace file
can be inspected from the capability package working directory. It verifies that the
`research_brief` output exists, parses as JSON, and contains the package-declared
evidence-bearing sections.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEFAULT_REQUIRED_KEYS = (
    "scope",
    "source_ledger",
    "gate_trace",
    "evidence_ledger",
    "conflicts",
    "limitations",
    "synthesis",
)


def fail(message: str) -> int:
    print(f"historical_brief_invalid: {message}", file=sys.stderr)
    return 1


def required_keys(values: str | None) -> tuple[str, ...]:
    if values is None or not values.strip():
        return DEFAULT_REQUIRED_KEYS
    keys = tuple(key.strip() for key in values.split(",") if key.strip())
    if not keys:
        raise argparse.ArgumentTypeError("required keys must not be empty")
    return keys


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--submission", required=True)
    parser.add_argument("--required", default=None, help="comma-separated required research_brief fields")
    args = parser.parse_args(argv)

    keys = required_keys(args.required)

    try:
        submission = json.loads(Path(args.submission).read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        return fail(f"cannot read submission JSON: {error}")

    outputs = submission.get("outputs")
    if not isinstance(outputs, list):
        return fail("outputs must be an array")

    brief = next((item for item in outputs if isinstance(item, dict) and item.get("role") == "research_brief"), None)
    if brief is None:
        return fail("missing research_brief output role")

    path_value = brief.get("path")
    if not isinstance(path_value, str) or not path_value.strip():
        return fail("research_brief path is empty")

    output_path = Path(path_value)
    if not output_path.is_absolute():
        output_path = Path.cwd() / output_path
    try:
        brief_value = json.loads(output_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        return fail(f"cannot read research brief: {error}")

    if not isinstance(brief_value, dict):
        return fail("research brief root must be a JSON object")
    missing = [key for key in keys if key not in brief_value]
    if missing:
        return fail(f"research brief is missing required fields: {', '.join(missing)}")

    for key in keys:
        if brief_value[key] in (None, "", [], {}):
            return fail(f"research brief field is empty: {key}")

    print("historical_brief_valid")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
