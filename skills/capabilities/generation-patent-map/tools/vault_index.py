#!/usr/bin/env python
"""扫描 Obsidian 库中的专利解读笔记，供专利地图使用。不调用解读包 tools/。"""
from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path

PUB_RE = re.compile(
    r"(?<![A-Za-z0-9])((?:CN|US|EP|WO|JP|KR)\s*\d{6,13}\s*[A-Z]\d?)(?![A-Za-z0-9])",
    re.I,
)

# Bound corpus reads so a large vault cannot cause an unbounded scan.
MAX_NOTES = 5000
MAX_NOTE_BYTES = 4 * 1024 * 1024


def resolve_corpus(explicit: str | Path | None = None) -> Path | None:
    """Explicit frozen patent-note corpus. No global vault discovery."""
    if explicit:
        candidate: Path | None = Path(explicit).expanduser()
    else:
        env = (os.environ.get("PATENT_MAP_CORPUS") or "").strip()
        candidate = Path(env).expanduser() if env else None
    if candidate is None or not candidate.is_dir():
        return None
    return candidate.resolve()


def note_files_from_index(index_path: Path, project_root: Path) -> tuple[Path, list[Path]]:
    """Resolve an explicit, bounded note set from a patent file index.

    Reuses the package file-index contract, so escaping paths, invalid entries,
    and missing files fail instead of being silently skipped. The returned set
    is bounded by note count and file size.
    """
    import patent_files

    root = project_root.expanduser().resolve()
    data = json.loads(Path(index_path).expanduser().read_text(encoding="utf-8"))
    problems, missing, resolved = patent_files.inspect(root, data, expect_kind="notes")
    if problems or missing:
        details = list(problems) + [f"missing file: {item}" for item in missing]
        raise ValueError("patent note index is invalid: " + "; ".join(details))
    if len(resolved) > MAX_NOTES:
        raise ValueError(f"patent note index exceeds {MAX_NOTES} files")
    files: list[Path] = []
    for entry in resolved:
        target = entry["resolved"]
        try:
            if target.stat().st_size > MAX_NOTE_BYTES:
                raise ValueError(f"patent note exceeds {MAX_NOTE_BYTES} bytes: {target.name}")
        except OSError as error:
            raise ValueError(f"patent note is unreadable: {target.name}") from error
        files.append(target)
    return root, files


def _parse_frontmatter(content: str) -> tuple[dict, str]:
    if not content.startswith("---"):
        return {}, content
    end = content.find("\n---", 3)
    if end == -1:
        return {}, content
    yaml_block = content[3:end].strip()
    body = content[end + 4 :].lstrip("\n")
    data: dict = {}
    key: str | None = None
    for line in yaml_block.splitlines():
        if line.startswith("  - ") and key:
            data.setdefault(key, [])
            if not isinstance(data[key], list):
                data[key] = [data[key]] if data[key] else []
            data[key].append(line[4:].strip())
        elif ":" in line and not line.startswith(" "):
            key, val = line.split(":", 1)
            key = key.strip()
            val = val.strip()
            if val in ("", "[]"):
                data[key] = []
            elif val == "true":
                data[key] = True
            elif val == "false":
                data[key] = False
            else:
                data[key] = val.strip('"')
    return data, body


def _as_list(val) -> list[str]:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(x).strip().strip('"').strip("'") for x in val if str(x).strip()]
    s = str(val).strip().strip('"').strip("'")
    if not s:
        return []
    if ";" in s:
        return [p.strip() for p in s.split(";") if p.strip()]
    return [s]


_TE_MD = re.compile(r"(\*\*|__|`+)")
_TE_WIKI = re.compile(r"\[\[.*?\]\]")
_TE_LEAD = re.compile(r"^(?:[-*+]|\d+[.)、]|#{1,6})\s*")
_TE_BAD = set("。；;！!？?（）()[]：:，,")


def _clean_te_label(s: str) -> str:
    s = str(s or "").strip().strip('"').strip("'")
    s = _TE_WIKI.sub("", s)
    s = _TE_MD.sub("", s)
    s = _TE_LEAD.sub("", s)
    s = re.sub(r"\s+", " ", s).strip(" -—·,;，")
    return s


