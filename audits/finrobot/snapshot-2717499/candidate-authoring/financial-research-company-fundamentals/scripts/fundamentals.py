#!/usr/bin/env python3
"""Deterministic company-fundamentals metrics and scenario forecasts."""

from __future__ import annotations

from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

from financial_support import (  # noqa: E402
    InputError,
    command_parser,
    normalize_unit,
    optional_number,
    ratio,
    require_integer,
    require_list,
    require_number,
    require_object,
    require_text,
    run_command,
)


NUMERIC_FIELDS = (
    "revenue", "gross_profit", "operating_income", "net_income", "assets",
    "equity", "debt", "cash", "operating_cash_flow",
)


def metrics(payload: dict[str, Any]) -> dict[str, Any]:
    currency = require_text(payload.get("currency"), "currency").upper()
    unit, multiplier = normalize_unit(payload.get("unit"))
    periods = require_list(payload.get("periods"), "periods")
    normalized: list[dict[str, Any]] = []
    previous_revenue: float | None = None
    seen: set[str] = set()
    for index, raw in enumerate(periods):
        item = require_object(raw, f"periods[{index}]")
        period = require_text(item.get("period"), f"periods[{index}].period")
        if period in seen:
            raise InputError(f"periods[{index}].period is duplicated: {period}")
        seen.add(period)
        values = {name: optional_number(item.get(name), f"periods[{index}].{name}") for name in NUMERIC_FIELDS}
        revenue = values["revenue"]
        result = {
            "period": period,
            "values": values,
            "metrics": {
                "revenue_growth": ratio(None if revenue is None or previous_revenue is None else revenue - previous_revenue, previous_revenue),
                "gross_margin": ratio(values["gross_profit"], revenue),
                "operating_margin": ratio(values["operating_income"], revenue),
                "net_margin": ratio(values["net_income"], revenue),
                "return_on_assets": ratio(values["net_income"], values["assets"]),
                "return_on_equity": ratio(values["net_income"], values["equity"]),
                "debt_to_equity": ratio(values["debt"], values["equity"]),
                "cash_conversion": ratio(values["operating_cash_flow"], values["net_income"]),
            },
        }
        normalized.append(result)
        previous_revenue = revenue if revenue is not None else previous_revenue
    return {"command": "metrics", "currency": currency, "unit": unit, "unit_multiplier": multiplier, "periods": normalized}


def forecast(payload: dict[str, Any]) -> dict[str, Any]:
    currency = require_text(payload.get("currency"), "currency").upper()
    unit, multiplier = normalize_unit(payload.get("unit"))
    base = require_object(payload.get("base_period"), "base_period")
    base_period = require_text(base.get("period"), "base_period.period")
    base_revenue = require_number(base.get("revenue"), "base_period.revenue", minimum=0.0)
    years = require_integer(payload.get("years"), "years", minimum=1, maximum=20)
    scenarios = require_list(payload.get("scenarios"), "scenarios")
    rendered: list[dict[str, Any]] = []
    names: set[str] = set()
    for index, raw in enumerate(scenarios):
        scenario = require_object(raw, f"scenarios[{index}]")
        name = require_text(scenario.get("name"), f"scenarios[{index}].name")
        if name in names:
            raise InputError(f"scenarios[{index}].name is duplicated: {name}")
        names.add(name)
        growth = require_number(scenario.get("revenue_growth"), f"scenarios[{index}].revenue_growth", minimum=-1.0, maximum=10.0)
        margin = require_number(scenario.get("operating_margin"), f"scenarios[{index}].operating_margin", minimum=-10.0, maximum=1.0)
        tax_rate = optional_number(scenario.get("tax_rate"), f"scenarios[{index}].tax_rate", minimum=0.0, maximum=1.0)
        revenue = base_revenue
        projections = []
        for year in range(1, years + 1):
            revenue *= 1.0 + growth
            operating_income = revenue * margin
            projections.append({
                "year": year,
                "revenue": revenue,
                "operating_income": operating_income,
                "after_tax_operating_income": None if tax_rate is None else operating_income * (1.0 - tax_rate),
            })
        rendered.append({
            "name": name,
            "assumptions": {"revenue_growth": growth, "operating_margin": margin, "tax_rate": tax_rate},
            "projections": projections,
        })
    return {"command": "forecast", "currency": currency, "unit": unit, "unit_multiplier": multiplier, "base_period": base_period, "scenarios": rendered}


def main(argv: list[str] | None = None) -> int:
    parser = command_parser("Company fundamentals calculations", ["metrics", "forecast"])
    return run_command(argv, parser, {"metrics": metrics, "forecast": forecast})


if __name__ == "__main__":
    raise SystemExit(main())

