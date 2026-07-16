#!/usr/bin/env python3
"""Deterministic financial-statement normalization, metrics, and forecasts."""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

from financial_support import (  # noqa: E402
    InputError,
    command_parser,
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


def normalize(payload: dict[str, Any]) -> dict[str, Any]:
    records = require_list(payload.get("records"), "records")
    normalized: list[dict[str, Any]] = []
    keys: set[tuple[str, str, str, str, str]] = set()
    for index, raw in enumerate(records):
        item = require_object(raw, f"records[{index}]")
        statement = require_text(item.get("statement"), f"records[{index}].statement")
        if statement not in STATEMENTS:
            raise InputError(f"records[{index}].statement must be one of: {', '.join(sorted(STATEMENTS))}")
        line_item = require_text(item.get("line_item"), f"records[{index}].line_item")
        period = require_text(item.get("period"), f"records[{index}].period")
        currency = require_text(item.get("currency"), f"records[{index}].currency").upper()
        unit, multiplier = normalize_unit(item.get("unit"), f"records[{index}].unit")
        value = require_number(item.get("value"), f"records[{index}].value")
        source = require_text(item.get("source"), f"records[{index}].source")
        key = (statement, line_item, period, currency, unit)
        if key in keys:
            raise InputError(f"records[{index}] duplicates statement, line_item, period, currency, and unit")
        keys.add(key)
        normalized.append({
            "statement": statement,
            "line_item": line_item,
            "period": period,
            "currency": currency,
            "unit": unit,
            "value": value,
            "value_base_units": value * multiplier,
            "source": source,
            "reported_label": optional_text(item.get("reported_label"), f"records[{index}].reported_label"),
            "restated": bool(item.get("restated", False)),
            "adjustment": optional_text(item.get("adjustment"), f"records[{index}].adjustment"),
        })
    normalized.sort(key=lambda item: (item["period"], item["statement"], item["line_item"], item["source"]))
    return {"command": "normalize", "records": normalized}


def metrics(payload: dict[str, Any]) -> dict[str, Any]:
    records = require_list(payload.get("records"), "records")
    by_period: dict[str, dict[str, float]] = defaultdict(dict)
    currency_by_period: dict[str, str] = {}
    for index, raw in enumerate(records):
        item = require_object(raw, f"records[{index}]")
        period = require_text(item.get("period"), f"records[{index}].period")
        line_item = require_text(item.get("line_item"), f"records[{index}].line_item")
        currency = require_text(item.get("currency"), f"records[{index}].currency").upper()
        value = item.get("value_base_units")
        if value is None:
            unit, multiplier = normalize_unit(item.get("unit"), f"records[{index}].unit")
            _ = unit
            value = require_number(item.get("value"), f"records[{index}].value") * multiplier
        else:
            value = require_number(value, f"records[{index}].value_base_units")
        prior_currency = currency_by_period.setdefault(period, currency)
        if prior_currency != currency:
            raise InputError(f"period {period} mixes currencies")
        if line_item in by_period[period]:
            raise InputError(f"period {period} duplicates line_item {line_item}")
        by_period[period][line_item] = value
    results = []
    previous_revenue: float | None = None
    for period in sorted(by_period):
        values = by_period[period]
        revenue = values.get("revenue")
        net_income = values.get("net_income")
        operating_cash_flow = values.get("operating_cash_flow")
        assets = values.get("assets")
        liabilities = values.get("liabilities")
        equity = values.get("equity")
        residual = None if assets is None or liabilities is None or equity is None else assets - liabilities - equity
        results.append({
            "period": period,
            "currency": currency_by_period[period],
            "metrics": {
                "revenue_growth": ratio(None if revenue is None or previous_revenue is None else revenue - previous_revenue, previous_revenue),
                "gross_margin": ratio(values.get("gross_profit"), revenue),
                "operating_margin": ratio(values.get("operating_income"), revenue),
                "net_margin": ratio(net_income, revenue),
                "return_on_assets": ratio(net_income, assets),
                "return_on_equity": ratio(net_income, equity),
                "debt_to_equity": ratio(values.get("debt"), equity),
                "current_ratio": ratio(values.get("current_assets"), values.get("current_liabilities")),
                "cash_conversion": ratio(operating_cash_flow, net_income),
                "free_cash_flow": None if operating_cash_flow is None or values.get("capital_expenditure") is None else operating_cash_flow - abs(values["capital_expenditure"]),
            },
            "checks": {"balance_sheet_residual": residual},
        })
        previous_revenue = revenue if revenue is not None else previous_revenue
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


def main(argv: list[str] | None = None) -> int:
    parser = command_parser("Financial statement calculations", ["normalize", "metrics", "forecast"])
    return run_command(argv, parser, {"normalize": normalize, "metrics": metrics, "forecast": forecast})


if __name__ == "__main__":
    raise SystemExit(main())

