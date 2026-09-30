#!/usr/bin/env python3
"""Deterministic financial-statement normalization, metrics, forecasts, and evidence audit."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

from financial_support import (  # noqa: E402
    InputError,
    command_parser,
    normalize_date,
    normalize_unit,
    optional_number,
    optional_text,
    ratio,
    require_integer,
    require_list,
    require_number,
    require_object,
    require_text,
    run_command,
)


STATEMENTS = {"income", "balance", "cash-flow", "segment", "reconciliation"}
KINDS = ("actual", "computed", "assumed", "forecast", "unsupported")
FREQUENCIES = ("annual", "quarter", "ttm", "ytd", "instant")
PERIODIC_FREQUENCIES = ("annual", "quarter", "ttm", "ytd")
MARKET_CAP_LINE = "market_cap"
METRIC_STATEMENTS = {
    "revenue": "income",
    "gross_profit": "income",
    "operating_income": "income",
    "net_income": "income",
    "assets": "balance",
    "liabilities": "balance",
    "equity": "balance",
    "debt": "balance",
    "current_assets": "balance",
    "current_liabilities": "balance",
    "operating_cash_flow": "cash-flow",
    "capital_expenditure": "cash-flow",
}
RATIOS = {
    "gross_margin": ("gross_profit", "revenue"),
    "operating_margin": ("operating_income", "revenue"),
    "net_margin": ("net_income", "revenue"),
    "return_on_assets": ("net_income", "assets"),
    "return_on_equity": ("net_income", "equity"),
    "debt_to_equity": ("debt", "equity"),
    "current_ratio": ("current_assets", "current_liabilities"),
    "cash_conversion": ("operating_cash_flow", "net_income"),
}


def optional_date(value: Any, field: str) -> str | None:
    return None if value is None else normalize_date(value, field)


def optional_integer(value: Any, field: str) -> int | None:
    return None if value is None else require_integer(value, field, minimum=1)


def parse_inputs(value: Any, field: str) -> list[dict[str, Any]]:
    if value is None:
        return []
    parsed: list[dict[str, Any]] = []
    for index, raw in enumerate(require_list(value, field, nonempty=False)):
        entry = require_object(raw, f"{field}[{index}]")
        unit, multiplier = normalize_unit(entry.get("unit"), f"{field}[{index}].unit")
        amount = require_number(entry.get("value"), f"{field}[{index}].value")
        parsed.append({
            "name": require_text(entry.get("name"), f"{field}[{index}].name"),
            "source": require_text(entry.get("source"), f"{field}[{index}].source"),
            "source_date": optional_date(entry.get("source_date"), f"{field}[{index}].source_date"),
            "lineage": optional_text(entry.get("lineage"), f"{field}[{index}].lineage"),
            "derived_from": optional_text(entry.get("derived_from"), f"{field}[{index}].derived_from"),
            "currency": optional_currency(entry.get("currency"), f"{field}[{index}].currency"),
            "unit": unit,
            "value": amount,
            "value_base_units": amount * multiplier,
        })
    return parsed


def optional_currency(value: Any, field: str) -> str | None:
    return None if value is None else require_text(value, field).upper()


def normalize_provenance(value: str) -> str:
    return " ".join(value.split()).lower()


def provenance_verdict(entries: list[dict[str, Any]]) -> tuple[str, list[str]]:
    if any(entry["lineage"] is None for entry in entries):
        return "uncertified", ["provenance lineage missing"]
    lineages = [normalize_provenance(entry["lineage"]) for entry in entries]
    if len(set(lineages)) != len(lineages):
        return "not_independent", ["entries share one provenance lineage"]
    return "independent", []


def parse_windows(value: Any) -> list[dict[str, Any]]:
    if value is None:
        return []
    parsed: list[dict[str, Any]] = []
    for index, raw in enumerate(require_list(value, "windows")):
        entry = require_object(raw, f"windows[{index}]")
        start = normalize_date(entry.get("start"), f"windows[{index}].start")
        end = normalize_date(entry.get("end"), f"windows[{index}].end")
        if start > end:
            raise InputError(f"windows[{index}].start must not be after end")
        parsed.append({
            "statement": require_text(entry.get("statement"), f"windows[{index}].statement"),
            "line_item": require_text(entry.get("line_item"), f"windows[{index}].line_item"),
            "revision": optional_text(entry.get("revision"), f"windows[{index}].revision"),
            "start": start,
            "end": end,
        })
    return parsed


def parse_record(index: int, raw: Any) -> dict[str, Any]:
    field = f"records[{index}]"
    item = require_object(raw, field)
    statement = require_text(item.get("statement"), f"{field}.statement")
    if statement not in STATEMENTS:
        raise InputError(f"{field}.statement must be one of: {', '.join(sorted(STATEMENTS))}")
    unit, multiplier = normalize_unit(item.get("unit"), f"{field}.unit")
    value = require_number(item.get("value"), f"{field}.value")
    kind = optional_text(item.get("kind"), f"{field}.kind") or "actual"
    if kind not in KINDS:
        raise InputError(f"{field}.kind must be one of: {', '.join(KINDS)}")
    frequency = optional_text(item.get("frequency"), f"{field}.frequency")
    if frequency is not None and frequency not in FREQUENCIES:
        raise InputError(f"{field}.frequency must be one of: {', '.join(FREQUENCIES)}")
    period_start = optional_date(item.get("period_start"), f"{field}.period_start")
    period_end = optional_date(item.get("period_end"), f"{field}.period_end")
    if period_start is not None and period_end is not None and period_start > period_end:
        raise InputError(f"{field}.period_start must not be after period_end")
    return {
        "statement": statement,
        "line_item": require_text(item.get("line_item"), f"{field}.line_item"),
        "period": require_text(item.get("period"), f"{field}.period"),
        "currency": require_text(item.get("currency"), f"{field}.currency").upper(),
        "unit": unit,
        "value": value,
        "value_base_units": value * multiplier,
        "source": require_text(item.get("source"), f"{field}.source"),
        "reported_label": optional_text(item.get("reported_label"), f"{field}.reported_label"),
        "restated": bool(item.get("restated", False)),
        "adjustment": optional_text(item.get("adjustment"), f"{field}.adjustment"),
        "kind": kind,
        "frequency": frequency,
        "fiscal_year": optional_integer(item.get("fiscal_year"), f"{field}.fiscal_year"),
        "revision": optional_text(item.get("revision"), f"{field}.revision"),
        "source_date": optional_date(item.get("source_date"), f"{field}.source_date"),
        "lineage": optional_text(item.get("lineage"), f"{field}.lineage"),
        "period_start": period_start,
        "period_end": period_end,
        "period_bounded": period_start is not None and period_end is not None,
        "inputs": parse_inputs(item.get("inputs"), f"{field}.inputs"),
    }


def normalize(payload: dict[str, Any]) -> dict[str, Any]:
    raw_records = require_list(payload.get("records"), "records")
    normalized: list[dict[str, Any]] = []
    keys: set[tuple[str, str, str, str, str]] = set()
    for index, raw in enumerate(raw_records):
        record = parse_record(index, raw)
        key = (record["statement"], record["line_item"], record["period"], record["currency"], record["unit"])
        if key in keys:
            raise InputError(f"records[{index}] duplicates statement, line_item, period, currency, and unit; keep one source per record and use audit to reconcile sources")
        keys.add(key)
        normalized.append(record)
    normalized.sort(key=lambda item: (item["period"], item["statement"], item["line_item"], item["source"]))
    return {"command": "normalize", "records": normalized}


def metrics(payload: dict[str, Any]) -> dict[str, Any]:
    raw_records = require_list(payload.get("records"), "records")
    period_records: dict[str, dict[tuple[str, str], dict[str, Any]]] = defaultdict(dict)
    currency_by_period: dict[str, str] = {}
    bounds_by_frequency: dict[tuple[str, str | None], set[tuple[str, str]]] = defaultdict(set)
    for index, raw in enumerate(raw_records):
        record = parse_record(index, raw)
        period = record["period"]
        prior_currency = currency_by_period.setdefault(period, record["currency"])
        if prior_currency != record["currency"]:
            raise InputError(f"period {period} mixes currencies")
        item = (record["statement"], record["line_item"])
        if item in period_records[period]:
            raise InputError(f"period {period} duplicates {record['statement']} line_item {record['line_item']}")
        if record["period_bounded"]:
            bounds = bounds_by_frequency[(period, record["frequency"])]
            bounds.add((record["period_start"], record["period_end"]))
            if len(bounds) > 1:
                raise InputError(f"period {period} reports more than one period for the same frequency")
        period_records[period][item] = record
    results = []
    previous: tuple[str, dict[str, Any] | None] | None = None
    for period in sorted(period_records, key=lambda item: period_sort_key(item, metric_record(period_records[item], "revenue"))):
        records = period_records[period]
        revenue_record = metric_record(records, "revenue")
        order = period_order(period, revenue_record)
        growth, growth_reason = revenue_growth(previous, (period, revenue_record))
        computed: dict[str, float | None] = {}
        ratio_reasons: dict[str, str] = {}
        for name, (numerator, denominator) in RATIOS.items():
            value, reason = ratio_inputs(records, numerator, denominator)
            computed[name] = value
            if reason is not None:
                ratio_reasons[name] = reason
        operating_cash_flow = metric_record(records, "operating_cash_flow")
        capital_expenditure = metric_record(records, "capital_expenditure")
        computed["free_cash_flow"] = None
        if operating_cash_flow is not None and capital_expenditure is not None:
            reason = caliber_conflict(operating_cash_flow, capital_expenditure)
            if reason is None:
                computed["free_cash_flow"] = operating_cash_flow["value_base_units"] - abs(capital_expenditure["value_base_units"])
            else:
                ratio_reasons["free_cash_flow"] = reason
        assets = metric_record(records, "assets")
        liabilities = metric_record(records, "liabilities")
        equity = metric_record(records, "equity")
        residual = None if assets is None or liabilities is None or equity is None else assets["value_base_units"] - liabilities["value_base_units"] - equity["value_base_units"]
        results.append({
            "period": period,
            "currency": currency_by_period[period],
            "order": None if order is None else order[0],
            "metrics": {"revenue_growth": growth, **computed},
            "checks": {"balance_sheet_residual": residual},
            "revenue_growth_reason": growth_reason,
            "ratio_reasons": ratio_reasons,
        })
        previous = (period, revenue_record)
    return {"command": "metrics", "periods": results}


def forecast(payload: dict[str, Any]) -> dict[str, Any]:
    currency = require_text(payload.get("currency"), "currency").upper()
    unit, multiplier = normalize_unit(payload.get("unit"))
    base = require_object(payload.get("base_period"), "base_period")
    base_period = require_text(base.get("period"), "base_period.period")
    revenue = require_number(base.get("revenue"), "base_period.revenue", minimum=0.0)
    debt = optional_number(base.get("debt"), "base_period.debt")
    cash = optional_number(base.get("cash"), "base_period.cash")
    years = require_integer(payload.get("years"), "years", minimum=1, maximum=20)
    assumptions = require_object(payload.get("assumptions"), "assumptions")
    growth = require_number(assumptions.get("revenue_growth"), "assumptions.revenue_growth", minimum=-1.0, maximum=10.0)
    operating_margin = require_number(assumptions.get("operating_margin"), "assumptions.operating_margin", minimum=-10.0, maximum=1.0)
    tax_rate = require_number(assumptions.get("tax_rate"), "assumptions.tax_rate", minimum=0.0, maximum=1.0)
    depreciation_rate = require_number(assumptions.get("depreciation_rate", 0.0), "assumptions.depreciation_rate", minimum=0.0, maximum=10.0)
    capex_rate = require_number(assumptions.get("capex_rate", 0.0), "assumptions.capex_rate", minimum=0.0, maximum=10.0)
    working_capital_rate = require_number(assumptions.get("working_capital_rate", 0.0), "assumptions.working_capital_rate", minimum=-10.0, maximum=10.0)
    results = []
    for year in range(1, years + 1):
        revenue *= 1.0 + growth
        operating_income = revenue * operating_margin
        tax = operating_income * tax_rate
        depreciation = revenue * depreciation_rate
        capital_expenditure = revenue * capex_rate
        working_capital_change = revenue * working_capital_rate
        operating_cash_flow = operating_income - tax + depreciation - working_capital_change
        free_cash_flow = operating_cash_flow - capital_expenditure
        if cash is not None:
            cash += free_cash_flow
        results.append({
            "year": year,
            "revenue": revenue,
            "operating_income": operating_income,
            "tax": tax,
            "depreciation": depreciation,
            "capital_expenditure": capital_expenditure,
            "working_capital_change": working_capital_change,
            "operating_cash_flow": operating_cash_flow,
            "free_cash_flow": free_cash_flow,
            "cash": cash,
            "debt": debt,
        })
    return {"command": "forecast", "currency": currency, "unit": unit, "unit_multiplier": multiplier, "base_period": base_period, "assumptions": assumptions, "periods": results}


def parse_fx(value: Any) -> dict[tuple[str, str], dict[str, Any]]:
    if value is None:
        return {}
    index: dict[tuple[str, str], dict[str, Any]] = {}
    for position, raw in enumerate(require_list(value, "fx")):
        entry = require_object(raw, f"fx[{position}]")
        source_currency = require_text(entry.get("from"), f"fx[{position}].from").upper()
        target_currency = require_text(entry.get("to"), f"fx[{position}].to").upper()
        rate = require_number(entry.get("rate"), f"fx[{position}].rate", minimum=0.0)
        if rate == 0.0:
            raise InputError(f"fx[{position}].rate must be greater than zero")
        parsed = {
            "from": source_currency,
            "to": target_currency,
            "rate": rate,
            "source": require_text(entry.get("source"), f"fx[{position}].source"),
            "date": normalize_date(entry.get("date"), f"fx[{position}].date"),
        }
        if (source_currency, target_currency) in index:
            raise InputError(f"fx[{position}] duplicates the {source_currency} to {target_currency} pair")
        index[(source_currency, target_currency)] = parsed
    return index


def convert_amount(entry: dict[str, Any], target_currency: str, fx_index: dict[tuple[str, str], dict[str, Any]]) -> tuple[float | None, list[dict[str, Any]]]:
    if entry["currency"] == target_currency:
        return entry["value_base_units"], []
    evidence = fx_index.get((entry["currency"], target_currency))
    if evidence is None:
        return None, []
    return entry["value_base_units"] * evidence["rate"], [evidence]


def derived_from_market_cap(entry: dict[str, Any]) -> bool:
    text = (entry.get("derived_from") or "").lower()
    return "market_cap" in text or "market cap" in text or "marketcap" in text


def next_day(value: str) -> str:
    return (date.fromisoformat(value) + timedelta(days=1)).isoformat()


def year_label(period: str) -> int | None:
    label = period.strip().lower()
    if label.startswith("fy"):
        label = label[2:]
    if len(label) == 4 and label.isascii() and label.isdigit():
        return int(label)
    return None


def period_order(period: str, record: dict[str, Any] | None) -> tuple[str, str] | None:
    if record is not None and record["period_start"] is not None and record["period_end"] is not None:
        return ("period-dates", record["period_start"])
    year = year_label(period)
    if year is None:
        return None
    return ("year-label", str(year))


def period_sort_key(period: str, record: dict[str, Any] | None) -> tuple[int, str, str, str]:
    order = period_order(period, record)
    if order is None:
        return (1, "", "", period)
    return (0, order[0], order[1], period)


def metric_record(records: dict[tuple[str, str], dict[str, Any]], line_item: str) -> dict[str, Any] | None:
    statement = METRIC_STATEMENTS.get(line_item)
    return None if statement is None else records.get((statement, line_item))


def caliber_conflict(left: dict[str, Any], right: dict[str, Any]) -> str | None:
    if left["frequency"] == right["frequency"]:
        return None
    if "instant" in (left["frequency"], right["frequency"]):
        stock, flow = (left, right) if left["frequency"] == "instant" else (right, left)
        if stock["period_end"] is None or flow["period_end"] is None:
            return "the instant date and the flow period end are required to combine a stock and a flow"
        if stock["period_end"] != flow["period_end"]:
            return "the instant date differs from the flow period end"
        return None
    return "the frequency differs between the two line items"


def ratio_inputs(records: dict[tuple[str, str], dict[str, Any]], numerator: str, denominator: str) -> tuple[float | None, str | None]:
    top = metric_record(records, numerator)
    bottom = metric_record(records, denominator)
    if top is None or bottom is None:
        return None, None
    reason = caliber_conflict(top, bottom)
    if reason is not None:
        return None, reason
    return ratio(top["value_base_units"], bottom["value_base_units"]), None


def revenue_growth(
    previous: tuple[str, dict[str, Any] | None] | None,
    current: tuple[str, dict[str, Any] | None],
) -> tuple[float | None, str | None]:
    period, record = current
    if record is None:
        return None, "this period has no income revenue record"
    order = period_order(period, record)
    if order is None:
        return None, "period order is not established by period dates or a numeric year label"
    if previous is None:
        return None, "no preceding period in chronological order"
    previous_period, previous_record = previous
    if previous_record is None:
        return None, "the preceding period has no income revenue record"
    previous_order = period_order(previous_period, previous_record)
    if previous_order is None:
        return None, "the preceding period order is not established by period dates or a numeric year label"
    if order[0] != previous_order[0]:
        return None, "the period order basis differs from the preceding period"
    if record["currency"] != previous_record["currency"]:
        return None, "the currency differs from the preceding period"
    if record["frequency"] != previous_record["frequency"]:
        return None, "the frequency differs from the preceding period"
    if previous_record["value_base_units"] == 0.0:
        return None, "the preceding period revenue is zero"
    return (record["value_base_units"] - previous_record["value_base_units"]) / previous_record["value_base_units"], None


def period_coverage(records: list[dict[str, Any]], windows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[tuple[str, str, str, str | None], list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        if record["frequency"] in PERIODIC_FREQUENCIES:
            groups[(record["statement"], record["line_item"], record["frequency"], record["revision"])].append(record)
    matched: set[int] = set()
    results = []
    for key in sorted(groups, key=lambda item: (item[0], item[1], item[2], item[3] or "")):
        group = sorted(groups[key], key=lambda item: (item["period_start"] or "", item["period"], item["source"]))
        applicable = [index for index, window in enumerate(windows) if window["statement"] == key[0] and window["line_item"] == key[1] and window["revision"] == key[3]]
        matched.update(applicable)
        issues: list[str] = []
        window = None
        if len(applicable) > 1:
            issues.append("multiple declared windows match one coverage chain; declare revision to disambiguate")
        elif len(applicable) == 1:
            window = windows[applicable[0]]
        gaps: list[dict[str, str]] = []
        overlaps: list[dict[str, str]] = []
        if len(applicable) > 1:
            status = "uncertified"
        elif any(not record["period_bounded"] for record in group):
            status = "uncertified"
            issues.append("period start and end required; an end date or period label alone cannot certify coverage")
        else:
            for previous, current in zip(group, group[1:]):
                if current["period_start"] <= previous["period_end"]:
                    overlaps.append({"previous": previous["period"], "current": current["period"]})
                elif current["period_start"] > next_day(previous["period_end"]):
                    gaps.append({"previous": previous["period"], "current": current["period"]})
            if any(record["kind"] != "actual" for record in group):
                status = "uncertified"
                issues.append("non-actual period cannot certify coverage")
            elif window is None:
                status = "interval-only"
            elif gaps or overlaps or group[0]["period_start"] != window["start"] or group[-1]["period_end"] != window["end"]:
                status = "incomplete"
                issues.append("declared window is not matched exactly by one contiguous actual chain")
            else:
                status = "covered"
        start = group[0]["period_start"]
        end = group[-1]["period_end"]
        results.append({
            "statement": key[0],
            "line_item": key[1],
            "frequency": key[2],
            "revision": key[3],
            "currencies": sorted({record["currency"] for record in group}),
            "periods": [{"period": record["period"], "period_start": record["period_start"], "period_end": record["period_end"], "fiscal_year": record["fiscal_year"], "kind": record["kind"], "source": record["source"]} for record in group],
            "covered_start": start,
            "covered_end": end,
            "span_days": None if start is None or end is None else (date.fromisoformat(end) - date.fromisoformat(start)).days + 1,
            "gaps": gaps,
            "overlaps": overlaps,
            "window": None if window is None else {"start": window["start"], "end": window["end"]},
            "status": status,
            "issues": issues,
        })
    for index, window in enumerate(windows):
        if index in matched:
            continue
        results.append({
            "statement": window["statement"],
            "line_item": window["line_item"],
            "frequency": None,
            "revision": window["revision"],
            "currencies": [],
            "periods": [],
            "covered_start": None,
            "covered_end": None,
            "span_days": None,
            "gaps": [],
            "overlaps": [],
            "window": {"start": window["start"], "end": window["end"]},
            "status": "uncertified",
            "issues": ["no coverage chain matches the declared window"],
        })
    return results


def cross_source(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    groups: dict[tuple[str, str, str, str, str | None, str | None], list[dict[str, Any]]] = defaultdict(list)
    labels: dict[tuple[str, str, str, str], set[tuple[str | None, str | None]]] = defaultdict(set)
    for record in records:
        groups[(record["statement"], record["line_item"], record["kind"], record["currency"], record["period_start"], record["period_end"])].append(record)
        labels[(record["statement"], record["line_item"], record["kind"], record["period"])].add((record["period_start"], record["period_end"]))
    compared = []
    for key in sorted(groups, key=lambda item: (item[0], item[1], item[2], item[3], item[4] or "", item[5] or "")):
        group = groups[key]
        if len(group) < 2:
            continue
        contributions = [{
            "source": record["source"],
            "source_date": record["source_date"],
            "lineage": record["lineage"],
            "unit": record["unit"],
            "value": record["value"],
            "value_base_units": record["value_base_units"],
        } for record in sorted(group, key=lambda item: item["source"])]
        amounts = [item["value_base_units"] for item in contributions]
        if key[4] is None or key[5] is None:
            verdict, reasons = "uncertified", ["period bounds missing; a period label alone does not establish the same caliber"]
        else:
            verdict, reasons = provenance_verdict(group)
        compared.append({
            "statement": key[0],
            "line_item": key[1],
            "kind": key[2],
            "currency": key[3],
            "period_start": key[4],
            "period_end": key[5],
            "contributions": contributions,
            "difference": max(amounts) - min(amounts),
            "agrees": max(amounts) == min(amounts),
            "verdict": verdict,
            "reasons": reasons,
        })
    unaligned = [{
        "statement": key[0],
        "line_item": key[1],
        "kind": key[2],
        "period": key[3],
        "bounds": [list(bound) for bound in sorted(bounds, key=lambda item: (item[0] or "", item[1] or ""))],
    } for key, bounds in sorted(labels.items()) if len(bounds) > 1]
    return {"compared": compared, "unaligned": unaligned}


def market_cap_check(records: list[dict[str, Any]], fx_index: dict[tuple[str, str], dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for record in records:
        if record["line_item"] != MARKET_CAP_LINE:
            continue
        inputs = {entry["name"].strip().lower(): entry for entry in record["inputs"]}
        price = inputs.get("price")
        shares = inputs.get("shares")
        structural: list[str] = []
        dependency: list[str] = []
        notes: list[str] = []
        if price is None or shares is None:
            structural.append("price and shares inputs are required")
        if price is not None and price["currency"] is None:
            structural.append("the price input requires a currency")
        if price is not None and shares is not None:
            if shares["currency"] is not None:
                notes.append("the shares input declares a currency; a share count is used without conversion")
            if price["lineage"] is None or shares["lineage"] is None:
                structural.append("provenance lineage missing")
            elif normalize_provenance(price["lineage"]) == normalize_provenance(shares["lineage"]):
                dependency.append("price and shares share one provenance lineage")
            if derived_from_market_cap(price) or derived_from_market_cap(shares):
                dependency.append("an input is derived from the reported market cap")
        if structural:
            verdict = "uncertified"
        elif dependency:
            verdict = "not_independent"
        else:
            verdict = "independent"
        expected = None
        residual = None
        evidence: list[dict[str, Any]] = []
        if price is not None and price["currency"] is not None and shares is not None:
            converted, fx_evidence = convert_amount(price, record["currency"], fx_index)
            if converted is None:
                notes.append("fx evidence required for the price currency")
            else:
                expected = converted * shares["value_base_units"]
                residual = record["value_base_units"] - expected
                evidence = fx_evidence
        results.append({
            "period": record["period"],
            "period_start": record["period_start"],
            "period_end": record["period_end"],
            "currency": record["currency"],
            "unit": record["unit"],
            "source": record["source"],
            "source_date": record["source_date"],
            "reported_value_base_units": record["value_base_units"],
            "expected_value_base_units": expected,
            "residual": residual,
            "calculation": "computed" if residual is not None else "not_computed",
            "verdict": verdict,
            "reasons": structural + dependency,
            "notes": notes,
            "fx_evidence": evidence,
        })
    return sorted(results, key=lambda item: (item["period"], item["source"]))


def currency_caliber(records: list[dict[str, Any]], reporting_currency: str | None, fx_index: dict[tuple[str, str], dict[str, Any]]) -> list[dict[str, Any]]:
    groups: dict[tuple[str, str | None, str | None], list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        groups[(record["period"], record["period_start"], record["period_end"])].append(record)
    results = []
    for key in sorted(groups, key=lambda item: (item[0], item[1] or "", item[2] or "")):
        currencies = sorted({record["currency"] for record in groups[key]})
        needed = sorted(currency for currency in currencies if reporting_currency is not None and currency != reporting_currency)
        unresolved = [currency for currency in needed if (currency, reporting_currency) not in fx_index]
        evidence = [fx_index[(currency, reporting_currency)] for currency in needed if (currency, reporting_currency) in fx_index]
        if reporting_currency is None:
            status = "single-currency" if len(currencies) == 1 else "mixed-currency-unresolved"
        elif not needed:
            status = "single-currency"
        elif unresolved:
            status = "fx-missing"
        else:
            status = "fx-resolved"
        results.append({
            "period": key[0],
            "period_start": key[1],
            "period_end": key[2],
            "reporting_currency": reporting_currency,
            "currencies": currencies,
            "unresolved": unresolved,
            "fx_evidence": evidence,
            "status": status,
        })
    return results


def audit(payload: dict[str, Any]) -> dict[str, Any]:
    raw_records = require_list(payload.get("records"), "records")
    records = [parse_record(index, raw) for index, raw in enumerate(raw_records)]
    reporting = optional_text(payload.get("reporting_currency"), "reporting_currency")
    reporting_currency = reporting.upper() if reporting is not None else None
    fx_index = parse_fx(payload.get("fx"))
    windows = parse_windows(payload.get("windows"))
    seen: set[tuple[str, str, str, str, str, str, str]] = set()
    for index, record in enumerate(records):
        key = (record["statement"], record["line_item"], record["period"], record["currency"], record["unit"], record["kind"], record["source"])
        if key in seen:
            raise InputError(f"records[{index}] repeats one source, caliber, and kind")
        seen.add(key)
    return {
        "command": "audit",
        "reporting_currency": reporting_currency,
        "period_coverage": period_coverage(records, windows),
        "cross_source": cross_source(records),
        "market_cap": market_cap_check(records, fx_index),
        "currency_caliber": currency_caliber(records, reporting_currency, fx_index),
        "fx_evidence": [fx_index[key] for key in sorted(fx_index)],
    }


def main(argv: list[str] | None = None) -> int:
    parser = command_parser("Financial statement calculations", ["normalize", "metrics", "forecast", "audit"])
    return run_command(argv, parser, {"normalize": normalize, "metrics": metrics, "forecast": forecast, "audit": audit})


if __name__ == "__main__":
    raise SystemExit(main())
