# -*- coding: utf-8 -*-
"""海外检索 CLI：Google Patents 一页结果（默认 10 条），须用户点名海外 / 指定局才用。

每次运行只发一个请求，不重试。遇 HTTP 429 / 503 或拦截页：退出码 4，
stderr 打 ``GP_SEARCH_ERROR: reason=blocked``，调用方结束本轮海外检索。

示例：
  python skills/patent-search/tools/gp_search.py -q "(battery OR cell) (thermal runaway)" --country US,EP,JP
  python skills/patent-search/tools/gp_search.py --title "gas sensor" --cpc H01M10/48/low --after 2020 --country US
  python skills/patent-search/tools/gp_search.py --assignee "Contemporary Amperex" --country JP,KR --sort new
  python skills/patent-search/tools/gp_search.py -q "lamp" --type design --status grant --country US --page 2

结果 Markdown 由 ``emit_search_report.py`` 写入 ``outputs/patent-search/``。

退出码：0 成功；2 参数错误；4 限流（立即停止）；1 其他失败（未收录 / 网络 / 接口改版）。
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from datetime import datetime
from pathlib import Path

_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

from google_patents.config import load_google_patents_config
from google_patents.paths import resolve_output_dir, resolve_project_root, write_text_new
from google_patents.report import GOOGLE_SOURCE_ID, write_search_report
from google_patents import (
    DATE_FIELDS,
    GooglePatentsBlocked,
    GooglePatentsError,
    SearchQuery,
    build_q,
    normalize_date,
    search,
    validate_query,
    web_url,
)
from stdio_utf8 import ensure_utf8_stdio

EXIT_BLOCKED = 4
DEFAULT_COUNTRIES = ["US,EP,WO,JP,KR"]

_TYPE_ARGS = {"patent": "PATENT", "design": "DESIGN"}
_STATUS_ARGS = {"grant": "GRANT", "application": "APPLICATION"}


def _build_parser(default_num: int) -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Google Patents 海外检索（默认每页 10 条，不重试）")
    p.add_argument("-q", "--keywords", default="", help="关键词（英文；空格即 AND，可用 OR、-词、引号）")
    p.add_argument("--title", default="", help="名称字段 TI=")
    p.add_argument("--abstract", default="", help="摘要字段 AB=")
    p.add_argument("--claims", default="", help="权利要求字段 CL=")
    p.add_argument("--cpc", action="append", default=[], help="CPC，可重复；下位加 /low，如 H01M10/48/low")
    p.add_argument("--assignee", action="append", default=[], help="申请人，可重复")
    p.add_argument("--inventor", action="append", default=[], help="发明人，可重复")
    p.add_argument("--country", action="append", default=[], help="局别，逗号分隔或重复：US,EP,WO,JP,KR…")
    p.add_argument("--type", choices=sorted(_TYPE_ARGS), default="", help="patent|design")
    p.add_argument("--status", choices=sorted(_STATUS_ARGS), default="", help="grant|application")
    p.add_argument("--language", default="", help="文献原始语言，如 ENGLISH、JAPANESE")
    p.add_argument("--date-field", choices=DATE_FIELDS, default="priority", help="日期字段（默认优先权日）")
    p.add_argument("--after", default="", help="起始日期 YYYY / YYYY-MM / YYYY-MM-DD")
    p.add_argument("--before", default="", help="截止日期 YYYY / YYYY-MM / YYYY-MM-DD")
    p.add_argument("--sort", choices=("new", "old"), default="", help="缺省按相关度")
    p.add_argument("--num", type=int, default=default_num, help=f"每页条数 1–100（默认 {default_num}）")
    p.add_argument("--page", type=int, default=1, help="页码，从 1 开始")
    p.add_argument("--note", default="", help="检索意图（中文原意），写入报告")
    p.add_argument("--timeout", type=float, default=None, help="请求超时秒数（默认读 config.yaml）")
    p.add_argument("--project-root", type=Path, help="项目根目录，默认为当前目录")
    p.add_argument("--output-dir", type=Path, default=Path("outputs/patent-search"), help="项目内结果目录")
    return p


def build_query(args: argparse.Namespace) -> SearchQuery:
    return SearchQuery(
        keywords=args.keywords,
        title=args.title,
        abstract=args.abstract,
        claims=args.claims,
        cpc=list(args.cpc),
        assignees=list(args.assignee),
        inventors=list(args.inventor),
        countries=list(args.country or DEFAULT_COUNTRIES),
        patent_type=_TYPE_ARGS.get(args.type, ""),
        status=_STATUS_ARGS.get(args.status, ""),
        language=args.language,
        date_field=args.date_field,
        after=args.after,
        before=args.before,
        sort=args.sort,
        num=args.num,
        page=max(0, args.page - 1),
    )


def _query_record(query: SearchQuery, note: str) -> dict:
    countries: list[str] = []
    for raw in query.countries:
        for code in str(raw).split(","):
            code = code.strip().upper()
            if code and code not in countries:
                countries.append(code)
    return {
        "keywords": query.keywords.strip(),
        "title": query.title.strip(),
        "abstract": query.abstract.strip(),
        "claims": query.claims.strip(),
        "cpc": [c.strip() for c in query.cpc if c.strip()],
        "assignees": [a.strip() for a in query.assignees if a.strip()],
        "inventors": [i.strip() for i in query.inventors if i.strip()],
        "countries": countries,
        "patent_type": query.patent_type,
        "status": query.status,
        "language": query.language.upper(),
        "date_field": query.date_field,
        "after": normalize_date(query.after),
        "before": normalize_date(query.before, end=True),
        "sort": query.sort,
        "num": query.num,
        "page": query.page + 1,
        "note": note.strip(),
        "q": build_q(query),
    }


def completeness_note(total: int | None, page: int, returned: int) -> str:
    if total is None:
        return "Google 未报告总数；本次只是一页结果，不得写成完整清单"
    if page == 1 and returned >= total:
        return f"共 {total} 条，已到末页"
    return f"共 {total} 条，本次只取第 {page} 页 {returned} 条，不得写成完整清单"


def hit_row(hit) -> dict:
    return {
        "pub_number": hit.publication_number,
        "title": hit.title,
        "link": hit.url,
        "country": hit.country,
        "kind": hit.kind,
        "applicant": hit.assignee,
        "inventors": hit.inventor,
        "priority_date": hit.priority_date,
        "filing_date": hit.filing_date,
        "publication_date": hit.publication_date,
        "grant_date": hit.grant_date,
        "language": hit.language,
        "family_countries": hit.family_countries,
        "pdf_url": hit.pdf_url,
        "snippet": hit.snippet,
    }


def main(argv: list[str] | None = None) -> int:
    ensure_utf8_stdio()
    cfg = load_google_patents_config(_HERE.parent / "config.yaml")
    args = _build_parser(int(cfg["num"])).parse_args(argv)
    if args.page < 1:
        print("ERROR: --page 从 1 开始", file=sys.stderr)
        return 2
    query = build_query(args)
    timeout = float(args.timeout if args.timeout is not None else cfg["timeout_s"])
    try:
        validate_query(query)
        if "CN" in _query_record(query, "")["countries"]:
            raise ValueError("中国专利检索请使用公布站工具")
        if not math.isfinite(timeout) or not 0 < timeout <= 120:
            raise ValueError("--timeout 必须在 0 至 120 秒之间")
        project_root = resolve_project_root(args.project_root)
        output_dir = resolve_output_dir(project_root, args.output_dir)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    try:
        page = search(query, timeout=timeout)
    except GooglePatentsBlocked as exc:
        print(
            f"GP_SEARCH_ERROR: reason={exc.reason} status={exc.status} 已停止，不要重试本轮海外检索：{exc}",
            file=sys.stderr,
        )
        return EXIT_BLOCKED
    except GooglePatentsError as exc:
        print(f"GP_SEARCH_ERROR: reason={exc.reason} status={exc.status} {exc}", file=sys.stderr)
        return 1

    queried_at = datetime.now()
    hits = [hit_row(h) for h in page.hits]
    payload = {
        "source_id": GOOGLE_SOURCE_ID,
        "source": "https://patents.google.com/",
        "scope": "published_records_only",
        "query_mode": GOOGLE_SOURCE_ID,
        "queried_at": queried_at.strftime("%Y-%m-%d %H:%M:%S"),
        "query": _query_record(query, args.note),
        "web_url": web_url(query),
        "total_results": page.total_results,
        "total_pages": page.total_pages,
        "page": query.page + 1,
        "num": query.num,
        "returned": len(hits),
        "complete": query.page == 0 and page.total_results is not None and len(hits) >= page.total_results,
        "completeness_note": completeness_note(page.total_results, query.page + 1, len(hits)),
        "hits": hits,
    }
    try:
        report_path = write_search_report(
            payload, project_root=project_root, output_dir=output_dir, queried_at=queried_at
        )
        json_path = write_text_new(
            project_root, report_path.with_suffix(".json"),
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        )
    except (ValueError, OSError) as exc:
        print(f"GP_SEARCH_ERROR: reason=output_error {exc}", file=sys.stderr)
        return 1
    print("GP_SEARCH_MD:", str(report_path), flush=True)
    print("GP_SEARCH_JSON_PATH:", str(json_path), flush=True)
    print("GP_SEARCH_JSON:", json.dumps(payload, ensure_ascii=False), flush=True)
    print(
        "GP_SEARCH_NOTE: total=%s page=%d returned=%d num=%d"
        % (page.total_results if page.total_results is not None else "-", query.page + 1, len(hits), query.num),
        file=sys.stderr,
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