def _ok_te_label(s: str) -> bool:
    if not s or len(s) < 2 or len(s) > 16:
        return False
    return not any(ch in s for ch in _TE_BAD)


def _parse_pair_line(s: str) -> tuple[str, str] | None:
    s = str(s or "").strip().strip('"').strip("'")
    if "→" in s or "->" in s:
        a, b = re.split(r"→|->", s, maxsplit=1)
        a, b = _clean_te_label(a), _clean_te_label(b)
        if _ok_te_label(a) and _ok_te_label(b):
            return a, b
    return None


def _ipc_subclass(ipc_codes: list, ipc: str) -> str:
    raw = str((ipc_codes[0] if ipc_codes else "") or ipc or "")
    s = re.sub(r"\s+", "", raw).upper()
    m = re.match(r"^([A-HY]\d{2}[A-Z])", s)
    return m.group(1) if m else ""


def _fallback_ipc_domain(fm: dict, ipc_codes: list) -> tuple[str, str] | None:
    """缺技术功效时用已有著录占位：行=IPC 小类，列=领域。"""
    mean = _ipc_subclass(ipc_codes, str(fm.get("ipc") or "")) or "未分IPC"
    domain = _clean_te_label(str(fm.get("domain") or ""))
    if not _ok_te_label(domain):
        domain = (domain[:16] if domain else "") or "未分类"
        if not _ok_te_label(domain):
            domain = "未分类"
    if mean == "未分IPC" and domain == "未分类":
        return None
    return mean, domain


def _tech_pairs(fm: dict, body: str, ipc_codes: list) -> tuple[list[tuple[str, str]], str]:
    """frontmatter → 第七节短箭头 → IPC×领域。长句不进矩阵。"""
    pairs: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()

    def _add(a: str, b: str) -> None:
        k = (a, b)
        if a and b and k not in seen and len(pairs) < 8:
            seen.add(k)
            pairs.append(k)

    for line in _as_list(fm.get("tech_effect_pairs")):
        hit = _parse_pair_line(line)
        if hit:
            _add(*hit)
    means = [m for x in _as_list(fm.get("tech_means")) if _ok_te_label(m := _clean_te_label(x))]
    effects = [e for x in _as_list(fm.get("tech_effects")) if _ok_te_label(e := _clean_te_label(x))]
    if not pairs and means and effects:
        for m in means:
            for e in effects:
                _add(m, e)
    if pairs:
        return pairs, "agent"
    for a, b in _means_effects(body):
        _add(a, b)
    if pairs:
        return pairs, "section7"
    fb = _fallback_ipc_domain(fm, ipc_codes)
    if fb:
        return [fb], "fallback"
    return [], "none"


def _section(body: str, heading: str) -> str:
    pat = re.compile(
        rf"^##\s*{re.escape(heading)}\s*\n([\s\S]*?)(?=^##\s|\Z)",
        re.M,
    )
    m = pat.search(body)
    return m.group(1).strip() if m else ""


def _one_liner(body: str, title: str) -> str:
    sec = _section(body, "一、一句话")
    if sec:
        line = next((ln.strip() for ln in sec.splitlines() if ln.strip() and not ln.startswith("（")), "")
        if line:
            return line[:160]
    if title.startswith("专利解读："):
        return title.replace("专利解读：", "", 1).strip()[:160]
    return title[:160]


def _terms(body: str) -> list[str]:
    sec = _section(body, "五、专利内术语表")
    terms: list[str] = []
    for line in sec.splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2:
            continue
        name = cells[0]
        if name in ("术语", "---") or set(name) <= {"-", ":"}:
            continue
        terms.append(name)
        if len(terms) >= 12:
            break
    return terms


def _means_effects(body: str) -> list[tuple[str, str]]:
    """从第七节抽短标签「手段 → 功效」。长句、markdown 编号不当轴标签。"""
    sec = _section(body, "七、和现有技术的差别")
    pairs: list[tuple[str, str]] = []
    for line in sec.splitlines():
        hit = _parse_pair_line(line.strip().lstrip("-* "))
        if hit:
            pairs.append(hit)
        if len(pairs) >= 6:
            break
    return pairs


