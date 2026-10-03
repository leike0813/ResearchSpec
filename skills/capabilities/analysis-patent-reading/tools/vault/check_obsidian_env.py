#!/usr/bin/env python
"""Report only the explicitly selected Obsidian vault without changing configuration."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from shared.common import probe_obsidian_environment


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault", help="Explicit vault directory")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--require-vault", action="store_true")
    args = parser.parse_args(argv)
    report = probe_obsidian_environment(explicit=args.vault)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"STATUS: {report['status']}")
        print(f"VAULT: {report.get('vault') or '(未配置)'}")
        print(f"MESSAGE: {report.get('message') or ''}")
    return 2 if args.require_vault and report["status"] != "ready" else 0


if __name__ == "__main__":
    raise SystemExit(main())
