"""Import bibliographic exports and build stable, auditable screening records.

The implementation is ResearchSpec-authored and uses only the Python standard
library.  It follows the public data behavior of ARS sr-screener v3.24.4
without importing, executing, or redistributing that project's scripts.
"""
from __future__ import annotations

import collections
import csv
import difflib
import glob
import io
import os
from pathlib import Path
import re
import unicodedata

from screening_common import (
    SCHEMA,
    TOOL,
    UPSTREAM,
    VERSION,
    ScreeningError,
    absolute,
    atomic_write_text,
    csv_text,
    digest,
    file_sha256,
    read_text,
    save_json,
    workspace_lock,
    write_csv,
)


DOI_RE = re.compile(r"^10\.\d{4,9}/\S+$")
RIS_LINE = re.compile(r"^([A-Z][A-Z0-9])  - ?(.*)$")
MEDLINE_LINE = re.compile(r"^([A-Z][A-Z0-9 ]{1,3}?)\s*- (.*)$")
DATABASE_PRIORITY = (
    "PubMed",
    "MEDLINE",
    "Embase",
    "Cochrane CENTRAL",
    "Scopus",
    "Web of Science",
)

RIS_TYPE_ALIASES = {
    "label.ris.referenceType.BOOK_CHAPTER": "CHAP",
    "label.ris.referenceType.SHORT_SURVEY": "JOUR",
    "label.ris.referenceType.CONFERENCE_PAPER": "CPAPER",
    "label.ris.referenceType.CONFERENCE_REVIEW": "CPAPER",
}
RIS_SPACE_JOIN = {"AB", "N2", "TI", "T1", "T2", "BT", "JO", "JF", "N1"}
RIS_TYPE_LABELS = {
    "JOUR": "Journal article",
    "EJOUR": "Journal article",
    "JFULL": "Journal article",
    "CHAP": "Book chapter",
    "BOOK": "Book",
    "EBOOK": "Book",
    "EDBOOK": "Book",
    "CONF": "Conference paper",
    "CPAPER": "Conference paper",
    "ABST": "Abstract",
    "THES": "Thesis",
    "RPRT": "Report",
    "GEN": "Generic",
    "SER": "Serial",
    "UNPB": "Unpublished",
    "ELEC": "Web page",
    "PAT": "Patent",
    "NEWS": "Newspaper",
    "MGZN": "Magazine",
    "STAT": "Statute",
}
LANGUAGE_LABELS = {
    "eng": "English",
    "chi": "Chinese",
    "zho": "Chinese",
    "fre": "French",
    "fra": "French",
    "ger": "German",
    "deu": "German",
    "jpn": "Japanese",
    "rus": "Russian",
    "spa": "Spanish",
    "ita": "Italian",
    "per": "Persian",
    "fas": "Persian",
    "pol": "Polish",
    "por": "Portuguese",
    "tur": "Turkish",
    "kor": "Korean",
    "cze": "Czech",
    "ces": "Czech",
    "hun": "Hungarian",
    "dut": "Dutch",
    "nld": "Dutch",
    "swe": "Swedish",
    "dan": "Danish",
    "nor": "Norwegian",
    "fin": "Finnish",
    "heb": "Hebrew",
    "ukr": "Ukrainian",
    "srp": "Serbian",
    "hrv": "Croatian",
    "rum": "Romanian",
    "ron": "Romanian",
    "bul": "Bulgarian",
    "gre": "Greek",
    "ell": "Greek",
    "slv": "Slovenian",
    "slo": "Slovak",
    "slk": "Slovak",
    "lit": "Lithuanian",
    "ara": "Arabic",
    "tha": "Thai",
    "vie": "Vietnamese",
    "ind": "Indonesian",
    "may": "Malay",
    "msa": "Malay",
    "hin": "Hindi",
    "urd": "Urdu",
    "est": "Estonian",
    "lav": "Latvian",
    "ice": "Icelandic",
}

CSV_FIELDS = {
    "TI": ("title", "articletitle", "documenttitle", "ti", "primarytitle"),
    "AB": ("abstract", "ab", "abstractnote"),
    "PY": ("year", "publicationyear", "py", "pubyear", "date", "publicationdate"),
    "DO": ("doi", "di"),
    "C2": ("pmid", "pubmedid", "pubmed", "pubmedidentifier"),
    "T2": (
        "sourcetitle",
        "journal",
        "journaltitle",
        "publicationtitle",
        "source",
        "so",
        "t2",
        "secondarytitle",
    ),
    "AU": ("authors", "author", "au", "authorfullnames", "authornames"),
    "M3": ("documenttype", "publicationtype", "type", "itemtype", "dt", "pt", "referencetype"),
    "LA": ("languageoforiginaldocument", "language", "la"),
    "KW": ("authorkeywords", "keywords", "indexkeywords", "manualtags", "automatictags", "kw", "de", "meshterms"),
}