def note_to_record(path: Path, vault: Path) -> dict | None:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    fm, body = _parse_frontmatter(text)
    pub = str(fm.get("pub_number") or "").strip()
    if not pub:
        m = re.search(r"(CN\d{9,}[A-Z]?)", path.name, re.I)
        pub = m.group(1).upper() if m else ""
    if not pub:
        return None
    title_m = re.search(r"^#\s+(.+)$", body, re.M)
    title = (title_m.group(1).strip() if title_m else "") or str(fm.get("invention_title") or pub)
    ipc_codes = _as_list(fm.get("ipc_codes"))
    if not ipc_codes:
        ipc_codes = _as_list(fm.get("ipc"))
    rel = str(path.relative_to(vault)).replace("\\", "/")
    cited = _as_list(fm.get("cited_pubs"))
    if not cited:
        self_n = re.sub(r"\s+", "", pub).upper()
        for m in PUB_RE.finditer(body):
            n = re.sub(r"\s+", "", m.group(1)).upper()
            if n != self_n and n not in cited:
                cited.append(n)
            if len(cited) >= 12:
                break
    pairs, te_source = _tech_pairs(fm, body, ipc_codes)
    real = te_source in ("agent", "section7")
    return {
        "pub": pub,
        "title": title[:120],
        "one_liner": _one_liner(body, title),
        "domain": str(fm.get("domain") or "未分类").strip() or "未分类",
        "ipc": str(fm.get("ipc") or (ipc_codes[0] if ipc_codes else "")),
        "ipc_codes": ipc_codes[:8],
        "assignees": _as_list(fm.get("assignees"))[:8],
        "organizations": _as_list(fm.get("organizations"))[:8],
        "inventors": _as_list(fm.get("inventors"))[:12],
        "filing_date": str(fm.get("filing_date") or ""),
        "publication_date": str(fm.get("publication_date") or ""),
        "application_number": str(fm.get("application_number") or ""),
        "invention_title": str(fm.get("invention_title") or ""),
        "cited_pubs": cited[:20],
        "related_pubs": _as_list(fm.get("related_pubs"))[:12],
        "read_date": str(fm.get("read_date") or ""),
        "evidence_scope": str(fm.get("evidence_scope") or ""),
        "terms": _terms(body),
        "tech_means": list(dict.fromkeys(a for a, _ in pairs))[:8] if real else [],
        "tech_effects": list(dict.fromkeys(b for _, b in pairs))[:8] if real else [],
        "means_effects": [{"mean": a, "effect": b, "source": te_source} for a, b in pairs],
        "te_source": te_source,
        "note_path": rel,
        "gold": True,
    }


def scan_corpus(corpus: Path, *, files: list[Path] | None = None) -> list[dict]:
    """Read patent notes from an explicit frozen corpus or explicit file list.

    Only the declared corpus directory or the declared files are read; there is
    no whole-vault discovery.
    """
    from map_cache import (
        cache_db_path,
        drop_missing,
        file_stamp,
        load_cached,
        upsert,
        _connect,
    )

    corpus = corpus.resolve()
    candidates: list[Path] = []
    for candidate in (corpus.rglob("*.md") if files is None else files):
        resolved = candidate.resolve()
        if not resolved.is_relative_to(corpus) or "researchspec" in resolved.relative_to(corpus).parts:
            raise ValueError("patent note escapes the selected ordinary corpus")
        if not resolved.is_file() or resolved.suffix.lower() != ".md":
            raise ValueError("patent map inputs must be readable Markdown notes")
        if resolved.stat().st_size > MAX_NOTE_BYTES:
            raise ValueError(f"patent note exceeds {MAX_NOTE_BYTES} bytes")
        candidates.append(resolved)
        if len(candidates) > MAX_NOTES:
            raise ValueError(f"patent corpus exceeds {MAX_NOTES} notes")
    candidates.sort()
    db = cache_db_path(corpus)
    if files is None and db.resolve().is_relative_to(corpus):
        raise ValueError("map cache must be outside the frozen corpus; configure PATENT_MAP_HOME")
    conn = _connect(db)
    notes: list[dict] = []
    seen_pub: set[str] = set()
    keep: set[str] = set()
    try:
        scanned = 0
        for md in candidates:
            if scanned >= MAX_NOTES:
                break
            if md.suffix.lower() != ".md":
                continue
            try:
                if md.stat().st_size > MAX_NOTE_BYTES:
                    continue
            except OSError:
                continue
            scanned += 1
            try:
                rel = str(md.relative_to(corpus)).replace("\\", "/")
            except ValueError:
                rel = md.name
            keep.add(rel)
            mtime, size = file_stamp(md)
            rec = load_cached(conn, rel, mtime, size)
            if rec is None:
                rec = note_to_record(md, corpus if corpus.is_dir() else md.parent)
                if rec:
                    upsert(conn, rel, mtime, size, rec)
            if not rec:
                continue
            pub = rec.get("pub") or ""
            if pub in seen_pub:
                continue
            seen_pub.add(pub)
            notes.append(rec)
        drop_missing(conn, keep)
        conn.commit()
    finally:
        conn.close()
    return notes


