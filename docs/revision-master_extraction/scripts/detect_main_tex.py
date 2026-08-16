<!--
══════════════════════════════════════════════
Revision Master 提取工件（Extraction Artifact）
══════════════════════════════════════════════
工件类型: script
能力/包 ID: RM-SCRIPT-01 detect-main-tex
提取日期: 2026-08-16
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/revision-master/scripts/detect_main_tex.py（全文）
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
import re
import sys
from pathlib import Path
from typing import Any


MAIN_NAME_RE = re.compile(r"^(main|paper|manuscript|article|ms)$", re.IGNORECASE)


def emit(payload: dict[str, Any], exit_code: int = 0) -> int:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False, indent=2))
    sys.stdout.write("\n")
    return exit_code


def score_tex_candidate(path: Path) -> tuple[int, list[str]]:
    score = 0
    reasons: list[str] = []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="utf-8", errors="ignore")

    if "\\documentclass" in text:
        score += 2
        reasons.append("contains_documentclass")
    if "\\begin{document}" in text:
        score += 1
        reasons.append("contains_begin_document")
    if MAIN_NAME_RE.match(path.stem):
        score += 1
        reasons.append("main_like_filename")
    return score, reasons


def build_candidates(project_dir: Path) -> list[dict[str, Any]]:
    tex_files = sorted(
        [
            p
            for p in project_dir.rglob("*.tex")
            if not any(part.startswith(".") for part in p.relative_to(project_dir).parts)
        ]
    )
    candidates: list[dict[str, Any]] = []
    for tex_path in tex_files:
        score, reasons = score_tex_candidate(tex_path)
        if score > 0:
            candidates.append(
                {
                    "path": str(tex_path.resolve()),
                    "score": score,
                    "reasons": reasons,
                }
            )
    if candidates:
        candidates.sort(key=lambda item: (-int(item["score"]), str(item["path"])))
        return candidates
    return [{"path": str(tex_path.resolve()), "score": 0, "reasons": ["no_primary_markers_found"]} for tex_path in tex_files]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect the main .tex entry or candidate entries for a LaTeX manuscript source.")
    parser.add_argument("--manuscript-source", required=True, help="Path to a main .tex file or a LaTeX project directory.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manuscript_source = Path(args.manuscript_source).expanduser()
    if not manuscript_source.exists():
        return emit(
            {
                "status": "error",
                "error": f"manuscript source does not exist: {manuscript_source}",
            },
            exit_code=1,
        )

    if manuscript_source.is_file():
        if manuscript_source.suffix.lower() != ".tex":
            return emit(
                {
                    "status": "error",
                    "error": "single-file manuscript sources must point to a .tex file",
                },
                exit_code=1,
            )
        return emit(
            {
                "status": "ok",
                "input_kind": "single_tex",
                "main_entry": str(manuscript_source.resolve()),
                "candidates": [
                    {
                        "path": str(manuscript_source.resolve()),
                        "score": 1,
                        "reasons": ["single_tex_input"],
                    }
                ],
                "warnings": [],
            }
        )

    candidates = build_candidates(manuscript_source)
    if not candidates:
        return emit(
            {
                "status": "error",
                "input_kind": "latex_project",
                "main_entry": None,
                "candidates": [],
                "warnings": ["no_tex_files_found"],
            },
            exit_code=1,
        )

    warnings: list[str] = []
    main_entry: str | None = None
    if len(candidates) == 1:
        main_entry = str(candidates[0]["path"])
    else:
        warnings.append("multiple_main_tex_candidates_require_user_confirmation")

    return emit(
        {
            "status": "ok",
            "input_kind": "latex_project",
            "main_entry": main_entry,
            "candidates": candidates,
            "warnings": warnings,
        }
    )


if __name__ == "__main__":
    raise SystemExit(main())
