<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: script
能力/包 ID: RM-SCRIPT-07 commit-revision-round
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/scripts/commit_revision_round.py（全文）
变更台账（ledger）:
    1. [保留] 上游文件全文逐字节保留。
    2. [标注] 流程权威（stage 推进、Gate、状态机）在 authoring 阶段移交 graph engine。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def emit(payload: dict[str, Any], exit_code: int = 0) -> int:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, indent=2))
    sys.stdout.write("\n")
    return exit_code


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Commit one Agent-authored revision round: write semantic audit payload, then rerun gate-and-render.")
    parser.add_argument("--artifact-root", required=True)
    parser.add_argument("--payload", required=True, help="JSON object, or @path/to/payload.json, containing the Agent-authored revision log.")
    return parser.parse_args()


def run_json(script: Path, args: list[str]) -> dict[str, Any]:
    completed = subprocess.run(
        [sys.executable, "-u", str(script), *args],
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"{script.name} failed: {completed.stdout}\n{completed.stderr}")
    return json.loads(completed.stdout)


def main() -> int:
    args = parse_args()
    script_root = Path(__file__).resolve().parent
    capture_script = script_root / "capture_revision_action.py"
    gate_script = script_root / "gate_and_render_workspace.py"
    capture_args = ["--artifact-root", args.artifact_root, "--payload", args.payload]
    try:
        capture_payload = run_json(capture_script, capture_args)
        gate_payload = run_json(gate_script, ["--artifact-root", args.artifact_root])
    except RuntimeError as exc:
        return emit({"status": "error", "error": str(exc)}, exit_code=1)
    return emit(
        {
            "status": "ok",
            "capture": capture_payload,
            "gate": gate_payload,
        }
    )


if __name__ == "__main__":
    raise SystemExit(main())