EXPORT_SUFFIXES = {".ris", ".nbib", ".txt", ".csv", ".tsv"}


def detect_format(text, path):
    suffix = Path(path).suffix.lower()
    head = text[:20000]
    if re.search(r"(?m)^PMID- ", head):
        return "medline"
    if re.search(r"(?m)^TY  - ", head):
        return "ris"
    if re.search(r"(?m)^(FN |PT [A-Z]\s*$)", head) and re.search(r"(?m)^ER\s*$", text):
        return "wos"
    if suffix in (".csv", ".tsv"):
        return "csv"
    return None


def parse_ris(text):
    records = []
    current = None
    for line in text.split("\n"):
        matched = RIS_LINE.match(line)
        if matched:
            tag, value = matched.group(1), matched.group(2).strip()
            if tag == "TY":
                if current is not None:
                    records.append(current)
                value = RIS_TYPE_ALIASES.get(value, value)
                if not re.fullmatch(r"[A-Z]{3,6}", value):
                    value = "GEN"
                current = collections.OrderedDict()
            elif tag == "ER":
                if current is not None:
                    records.append(current)
                current = None
                continue
            if current is not None:
                current.setdefault(tag, []).append(value)
        elif line.strip() and current:
            tag = next(reversed(current))
            separator = " " if tag in RIS_SPACE_JOIN else "; "
            current[tag][-1] = (current[tag][-1] + separator + line.strip()).strip()
    if current:
        records.append(current)
    return records


def parse_medline(text):
    raw_records = []
    current = None
    last_tag = None
    for line in text.split("\n"):
        matched = MEDLINE_LINE.match(line)
        if matched and not line.startswith(" "):
            tag, value = matched.group(1).strip(), matched.group(2)
            if tag == "PMID":
                current = collections.defaultdict(list)
                raw_records.append(current)
            if current is None:
                continue
            current[tag].append(value.strip())
            last_tag = tag
        elif line.startswith("      ") and current is not None and last_tag:
            current[last_tag][-1] += " " + line.strip()
        elif not line.strip():
            last_tag = None
    return [_medline_record(record) for record in raw_records]


def _expand_pages(pages):
    matched = re.match(r"^([A-Za-z]*\d+)-(\d+)$", pages or "")
    if not matched:
        return pages or "", ""
    start, end = matched.groups()
    digits = re.search(r"\d+$", start).group()
    if len(end) < len(digits):
        end = digits[: len(digits) - len(end)] + end
    return start, end


def _medline_record(source):
    def values(tag):
        return source.get(tag, [])

    def first(tag):
        return (source.get(tag) or [""])[0]

    result = collections.OrderedDict()

    def put(tag, value):
        if value:
            result.setdefault(tag, []).append(value)

    put("TY", "CHAP" if values("BTI") and not values("TA") else "JOUR")
    for author in (values("FAU") or values("AU")) + values("CN"):
        put("AU", author)
    put("TI", first("TI") or first("BTI") or first("TT"))
    if values("TT") and first("TI"):
        put("TT", first("TT"))
    put("T2", first("JT") or first("BTI"))
    put("J2", first("TA"))
    publication_date = first("DP")
    year = re.match(r"(\d{4})", publication_date)
    put("PY", year.group(1) if year else "")
    put("DA", publication_date)
    put("VL", first("VI"))
    put("IS", first("IP"))
    start, end = _expand_pages(first("PG"))
    put("SP", start)
    put("EP", end)
    for identifier in values("LID") + values("AID"):
        matched = re.match(r"^(10\.\S+)\s+\[doi\]", identifier)
        if matched:
            put("DO", matched.group(1))
            break
    put("AB", first("AB") or first("OAB"))
    for keyword in values("MH") + values("OT"):
        put("KW", keyword)
    for affiliation in values("AD"):
        put("AD", affiliation)
    for issue in values("IS"):
        matched = re.match(r"^(\S+)", issue)
        if matched:
            put("SN", matched.group(1))
    for language in values("LA"):
        put("LA", language)
    put("PB", first("PB"))
    put("CY", first("PL"))
    put("AN", first("PMID"))
    put("C2", first("PMC"))
    if values("PT"):
        put("M3", "; ".join(values("PT")))
    put("UR", f"https://pubmed.ncbi.nlm.nih.gov/{first('PMID')}/")
    put("DB", "PubMed")
    put("ID", first("PMID"))
    return result


