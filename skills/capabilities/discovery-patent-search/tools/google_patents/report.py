# -*- coding: utf-8 -*-
"""Google Patents 检索结果 → Markdown，并安全落盘。

只处理 source_id 为 google_patents 的载荷，不改动 CNIPA 检索报告器。
落盘遵守 google_patents.paths：项目根内、不写 researchspec/、不覆盖既有文件。
"""
from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Any

from .paths import write_text_new

GOOGLE_SOURCE_ID = "google_patents"
REPORT_PREFIX = "SEARCH"
DEFAULT_OUTPUT_DIR = "outputs/patent-search"

_TICK = chr(96)

_QUERY_LABELS = (
    ("keywords", "关键词"),
    ("title", "名称（TI）"),
    ("abstract", "摘要（AB）"),
    ("claims", "权利要求（CL）"),
    ("cpc", "CPC"),
    ("assignees", "申请人"),
    ("inventors", "发明人"),
    ("countries", "局别"),
    ("patent_type", "类型"),
    ("status", "状态"),
    ("language", "语言"),
    ("date_range", "日期"),
    ("sort", "排序"),
    ("num", "每页条数"),
    ("page", "页码"),
    ("note", "检索意图"),
    ("q", "实际查询式"),
)

_TYPE_LABELS = {"PATENT": "专利（含发明、实用新型）", "DESIGN": "外观设计"}
_STATUS_LABELS = {"GRANT": "授权", "APPLICATION": "申请公开"}
_SORT_LABELS = {"new": "最新优先", "old": "最早优先"}
_DATE_FIELD_LABELS = {"priority": "优先权日", "filing": "申请日", "publication": "公开日"}


def _text(value: Any, empty: str = "—") -> str:
    if value is None:
        return empty
    if isinstance(value, bool):
        return "是" if value else "否"
    if isinstance(value, (list, tuple)):
        parts = [str(item).strip() for item in value if str(item).strip()]
        return "；".join(parts) if parts else empty
    text = str(value).strip()
    return text if text else empty


def _md_escape(value: Any) -> str:
    return _text(value).replace("|", "\\|")


def _link(title: Any, url: Any) -> str:
    name = _text(title, empty="（无名称）")
    href = str(url or "").strip()
    return f"[{name}]({href})" if href else name


def _query_value(key: str, query: dict[str, Any]) -> str:
    value = query.get(key)
    if key == "patent_type":
        return _TYPE_LABELS.get(str(value), _text(value))
    if key == "status":
        return _STATUS_LABELS.get(str(value), _text(value))
    if key == "sort":
        return _SORT_LABELS.get(str(value), _text(value))
    if key == "date_range":
        after, before = query.get("after") or "", query.get("before") or ""
        if not (after or before):
            return ""
        label = _DATE_FIELD_LABELS.get(
            str(query.get("date_field") or ""), _text(query.get("date_field"))
        )
        return f"{label} {after or '…'} 至 {before or '…'}"
    if key == "q" and value:
        return _TICK + str(value) + _TICK
    return _text(value, empty="")


def render_google_report(payload: dict[str, Any], *, stamp: str, name: str) -> str:
    query = payload.get("query") or {}
    hits = list(payload.get("hits") or [])
    lines = [
        f"# 海外检索 {Path(name).stem}",
        "",
        f"- **查询时间**：{stamp}",
        f"- **数据源**：Google Patents（{_text(payload.get('source'), empty='https://patents.google.com/')}）",
        "- **范围**：仅已公开/公告文献；同族只记局别，不展开为多件",
        f"- **命中**：共 {_text(payload.get('total_results'))} 条；本页第 {_text(payload.get('page'))} 页，"
        f"返回 {_text(payload.get('returned'), empty='0')} 条",
        f"- **完整性**：{_text(payload.get('completeness_note'))}",
    ]
    web = str(payload.get("web_url") or "").strip()
    if web:
        lines.append(f"- **网页核对**：[在 Google Patents 打开同一检索]({web})")
    lines.extend(["", "## 查询条件", "", "| 字段 | 值 |", "| --- | --- |"])
    for key, label in _QUERY_LABELS:
        value = _query_value(key, query)
        if value:
            lines.append(f"| {label} | {_md_escape(value)} |")
    lines.extend(
        [
            "",
            "> 命中片段只是 Google 摘取的匹配句，不等于摘要；判断技术方案须打开详情页或交解读包取全文。",
            "",
            "## 检索结果",
            "",
        ]
    )
    if not hits:
        lines.append("本次无命中。")
        lines.append("")
        return "\n".join(lines)
    for index, row in enumerate(hits, start=1):
        link = row.get("link")
        lines.append(f"### {index}. {_link(row.get('title'), link)}")
        lines.append("")
        lines.append(f"- **公开号**：{_text(row.get('pub_number'))}")
        lines.append(f"- **局别**：{_text(row.get('country'))}")
        lines.append(f"- **文献种类**：{_text(row.get('kind'))}")
        lines.append(f"- **申请人**：{_text(row.get('applicant'))}")
        lines.append(f"- **发明人**：{_text(row.get('inventors'))}")
        lines.append(f"- **优先权日**：{_text(row.get('priority_date'))}")
        lines.append(f"- **申请日**：{_text(row.get('filing_date'))}")
        lines.append(f"- **公开日**：{_text(row.get('publication_date'))}")
        if row.get("grant_date"):
            lines.append(f"- **授权日**：{_text(row.get('grant_date'))}")
        family = row.get("family_countries") or []
        if family:
            lines.append(f"- **同族局别**：{_text(family)}")
        if row.get("pdf_url"):
            lines.append(f"- **PDF**：{_link('下载', row.get('pdf_url'))}")
        lines.append(f"- **命中片段**：{_text(row.get('snippet'), empty='（无）')}")
        lines.append("")
    return "\n".join(lines)


def report_filename(when: datetime) -> str:
    return f"{REPORT_PREFIX}-{when.strftime('%Y%m%d-%H%M%S')}.md"


def write_search_report(
    payload: dict[str, Any],
    *,
    project_root: Path,
    output_dir: Path,
    queried_at: datetime | None = None,
) -> Path:
    """把 Google 检索载荷写成 Markdown；目标已存在时换名，仍冲突则报错。"""
    when = queried_at or datetime.now()
    output_dir.mkdir(parents=True, exist_ok=True)
    name = report_filename(when)
    path = output_dir / name
    if path.exists() or path.is_symlink():
        name = f"{REPORT_PREFIX}-{when.strftime('%Y%m%d-%H%M%S')}-{os.getpid()}.md"
        path = output_dir / name
    body = render_google_report(
        payload, stamp=when.strftime("%Y-%m-%d %H:%M:%S"), name=name
    )
    return write_text_new(project_root, path, body)
