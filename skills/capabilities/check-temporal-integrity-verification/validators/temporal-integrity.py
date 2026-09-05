"""ResearchSpec report generation and read-only submission verification.

ResearchSpec-authored adapter, CC BY-NC 4.0. Algorithms are attributed in
the accompanying modules. No model services or workflow mutation.
"""
import argparse
import importlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True

CHECKS = {
    "temporal": ("temporal", "compute", "temporal_audit_report"),
    "pdf": ("pdf", "compute", "pdf_preflight_report"),
    "passport": ("documents", "compute_passport", "passport_report"),
    "submission": ("documents", "compute_submission", "submission_package_report"),
    "existence": ("citations", "compute_existence", "citation_verification_report"),
    "summary": ("citations", "compute_summary", "citation_summary"),
    "contamination": ("citations", "compute_contamination", "contamination_report"),
}


def strict_json(text):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("Duplicate JSON key")
            result[key] = value
        return result
    def constant(value):
        raise ValueError("Non-finite JSON number: " + value)
    return json.loads(text, object_pairs_hook=pairs, parse_constant=constant)


def paths(rows):
    if not isinstance(rows, list):
        raise ValueError("Expected role/path array")
    result = {}
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("role"), str) or not isinstance(row.get("path"), str):
            raise ValueError("Each input needs a role and path")
        if row["role"] in result or not row["role"]:
            raise ValueError("Duplicate or empty role")
        p = Path(row["path"])
        if not p.is_absolute():
            raise ValueError("Use absolute material paths")
        if not p.exists():
            raise ValueError("Material does not exist: " + str(p))
        result[row["role"]] = p
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("check", choices=CHECKS)
    parser.add_argument("submission", type=Path, help="JSON with inputs and, for validation, outputs role/path arrays")
    parser.add_argument("--generate", action="store_true", help="Print computed JSON report; never write workflow files")
    args = parser.parse_args()
    try:
        request = strict_json(args.submission.read_text(encoding="utf-8"))
        if not isinstance(request, dict):
            raise ValueError("Request must be an object")
        inputs = paths(request.get("inputs"))
        module, function, output_role = CHECKS[args.check]
        payload = getattr(importlib.import_module(module), function)(inputs)
        expected = {"schema_version": "1", "check": args.check,
                    "sources": {role: str(p) for role, p in inputs.items()}, "result": payload}
        if args.generate:
            print(json.dumps(expected, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False))
            return 0
        outputs = paths(request.get("outputs"))
        if output_role not in outputs:
            raise ValueError("Missing report role: " + output_role)
        actual = strict_json(outputs[output_role].read_text(encoding="utf-8"))
        canonical = lambda value: json.dumps(value, sort_keys=True, ensure_ascii=False, allow_nan=False)
        if canonical(actual) != canonical(expected):
            raise ValueError("Report does not match computation over current inputs")
        # Findings, including UNAVAILABLE, remain report data. Formal Gates
        # decide whether the scientific result permits progression.
        return 0
    except (OSError, ValueError, TypeError, KeyError, ImportError) as exc:
        print(json.dumps({"code": "checker_input_invalid", "detail": str(exc)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