def parse_wos(text):
    records = []
    current = None
    last_tag = None
    for line in text.split("\n"):
        if line.startswith("   ") and current is not None and last_tag:
            current[last_tag].append(line.strip())
            continue
        matched = re.match(r"^([A-Z][A-Z0-9])(?: (.*))?$", line)
        if not matched:
            continue
        tag = matched.group(1)
        value = (matched.group(2) or "").strip()
        if tag in ("FN", "VR", "EF"):
            continue
        if tag == "PT":
            current = collections.defaultdict(list)
        if tag == "ER":
            if current is not None:
                records.append(_wos_record(current))
            current = None
            last_tag = None
            continue
        if current is not None:
            current[tag].append(value)
            last_tag = tag
    return records


def _wos_record(source):
    def joined(tag, separator=" "):
        return separator.join(source.get(tag, [])).strip()

    result = collections.OrderedDict()

    def put(tag, value):
        if value:
            result.setdefault(tag, []).append(value)

    document_type = joined("DT", " ")
    publication_type = joined("PT")
    if "Book Chapter" in document_type:
        ris_type = "CHAP"
    elif publication_type == "B":
        ris_type = "BOOK"
    elif publication_type == "P":
        ris_type = "PAT"
    else:
        ris_type = "JOUR"
    put("TY", ris_type)
    for author in source.get("AF") or source.get("AU") or []:
        put("AU", author)
    put("TI", joined("TI"))
    put("T2", joined("SO"))
    put("J2", joined("J9") or joined("JI"))
    put("PY", joined("PY"))
    put("VL", joined("VL"))
    put("IS", joined("IS"))
    put("SP", joined("BP"))
    put("EP", joined("EP"))
    put("DO", joined("DI"))
    put("AB", joined("AB"))
    for keyword in re.split(r";\s*", joined("DE", " ")) + re.split(r";\s*", joined("ID", " ")):
        put("KW", keyword.strip())
    put("LA", joined("LA"))
    put("M3", document_type)
    put("C2", joined("PM"))
    put("AN", joined("UT"))
    put("SN", joined("SN"))
    put("PB", joined("PU"))
    put("DB", "Web of Science")
    return result


def _header_key(value):
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def parse_csv(text):
    dialect = {"quotechar": '"', "doublequote": True, "skipinitialspace": True}
    try:
        delimiter = csv.Sniffer().sniff(text[:5000], delimiters=",;\t").delimiter
    except csv.Error:
        delimiter = ","
    header = next(csv.reader(io.StringIO(text), delimiter=delimiter, **dialect), [])
    if len(header) < 2:
        delimiter = ","
    records = []
    for source in csv.DictReader(io.StringIO(text), delimiter=delimiter, **dialect):
        keyed = {_header_key(key): (value or "").strip() for key, value in source.items() if key}
        record = collections.OrderedDict()
        record["TY"] = ["JOUR"]
        for tag, aliases in CSV_FIELDS.items():
            values = [keyed[name] for name in aliases if keyed.get(name)]
            if not values:
                continue
            if tag == "AU":
                record["AU"] = [name.strip() for name in re.split(r";\s*|\s+and\s+", values[0]) if name.strip()]
            elif tag == "KW":
                keywords = []
                for value in values:
                    keywords.extend(item.strip() for item in re.split(r";\s*", value) if item.strip())
                record["KW"] = keywords
            elif tag == "PY":
                matched = re.search(r"(1[89]\d\d|20\d\d|2100)", values[0])
                if matched:
                    record["PY"] = [matched.group(1)]
            else:
                record[tag] = [values[0]]
        if record.get("TI") or record.get("AB"):
            records.append(record)
    return records


def load_export(path, database_hint=None):
    text = read_text(path)
    export_format = detect_format(text, path)
    if export_format == "ris":
        records = parse_ris(text)
    elif export_format == "medline":
        records = parse_medline(text)
    elif export_format == "wos":
        records = parse_wos(text)
    elif export_format == "csv":
        records = parse_csv(text)
    else:
        return None, []
    for record in records:
        if database_hint and not record.get("DB"):
            record["DB"] = [database_hint]
    return export_format, records


