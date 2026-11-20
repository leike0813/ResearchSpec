"""Screening configuration and stage-specific identity contracts."""
from __future__ import annotations

from copy import deepcopy
import re

from screening_common import ScreeningError, digest, load_json


ADVANCE = ("include", "unclear")
LABELS = ("include", "unclear", "exclude")
FIXED_CODES = {"include": "INC", "unclear": "UNC"}
MIN_QC_SAMPLE = 20
CODE_RE = re.compile(r"^[A-Z][A-Z0-9_-]{0,9}$")

DEFAULT_CONFIG = {
    "review_title": "",
    "exclusion_codes": [
        {"code": "E1", "short": "publication type", "label": "Publication type not eligible"},
        {"code": "E2", "short": "not human", "label": "Population not eligible"},
        {"code": "E3", "short": "intervention", "label": "Intervention, index test or exposure not eligible"},
        {"code": "E4", "short": "comparator", "label": "Comparator not eligible"},
        {"code": "E5", "short": "outcome", "label": "Outcome not eligible"},
        {"code": "E6", "short": "design", "label": "Study design not eligible"},
        {"code": "E9", "short": "other", "label": "Other (explained)"},
    ],
    "ft_exclusion_codes": None,
    "core_criteria": ["population", "intervention or index test"],
    "personas": {
        "A": "Reviewer A applies the confirmed eligibility criteria.",
        "B": "Reviewer B applies the confirmed eligibility criteria independently.",
    },
    "conflict_policy": "adjudicate",
    "qc": {
        "near_miss": {},
        "random_exclusion_sample": 100,
        "random_seed": 2026,
        "policy": "advance",
    },
    "seeds": [],
    "languages_allowed": [],
    "models": {"A": "", "B": "", "ADJ": "", "QC": "", "FTA": "", "FTB": "", "FTADJ": ""},
    "model_labels": {},
    "batching": {"max_records": 50, "max_chars": 90000, "wrap": 150},
    "dedup": {"doi_title_guard": True},
    "read_limit": 900,
    "grep_after": 60,
}


def _merged(default, supplied):
    result = deepcopy(default)
    for key, value in supplied.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _merged(result[key], value)
        else:
            result[key] = value
    return result


def _codes(value, field):
    if not isinstance(value, list) or not value:
        raise ScreeningError(f"{field} must be a non-empty array")
    result, seen = [], set()
    for item in value:
        if not isinstance(item, dict):
            raise ScreeningError(f"{field} entries must be objects")
        code = item.get("code")
        label = item.get("label")
        if not isinstance(code, str) or not CODE_RE.fullmatch(code) or code in ("INC", "UNC"):
            raise ScreeningError(f"invalid exclusion code in {field}: {code!r}")
        if code in seen:
            raise ScreeningError(f"duplicate exclusion code in {field}: {code}")
        if not isinstance(label, str) or not label.strip():
            raise ScreeningError(f"exclusion code {code} needs a label")
        seen.add(code)
        result.append(dict(item))
    return result


def load_config(path=None):
    supplied = load_json(path, {}) if path else {}
    if not isinstance(supplied, dict):
        raise ScreeningError("screening config must be a JSON object")
    config = _merged(DEFAULT_CONFIG, supplied)
    config["exclusion_codes"] = _codes(config["exclusion_codes"], "exclusion_codes")
    if config.get("ft_exclusion_codes") is not None:
        config["ft_exclusion_codes"] = _codes(config["ft_exclusion_codes"], "ft_exclusion_codes")
    if config["conflict_policy"] not in ("adjudicate", "liberal"):
        raise ScreeningError("conflict_policy must be 'adjudicate' or 'liberal'")
    qc = config["qc"]
    if not isinstance(qc, dict):
        raise ScreeningError("qc must be an object")
    if qc.get("policy", "advance") not in ("advance", "flag"):
        raise ScreeningError("qc.policy must be 'advance' or 'flag'")
    sample = qc.get("random_exclusion_sample")
    if isinstance(sample, bool) or not isinstance(sample, int) or sample < MIN_QC_SAMPLE:
        raise ScreeningError(f"qc.random_exclusion_sample must be an integer >= {MIN_QC_SAMPLE}")
    seed = qc.get("random_seed", 2026)
    if isinstance(seed, bool) or not isinstance(seed, int):
        raise ScreeningError("qc.random_seed must be an integer")
    groups = qc.get("near_miss") or {}
    if not isinstance(groups, dict):
        raise ScreeningError("qc.near_miss must be an object of regex groups")
    for group, patterns in groups.items():
        if not isinstance(group, str) or not group or not isinstance(patterns, list) or not patterns:
            raise ScreeningError("each qc.near_miss group needs a non-empty regex array")
        for pattern in patterns:
            if not isinstance(pattern, str):
                raise ScreeningError("qc.near_miss regexes must be strings")
            try:
                re.compile(pattern, re.I)
            except re.error as exc:
                raise ScreeningError(f"invalid qc.near_miss regex {pattern!r}: {exc}") from exc
    batching = config["batching"]
    if not isinstance(batching, dict):
        raise ScreeningError("batching must be an object")
    for key, minimum in (("max_records", 1), ("max_chars", 1000), ("wrap", 40)):
        value = batching.get(key)
        if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
            raise ScreeningError(f"batching.{key} must be an integer >= {minimum}")
    if not isinstance(config.get("seeds"), list):
        raise ScreeningError("seeds must be an array")
    if not isinstance(config.get("languages_allowed"), list):
        raise ScreeningError("languages_allowed must be an array")
    dedup = config.get("dedup")
    if not isinstance(dedup, dict) or not isinstance(dedup.get("doi_title_guard"), bool):
        raise ScreeningError("dedup.doi_title_guard must be boolean")
    return config


def stage_codes(config, stage):
    if stage == "ft" and config.get("ft_exclusion_codes"):
        return [row["code"] for row in config["ft_exclusion_codes"]]
    return [row["code"] for row in config["exclusion_codes"]]


def stage_code_rows(config, stage):
    if stage == "ft" and config.get("ft_exclusion_codes"):
        return config["ft_exclusion_codes"]
    return config["exclusion_codes"]


def valid_decision(decision, codes):
    if not isinstance(decision, dict):
        return False
    label, code = decision.get("d"), decision.get("code")
    if label == "include":
        return code == "INC"
    if label == "unclear":
        return code == "UNC"
    if label == "exclude":
        return code in codes
    return False


def decision_snapshot(config, stage):
    """Fields that change reviewer-visible screening rules for one stage."""
    payload = {
        "codes": [dict(row) for row in stage_code_rows(config, stage)],
        "core_criteria": config["core_criteria"],
        "personas": {role: config["personas"].get(role, "") for role in ("A", "B")},
        "conflict_policy": config["conflict_policy"],
    }
    if stage == "ta":
        payload["qc"] = config["qc"]
    return payload


def config_hash(config, stage):
    return digest(decision_snapshot(config, stage))


def code_labels(config, stage):
    labels = {"INC": "Include", "UNC": "Unclear - needs next stage / team decision"}
    labels.update({row["code"]: f"{row['code']} {row['label']}" for row in stage_code_rows(config, stage)})
    return labels
