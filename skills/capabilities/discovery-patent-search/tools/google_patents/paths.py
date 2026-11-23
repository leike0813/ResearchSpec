# -*- coding: utf-8 -*-
"""输出路径守卫：写产物前确认落在项目根内，且不碰 researchspec/ 工作流状态。

规则：
- 输出目录必须是显式项目根的子目录；越界（含符号链接指向根外）一律拒绝。
- 路径含 .. 一律拒绝，不做规范化后再判断。
- researchspec/ 是 ResearchSpec 工作流状态目录，任何产物都不写进去。
- 写既有文件前先做符号链接检查；目标已存在则报错，不覆盖。
"""
from __future__ import annotations

import os
from pathlib import Path

WORKFLOW_DIRNAME = "researchspec"


class UnsafePathError(ValueError):
    """输出路径越界、含 ..、或指向工作流状态目录。"""


def _real(path: Path) -> Path:
    return Path(os.path.realpath(str(path)))


def resolve_project_root(raw: str | Path | None = None) -> Path:
    """解析显式项目根；缺省用当前工作目录。"""
    root = Path(raw).expanduser() if raw else Path.cwd()
    resolved = _real(root)
    if not resolved.is_dir():
        raise UnsafePathError(f"项目根目录不存在：{root}")
    return resolved


def _is_inside(child: Path, parent: Path) -> bool:
    return child == parent or parent in child.parents


def resolve_output_dir(root: Path, candidate: str | Path) -> Path:
    """把输出目录解析到项目根内。

    相对路径按项目根解析；绝对路径必须已经落在项目根内。
    """
    root = _real(root)
    raw = Path(str(candidate)).expanduser()
    if ".." in raw.parts:
        raise UnsafePathError(f"输出路径不得包含 '..'：{candidate}")
    target = raw if raw.is_absolute() else root / raw
    if ".." in target.parts:
        raise UnsafePathError(f"输出路径不得包含 '..'：{candidate}")
    resolved = _real(target)
    if not _is_inside(resolved, root):
        raise UnsafePathError(f"输出路径越出项目根目录：{candidate}")
    workflow = root / WORKFLOW_DIRNAME
    if _is_inside(resolved, workflow):
        raise UnsafePathError(f"输出路径不得写入 researchspec/ 工作流状态目录：{candidate}")
    return resolved


def ensure_write_target(root: Path, path: Path) -> Path:
    """确认单个文件的父目录仍在项目根内，且目标本身不是符号链接。"""
    root = _real(root)
    parent = _real(path.parent)
    if not _is_inside(parent, root):
        raise UnsafePathError(f"输出路径越出项目根目录：{path}")
    workflow = root / WORKFLOW_DIRNAME
    if _is_inside(parent, workflow):
        raise UnsafePathError(f"输出路径不得写入 researchspec/ 工作流状态目录：{path}")
    if path.is_symlink():
        raise UnsafePathError(f"拒绝写入符号链接：{path}")
    return path


def write_text_new(root: Path, path: Path, text: str, *, encoding: str = "utf-8") -> Path:
    """独占写入：目标已存在则报错，绝不覆盖既有产物。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    ensure_write_target(root, path)
    try:
        with path.open("x", encoding=encoding) as handle:
            handle.write(text)
    except FileExistsError as exc:
        raise FileExistsError(f"拒绝覆盖既有文件：{path}") from exc
    return path


def write_bytes_new(root: Path, path: Path, payload: bytes) -> Path:
    """独占写入二进制：目标已存在则报错。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    ensure_write_target(root, path)
    try:
        with path.open("xb") as handle:
            handle.write(payload)
    except FileExistsError as exc:
        raise FileExistsError(f"拒绝覆盖既有文件：{path}") from exc
    return path


def refuse_existing(paths: list[Path]) -> None:
    """批量预检：任一目标已存在就整体拒绝，避免半写产物。"""
    existing = [str(path) for path in paths if path.exists() or path.is_symlink()]
    if existing:
        raise FileExistsError("拒绝覆盖既有产物：" + "、".join(sorted(existing)))