def normalize_doi(value):
    value = (value or "").strip().lower()
    value = re.sub(r"^(https?://)?(dx\.)?doi\.org/", "", value)
    value = re.sub(r"^doi:\s*", "", value)
    value = value.rstrip(".;,")
    return value if DOI_RE.match(value) else ""


def normalize_title(value):
    value = re.sub(r"<[^>]+>", "", value or "")
    value = unicodedata.normalize("NFKD", value)
    value = "".join(character for character in value if not unicodedata.combining(character))
    return re.sub(r"[\W_]+", "", value.lower())


def _first(record, *tags):
    for tag in tags:
        for value in record.get(tag, []):
            if value and value.strip():
                return value.strip()
    return ""


def infer_database(record, fallback):
    database = _first(record, "DB", "DP")
    if database:
        lowered = database.lower()
        if "pubmed" in lowered or "medline" in lowered:
            return "PubMed"
        if "scopus" in lowered:
            return "Scopus"
        if "web of science" in lowered or lowered == "wos" or "clarivate" in lowered:
            return "Web of Science"
        if "embase" in lowered:
            return "Embase"
        if "cochrane" in lowered:
            return "Cochrane CENTRAL"
        return database
    urls = " ".join(record.get("UR", []) + record.get("L1", []) + record.get("L2", [])).lower()
    accession = _first(record, "AN")
    if "scopus.com" in urls:
        return "Scopus"
    if accession.upper().startswith("WOS:"):
        return "Web of Science"
    if "embase" in urls:
        return "Embase"
    if "cochranelibrary" in urls:
        return "Cochrane CENTRAL"
    if "pubmed" in urls:
        return "PubMed"
    return fallback


def unify_record(record, database, source_file, index):
    document_type = _first(record, "M3")
    doi = ""
    for candidate in record.get("DO", []) + record.get("DI", []) + ([document_type] if normalize_doi(document_type) else []):
        doi = normalize_doi(candidate)
        if doi:
            break
    if not doi:
        for candidate in record.get("UR", []) + record.get("L3", []):
            if "doi.org/" in candidate.lower():
                doi = normalize_doi(candidate)
                if doi:
                    break

    pmid = ""
    accession = _first(record, "AN")
    if database == "PubMed" and accession.isdigit():
        pmid = accession
    if not pmid:
        candidate = _first(record, "C2")
        if candidate.isdigit() and 5 <= len(candidate) <= 9:
            pmid = candidate
    if not pmid:
        blob = " ".join(record.get("UR", []) + record.get("N1", []) + record.get("M2", []))
        matched = re.search(r"pubmed\.ncbi\.nlm\.nih\.gov/(\d{5,9})|PMID:?\s*(\d{5,9})", blob)
        if matched:
            pmid = matched.group(1) or matched.group(2)

    ris_type = _first(record, "TY") or "GEN"
    publication_type = document_type if document_type and not normalize_doi(document_type) else RIS_TYPE_LABELS.get(ris_type, ris_type)
    year = ""
    for value in record.get("PY", []) + record.get("Y1", []) + record.get("DA", []) + record.get("Y2", []):
        matched = re.search(r"(1[89]\d\d|20\d\d|2100)", value)
        if matched:
            year = matched.group(1)
            break

    languages = []
    for language in record.get("LA", []):
        for part in re.split(r"[;, ]\s*", language):
            if not part.strip():
                continue
            language_name = LANGUAGE_LABELS.get(part.strip().lower(), part.strip())
            if language_name not in languages:
                languages.append(language_name)
    return {
        "idx": index,
        "db": database,
        "src_file": source_file,
        "ty": ris_type,
        "title": _first(record, "TI", "T1", "CT"),
        "abstract": _first(record, "AB", "N2"),
        "year": year,
        "journal": _first(record, "T2", "JO", "JF", "JA", "T3", "BT"),
        "type": publication_type,
        "lang": "; ".join(languages),
        "doi": doi,
        "pmid": pmid,
        "authors": record.get("AU", []) or record.get("A1", []),
        "kw": [keyword for keyword in record.get("KW", []) if keyword],
    }


