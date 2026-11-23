# -*- coding: utf-8 -*-
"""Google Patents 的默认参数；可从 config.yaml 的 google_patents 段覆盖。

只读 num 与 timeout_s。没有 PyYAML 时退回内置默认值，不报错。
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

DEFAULT_NUM = 10
DEFAULT_TIMEOUT = 20.0
MAX_NUM = 100


def load_google_patents_config(path: Path | None = None) -> dict[str, Any]:
    cfg: dict[str, Any] = {"num": DEFAULT_NUM, "timeout_s": DEFAULT_TIMEOUT}
    if path is None or not path.is_file():
        return cfg
    try:
        import yaml
    except ImportError:
        return cfg
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return cfg
    section = data.get("google_patents") if isinstance(data, dict) else None
    if not isinstance(section, dict):
        return cfg
    num = section.get("num")
    if isinstance(num, int) and not isinstance(num, bool) and num > 0:
        cfg["num"] = min(int(num), MAX_NUM)
    timeout = section.get("timeout_s")
    if isinstance(timeout, (int, float)) and not isinstance(timeout, bool) and timeout > 0:
        cfg["timeout_s"] = float(timeout)
    return cfg
