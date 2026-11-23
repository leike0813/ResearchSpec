# -*- coding: utf-8 -*-
"""解析 ``/xhr/query`` 返回的 JSON。"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .client import BASE_URL
from .errors import GooglePatentsBadResponse
from .html_text import strip_tags

PDF_HOST = "https://patentimages.storage.googleapis.com/"

_PUB_RE = re.compile(r"^([A-Z]{2})-?([A-Z]?\d+(?:-\d+)*?)-?([A-Z]\d?)?$")


@dataclass
class SearchHit:
    publication_number: str
    country: str
    kind: str
    title: str
    snippet: str
    assignee: str
    inventor: str
    priority_date: str
    filing_date: str
    publication_date: str
    grant_date: str
    language: str
    pdf_url: str
    url: str
    family_countries: list[str] = field(default_factory=list)


@dataclass
class SearchPage:
    total_results: int | None
    total_pages: int | None
    page: int
    num: int
    hits: list[SearchHit]


def split_publication_number(pub: str) -> tuple[str, str, str]:
    """``US11450918B2`` → ``("US", "11450918", "B2")``；无法识别时国别为空。"""
    p = re.sub(r"\s+", "", pub or "").upper()
    m = _PUB_RE.match(p)
    if not m:
        return "", p, ""
    return m.group(1), m.group(2).replace("-", ""), m.group(3) or ""


def patent_url(pub: str, lang: str = "en") -> str:
    p = re.sub(r"\s+", "", pub or "").upper()
    return f"{BASE_URL}/patent/{p}/{lang}" if lang else f"{BASE_URL}/patent/{p}"


def _int_or_none(value: Any) -> int | None:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        raise GooglePatentsBadResponse("检索结果页数字段类型错误（接口可能改版）")
    if isinstance(value, int):
        if value < 0:
            raise GooglePatentsBadResponse("检索结果页数字段为负数（接口可能改版）")
        return value
    if isinstance(value, str) and value.strip().isdigit():
        return int(value.strip())
    raise GooglePatentsBadResponse("检索结果页数字段类型错误（接口可能改版）")


def _text_value(value: Any, field: str) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list, tuple, set)):
        raise GooglePatentsBadResponse(f"检索结果字段 {field} 类型错误（接口可能改版）")
    return str(value).strip()


def _object(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise GooglePatentsBadResponse(f"检索结果字段 {field} 类型错误（接口可能改版）")
    return value


def _list(value: Any, field: str) -> list[Any]:
    if not isinstance(value, list):
        raise GooglePatentsBadResponse(f"检索结果字段 {field} 类型错误（接口可能改版）")
    return value


def _optional_list(value: Any, field: str) -> list[Any]:
    if value is None:
        return []
    return _list(value, field)


def _family_countries(meta: Any) -> list[str]:
    if meta is None:
        return []
    metadata = _object(meta, "family_metadata")
    aggregated = metadata.get("aggregated")
    if aggregated is None:
        return []
    aggregated_obj = _object(aggregated, "family_metadata.aggregated")
    rows = aggregated_obj.get("country_status")
    if rows is None:
        return []
    out: list[str] = []
    for row in _list(rows, "family_metadata.aggregated.country_status"):
        row_obj = _object(row, "family_metadata.aggregated.country_status[]")
        code = row_obj.get("country_code")
        if code is None:
            continue
        if not isinstance(code, str):
            raise GooglePatentsBadResponse("检索结果同族国别类型错误（接口可能改版）")
        code = code.strip().upper()
        if code and code not in out:
            out.append(code)
    return out


def _patent_item(value: Any, field: str) -> dict[str, Any]:
    item = _object(value, field)
    patent = item.get("patent")
    if patent is None:
        raise GooglePatentsBadResponse(f"检索结果字段 {field}.patent 缺失（接口可能改版）")
    return _object(patent, f"{field}.patent")


def _parse_hit(item: Any, field: str) -> SearchHit:
    patent = _patent_item(item, field)
    number = _text_value(patent.get("publication_number"), f"{field}.patent.publication_number").upper()
    if not number:
        raise GooglePatentsBadResponse("检索结果缺少公开号（接口可能改版）")
    country, _digits, kind = split_publication_number(number)
    if not country:
        raise GooglePatentsBadResponse("检索结果公开号格式不正确")
    pdf = _text_value(patent.get("pdf"), f"{field}.patent.pdf")
    return SearchHit(
        publication_number=number,
        country=country,
        kind=kind,
        title=strip_tags(_text_value(patent.get("title"), f"{field}.patent.title")),
        snippet=strip_tags(_text_value(patent.get("snippet"), f"{field}.patent.snippet")),
        assignee=strip_tags(_text_value(patent.get("assignee"), f"{field}.patent.assignee")),
        inventor=strip_tags(_text_value(patent.get("inventor"), f"{field}.patent.inventor")),
        priority_date=_text_value(patent.get("priority_date"), f"{field}.patent.priority_date"),
        filing_date=_text_value(patent.get("filing_date"), f"{field}.patent.filing_date"),
        publication_date=_text_value(patent.get("publication_date"), f"{field}.patent.publication_date"),
        grant_date=_text_value(patent.get("grant_date"), f"{field}.patent.grant_date"),
        language=_text_value(patent.get("language"), f"{field}.patent.language"),
        pdf_url=(PDF_HOST + pdf.lstrip("/")) if pdf else "",
        url=patent_url(number),
        family_countries=_family_countries(patent.get("family_metadata")),
    )


def parse_search_json(data: Any, *, num: int, page: int) -> SearchPage:
    if not isinstance(data, dict) or not isinstance(data.get("results"), dict):
        raise GooglePatentsBadResponse("检索结果 JSON 缺少 results 字段（接口可能改版）")
    results = data["results"]
    recognized = {"cluster", "total_num_results", "total_num_pages", "num_page"}
    if not recognized.intersection(results):
        raise GooglePatentsBadResponse("检索结果 JSON 的 results 结构无法识别（接口可能改版）")
    clusters = results.get("cluster")
    if "cluster" in results and clusters is None:
        raise GooglePatentsBadResponse("检索结果字段 cluster 类型错误（接口可能改版）")
    cluster_rows = _optional_list(clusters, "cluster")
    total_results = _int_or_none(results.get("total_num_results"))
    total_pages = _int_or_none(results.get("total_num_pages"))
    _int_or_none(results.get("num_page"))
    hits: list[SearchHit] = []
    for cluster_index, cluster in enumerate(cluster_rows):
        cluster_obj = _object(cluster, f"cluster[{cluster_index}]")
        rows = cluster_obj.get("result")
        if rows is None:
            raise GooglePatentsBadResponse("检索结果 cluster.result 缺失（接口可能改版）")
        for result_index, item in enumerate(_list(rows, f"cluster[{cluster_index}].result")):
            hits.append(_parse_hit(item, f"cluster[{cluster_index}].result[{result_index}]"))
    if not hits and (total_results is None or (page == 0 and total_results > 0)):
        raise GooglePatentsBadResponse("检索响应没有可核实的命中结果")
    return SearchPage(
        total_results=total_results,
        total_pages=total_pages,
        page=int(page),
        num=int(num),
        hits=hits,
    )