def titles_compatible(left, right):
    if not left or not right:
        return True
    left, right = left[:120], right[:120]
    if left[:30] == right[:30]:
        return True
    return difflib.SequenceMatcher(None, left, right).ratio() >= 0.4


def database_rank(database):
    try:
        return DATABASE_PRIORITY.index(database)
    except ValueError:
        return len(DATABASE_PRIORITY)


class _Groups:
    def __init__(self, count):
        self.parent = list(range(count))
        self.identifiers = [
            {"doi": set(), "pmid": set()}
            for _ in range(count)
        ]
        self.reason = {}

    def find(self, item):
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def union(self, left, right, reason):
        left_root, right_root = self.find(left), self.find(right)
        if left_root == right_root:
            return
        for field in ("doi", "pmid"):
            left_values = self.identifiers[left_root][field]
            right_values = self.identifiers[right_root][field]
            if left_values and right_values and left_values != right_values:
                return
        low, high = sorted((left_root, right_root))
        self.parent[high] = low
        for field in ("doi", "pmid"):
            self.identifiers[low][field] |= self.identifiers[high][field]
        self.reason.setdefault(max(left, right), reason)


def _deduplicate(records, config):
    groups = _Groups(len(records))
    for index, record in enumerate(records):
        for field in ("doi", "pmid"):
            if record[field]:
                groups.identifiers[index][field].add(record[field])

    normalized_titles = [normalize_title(record["title"]) for record in records]
    title_guard = config["dedup"]["doi_title_guard"]
    for field in ("pmid", "doi"):
        previous = {}
        for index, record in enumerate(records):
            value = record[field]
            if not value:
                continue
            if value in previous:
                earlier = previous[value]
                if field == "pmid" or not title_guard or titles_compatible(normalized_titles[index], normalized_titles[earlier]):
                    groups.union(index, earlier, field)
            else:
                previous[value] = index

    seen = {}
    for index, record in enumerate(records):
        title = normalized_titles[index]
        if len(title) < 25:
            continue
        key = (title, record["year"])
        for earlier in seen.get(key, []):
            groups.union(index, earlier, "title+year")
        seen.setdefault(key, []).append(index)
        if record["year"].isdigit():
            for delta in (-1, 1):
                adjacent = (title, str(int(record["year"]) + delta))
                for earlier in seen.get(adjacent, []):
                    groups.union(index, earlier, "title+year(+-1)")

    grouped = collections.defaultdict(list)
    for index in range(len(records)):
        grouped[groups.find(index)].append(index)
    ordered_members = sorted(grouped.values(), key=lambda members: min(members))
    unique = []
    for members in ordered_members:
        uniques = [records[index] for index in members]
        representative = max(
            uniques,
            key=lambda record: (len(record["abstract"]), -database_rank(record["db"])),
        )
        by_database = sorted(uniques, key=lambda record: database_rank(record["db"]))
        type_labels = []
        for record in by_database:
            if record["type"] and all(record["type"] != item.split(": ", 1)[-1] for item in type_labels):
                type_labels.append(record["type"] if not type_labels else f"{record['db']}: {record['type']}")
        keyword_source = next(
            (record for record in by_database if record["db"] == "PubMed" and record["kw"]),
            representative,
        )
        unique.append(
            {
                "members": sorted(members),
                "sources": sorted({record["db"] for record in uniques}, key=database_rank),
                "title": representative["title"] or next((record["title"] for record in uniques if record["title"]), ""),
                "abstract": representative["abstract"],
                "year": representative["year"] or next((record["year"] for record in uniques if record["year"]), ""),
                "journal": by_database[0]["journal"] or representative["journal"],
                "type": " | ".join(type_labels[:3]),
                "lang": next((record["lang"] for record in by_database if record["lang"]), ""),
                "doi": next((record["doi"] for record in by_database if record["doi"]), ""),
                "pmid": next((record["pmid"] for record in by_database if record["pmid"]), ""),
                "authors": next((record["authors"] for record in by_database if record["authors"]), []),
                "kw": keyword_source["kw"][:18],
            }
        )
    return unique, groups.reason


def collect_input_files(paths, work=None):
    work_path = Path(work).resolve() if work else None
    files = []
    for supplied in paths:
        path = Path(supplied).expanduser().resolve()
        if path.is_file():
            files.append(path)
            continue
        if not path.is_dir():
            raise ScreeningError(f"input not found: {supplied}")
        if work_path is not None and path == work_path:
            raise ScreeningError("--work must not also be an input folder")
        for candidate in path.rglob("*"):
            if not candidate.is_file() or candidate.suffix.lower() not in EXPORT_SUFFIXES:
                continue
            if work_path is not None and work_path in candidate.parents:
                continue
            files.append(candidate.resolve())
    unique = {}
    for path in files:
        unique[str(path)] = path
    return sorted(unique.values(), key=lambda path: (path.name.lower(), str(path).lower()))