def domain_id_of(name: str) -> str:
    s = str(name or "未分类").strip() or "未分类"
    return "d-" + hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def attach_domain_ids(patents: list[dict]) -> list[dict]:
    for rec in patents:
        name = str(rec.get("domain") or "未分类").strip() or "未分类"
        rec["domain"] = name
        rec["domain_id"] = domain_id_of(name)
    return patents


def catalog_domains(patents: list[dict]) -> list[dict]:
    rows: dict[str, dict] = {}
    for rec in patents:
        name = str(rec.get("domain") or "未分类").strip() or "未分类"
        did = str(rec.get("domain_id") or domain_id_of(name))
        slot = rows.get(did)
        if slot is None:
            rows[did] = {"id": did, "name": name, "count": 1}
        else:
            slot["count"] += 1
    return sorted(rows.values(), key=lambda d: (-d["count"], d["name"]))


def filter_patents(
    patents: list[dict],
    domain: str | None = None,
    domain_id: str | None = None,
) -> list[dict]:
    name = str(domain or "").strip()
    did = str(domain_id or "").strip()
    if not name and not did:
        return patents
    out: list[dict] = []
    for rec in patents:
        rec_name = str(rec.get("domain") or "未分类").strip() or "未分类"
        rec_id = str(rec.get("domain_id") or domain_id_of(rec_name))
        if name and rec_name != name:
            continue
        if did and rec_id != did:
            continue
        out.append(rec)
    return out


def apply_domain_filter(
    payload: dict,
    domain: str | None = None,
    domain_id: str | None = None,
) -> dict:
    name = str(domain or "").strip()
    did = str(domain_id or "").strip()
    if not name and not did:
        return payload
    patents = filter_patents(payload.get("patents") or [], domain=name, domain_id=did)
    out = dict(payload)
    out["patents"] = patents
    out["count"] = len(patents)
    out["vault_count"] = sum(1 for p in patents if p.get("gold"))
    out["filter"] = {"domain": name, "domain_id": did}
    return out


def build_payload(corpus: Path | None, *, files: list[Path] | None = None, embed: bool = True) -> dict:
    from map_cache import cache_db_path, fallback_cache_dir
    from model_store import default_model_dir

    patents = attach_domain_ids(scan_corpus(corpus, files=files) if corpus else [])
    cache = str(cache_db_path(corpus)) if corpus else str(fallback_cache_dir() / "index.sqlite")
    embed_info = {
        "available": False,
        "mode": "ipc",
        "model": "BAAI/bge-small-zh-v1.5",
        "model_dir": str(default_model_dir()),
        "source": "",
        "error": "skipped" if not embed else "",
        "embedded": 0,
    }
    if embed and patents:
        from embed_layout import attach_layout

        patents, embed_info = attach_layout(patents, corpus)
    public = []
    for rec in patents:
        row = {k: v for k, v in rec.items() if k != "embed_text"}
        public.append(row)
    return {
        "vault": str(corpus) if corpus else "",
        "corpus": str(corpus) if corpus else "",
        "source": "corpus" if patents else "none",
        "cache": cache,
        "count": len(public),
        "vault_count": sum(1 for p in public if p.get("gold")),
        "obsidian_cli": {"available": False, "reason": "not_probed"},
        "embedding": embed_info,
        "domains": catalog_domains(public),
        "patents": public,
    }