def record_block(record, wrap=150):
    folded = lambda text: _wrap_text(text, wrap)
    header = f"### {record['id']} | {record['year'] or 'n/a'} | {record['type'] or 'n/a'} | Lang: {record['lang'] or 'n/a'}"
    lines = [
        header,
        folded("TI: " + (record["title"] or "[no title]")),
        folded("AB: " + (record["abstract"] or "[NO ABSTRACT AVAILABLE]")),
    ]
    if record.get("kw"):
        lines.append(folded("KW: " + "; ".join(record["kw"])))
    return "\n".join(lines) + "\n"


def _wrap_text(text, width):
    import textwrap

    return textwrap.fill(
        text,
        width,
        break_long_words=True,
        break_on_hyphens=False,
        subsequent_indent="    ",
    )


def _make_batches(unique, work, config):
    batch_config = config["batching"]
    batches = []
    current = []
    size = 0
    for record in unique:
        block = record_block(record, batch_config["wrap"])
        if current and (size + len(block) > batch_config["max_chars"] or len(current) >= batch_config["max_records"]):
            batches.append(current)
            current, size = [], 0
        current.append((record, block))
        size += len(block)
    if current:
        batches.append(current)

    manifest = []
    max_lines = 0
    width = max(3, len(str(len(batches))))
    batch_dir = Path(work) / "batches"
    for number, batch in enumerate(batches, 1):
        name = "b" + str(number).zfill(width)
        ids = [record["id"] for record, _ in batch]
        body = (
            f"BATCH {name} -- {len(ids)} records: {ids[0]} .. {ids[-1]}\n\n"
            + "\n".join(block for _, block in batch)
            + f"\n=== END OF BATCH {name} ({len(ids)} records) ===\n"
        )
        atomic_write_text(batch_dir / (name + ".txt"), body)
        for record, block in batch:
            record["batch"] = name
            max_lines = max(max_lines, block.count("\n") + 1)
        manifest.append({"batch": name, "path": f"batches/{name}.txt", "ids": ids})
    return manifest, max_lines


def _matching_seeds(unique, config):
    by_doi = {record["doi"]: record["id"] for record in unique if record["doi"]}
    by_pmid = {record["pmid"]: record["id"] for record in unique if record["pmid"]}
    titles = [(normalize_title(record["title"]), record["id"]) for record in unique]
    result = []
    for seed in config.get("seeds", []):
        record_id = None
        matched_on = None
        seed_doi = normalize_doi(seed.get("doi", "")) if isinstance(seed, dict) else ""
        if seed_doi and seed_doi in by_doi:
            record_id, matched_on = by_doi[seed_doi], "doi"
        elif isinstance(seed, dict) and seed.get("pmid") and str(seed["pmid"]) in by_pmid:
            record_id, matched_on = by_pmid[str(seed["pmid"])], "pmid"
        elif isinstance(seed, dict) and seed.get("title") and len(normalize_title(seed["title"])) >= 20:
            seed_title = normalize_title(seed["title"])
            record_id = next(
                (
                    candidate_id
                    for normalized, candidate_id in titles
                    if len(normalized) >= 20
                    and (normalized.startswith(seed_title[:60]) or seed_title.startswith(normalized[:60]))
                ),
                None,
            )
            matched_on = "title" if record_id else None
        label = seed.get("label") or seed.get("title") or seed.get("doi") if isinstance(seed, dict) else ""
        result.append({"label": label, "id": record_id, "matched_on": matched_on})
    return result


def _work_has_screening_state(work):
    names = (
        "review_state.json",
        "revision_history.json",
        "decisions.json",
        "decisions_meta.json",
        "pending.json",
        "ft_decisions.json",
        "ft_preparation.json",
    )
    return any((Path(work) / name).exists() for name in names)


def prepare_records(input_paths, work, config, database_overrides=None, force=False):
    work_path = Path(work).expanduser().resolve()
    input_files = collect_input_files(input_paths, work_path)
    if not input_files:
        raise ScreeningError("no supported bibliographic exports were found")

    overrides = database_overrides or {}
    all_records = []
    raw_store = []
    per_file = []
    input_hashes = []
    skipped = []
    for path in input_files:
        base = path.name
        export_format, records = load_export(path, overrides.get(base))
        if export_format is None:
            skipped.append(base)
            continue
        fallback = overrides.get(base) or path.stem
        before = len(all_records)
        for record in records:
            database = overrides.get(base) or infer_database(record, fallback)
            if not record.get("DB"):
                record["DB"] = [database]
            all_records.append(unify_record(record, database, base, len(all_records)))
            raw_store.append(dict(record))
        input_hashes.append({"file": base, "sha256": file_sha256(path)})
        per_file.append(
            {
                "file": base,
                "format": export_format,
                "records": len(all_records) - before,
                "databases": dict(sorted(collections.Counter(record["db"] for record in all_records[before:]).items())),
            }
        )
    if not all_records:
        raise ScreeningError("no records were found in the supplied exports")

    unique, merge_reasons = _deduplicate(all_records, config)
    width = max(5, len(str(len(unique))))
    for number, record in enumerate(unique, 1):
        record["id"] = "R" + str(number).zfill(width)
    dataset_hash = digest(
        [
            {key: value for key, value in record.items() if key not in ("id", "batch")}
            for record in unique
        ]
    )
    review_id = "review-" + digest({"files": input_hashes, "dataset": dataset_hash})[:24]

    with workspace_lock(work_path):
        records_path = work_path / "records.json"
        if records_path.exists() and not force:
            raise ScreeningError(
                f"{work_path} already contains prepared records; screening IDs are stable and must not be replaced"
            )
        if force and _work_has_screening_state(work_path):
            raise ScreeningError("--force cannot replace a work folder that contains screening or revision state")
        if force:
            for pattern in ("b*.txt", "q*.txt"):
                for stale in glob.glob(str(work_path / "batches" / pattern)):
                    Path(stale).unlink()
        manifest, max_lines = _make_batches(unique, work_path, config)
        by_database = dict(sorted(collections.Counter(record["db"] for record in all_records).items()))
        identification = {
            "schema": SCHEMA,
            "tool": f"{TOOL} {VERSION}",
            "upstream": UPSTREAM,
            "files": per_file,
            "skipped": skipped,
            "by_database": by_database,
            "raw_total": len(all_records),
            "unique_total": len(unique),
            "duplicates_removed": len(all_records) - len(unique),
            "no_abstract": sum(1 for record in unique if not record["abstract"]),
            "overlap": dict(sorted(collections.Counter(" + ".join(record["sources"]) for record in unique).items())),
            "batches": len(manifest),
            "max_record_lines": max_lines,
            "input_hash": digest(input_hashes),
            "dataset_hash": dataset_hash,
        }
        seeds = _matching_seeds(unique, config)
        save_json(
            records_path,
            {
                "schema": SCHEMA,
                "tool": f"{TOOL} {VERSION}",
                "review_id": review_id,
                "dataset_hash": dataset_hash,
                "id_width": width,
                "unique": unique,
            },
        )
        save_json(work_path / "raw_records.json", raw_store)
        save_json(work_path / "manifest.json", manifest)
        save_json(work_path / "identification.json", identification)
        save_json(work_path / "seeds.json", seeds)
        duplicate_rows = []
        for record in unique:
            if len(record["members"]) < 2:
                continue
            for member in record["members"]:
                raw = all_records[member]
                duplicate_rows.append(
                    {
                        "kept_as": record["id"],
                        "member_index": member,
                        "matched_on": merge_reasons.get(member, "first"),
                        "database": raw["db"],
                        "file": raw["src_file"],
                        "year": raw["year"],
                        "doi": raw["doi"],
                        "pmid": raw["pmid"],
                        "title": raw["title"],
                    }
                )
        write_csv(
            work_path / "duplicates.csv",
            ("kept_as", "member_index", "matched_on", "database", "file", "year", "doi", "pmid", "title"),
            duplicate_rows,
        )

    return {
        "schema": SCHEMA,
        "tool": f"{TOOL} {VERSION}",
        "work": absolute(work_path),
        "review_id": review_id,
        "dataset_hash": dataset_hash,
        "raw_records": len(all_records),
        "unique_records": len(unique),
        "duplicates_removed": len(all_records) - len(unique),
        "batches": len(manifest),
        "skipped": skipped,
    }
