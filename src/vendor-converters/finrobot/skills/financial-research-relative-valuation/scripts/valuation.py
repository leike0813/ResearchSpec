#!/usr/bin/env python3
"""Deterministic DCF, multiples, weighted valuation, and sensitivity."""

from __future__ import annotations

from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

from financial_support import (  # noqa: E402
    InputError,
    command_parser,
    normalize_unit,
    require_list,
    require_number,
    require_object,
    require_text,
    run_command,
)


def dcf_result(raw: Any, field: str = "dcf") -> dict[str, Any]:
    item = require_object(raw, field)
    cash_flows = [require_number(value, f"{field}.free_cash_flows[{index}]") for index, value in enumerate(require_list(item.get("free_cash_flows"), f"{field}.free_cash_flows"))]
    discount_rate = require_number(item.get("discount_rate"), f"{field}.discount_rate", minimum=0.0, maximum=1.0)
    terminal_growth = require_number(item.get("terminal_growth"), f"{field}.terminal_growth", minimum=-1.0, maximum=1.0)
    if discount_rate <= terminal_growth:
        raise InputError(f"{field}.discount_rate must exceed {field}.terminal_growth")
    net_debt = require_number(item.get("net_debt"), f"{field}.net_debt")
    diluted_shares = require_number(item.get("diluted_shares"), f"{field}.diluted_shares", minimum=0.000000001)
    present_values = [cash_flow / ((1.0 + discount_rate) ** year) for year, cash_flow in enumerate(cash_flows, start=1)]
    terminal_value = cash_flows[-1] * (1.0 + terminal_growth) / (discount_rate - terminal_growth)
    present_terminal = terminal_value / ((1.0 + discount_rate) ** len(cash_flows))
    enterprise_value = sum(present_values) + present_terminal
    equity_value = enterprise_value - net_debt
    return {
        "method": "dcf",
        "assumptions": {"discount_rate": discount_rate, "terminal_growth": terminal_growth, "net_debt": net_debt, "diluted_shares": diluted_shares},
        "present_value_cash_flows": present_values,
        "terminal_value": terminal_value,
        "present_value_terminal": present_terminal,
        "enterprise_value": enterprise_value,
        "equity_value": equity_value,
        "value_per_share": equity_value / diluted_shares,
    }


def multiples_result(raw: Any, field: str = "multiples") -> dict[str, Any]:
    item = require_object(raw, field)
    metric = require_number(item.get("metric"), f"{field}.metric")
    selected_multiple = require_number(item.get("selected_multiple"), f"{field}.selected_multiple", minimum=0.0)
    net_debt = require_number(item.get("net_debt"), f"{field}.net_debt")
    diluted_shares = require_number(item.get("diluted_shares"), f"{field}.diluted_shares", minimum=0.000000001)
    enterprise_value = metric * selected_multiple
    equity_value = enterprise_value - net_debt
    return {
        "method": "multiples",
        "assumptions": {"metric": metric, "selected_multiple": selected_multiple, "net_debt": net_debt, "diluted_shares": diluted_shares},
        "enterprise_value": enterprise_value,
        "equity_value": equity_value,
        "value_per_share": equity_value / diluted_shares,
    }


def value(payload: dict[str, Any]) -> dict[str, Any]:
    currency = require_text(payload.get("currency"), "currency").upper()
    unit, multiplier = normalize_unit(payload.get("unit"))
    results: dict[str, dict[str, Any]] = {}
    if payload.get("dcf") is not None:
        results["dcf"] = dcf_result(payload.get("dcf"))
    if payload.get("multiples") is not None:
        results["multiples"] = multiples_result(payload.get("multiples"))
    if not results:
        raise InputError("at least one of dcf or multiples is required")
    if len(results) == 1:
        only = next(iter(results))
        weights = {only: 1.0}
    else:
        weight_input = require_object(payload.get("weights"), "weights")
        weights = {name: require_number(weight_input.get(name), f"weights.{name}", minimum=0.0, maximum=1.0) for name in results}
        if abs(sum(weights.values()) - 1.0) > 1e-9:
            raise InputError("weights must sum to 1")
    weighted_value = sum(results[name]["value_per_share"] * weights[name] for name in results)
    return {"command": "value", "currency": currency, "unit": unit, "unit_multiplier": multiplier, "methods": results, "weights": weights, "weighted_value_per_share": weighted_value}


def sensitivity(payload: dict[str, Any]) -> dict[str, Any]:
    kind = require_text(payload.get("kind"), "kind")
    base = require_object(payload.get("base"), "base")
    grid = require_object(payload.get("grid"), "grid")
    rows: list[dict[str, Any]] = []
    if kind == "dcf":
        discount_rates = [require_number(value, f"grid.discount_rates[{index}]", minimum=0.0, maximum=1.0) for index, value in enumerate(require_list(grid.get("discount_rates"), "grid.discount_rates"))]
        terminal_growth_rates = [require_number(value, f"grid.terminal_growth_rates[{index}]", minimum=-1.0, maximum=1.0) for index, value in enumerate(require_list(grid.get("terminal_growth_rates"), "grid.terminal_growth_rates"))]
        for discount_rate in discount_rates:
            values = []
            for terminal_growth in terminal_growth_rates:
                candidate = {**base, "discount_rate": discount_rate, "terminal_growth": terminal_growth}
                values.append({"terminal_growth": terminal_growth, "value_per_share": dcf_result(candidate, "base")["value_per_share"]})
            rows.append({"discount_rate": discount_rate, "values": values})
        return {"command": "sensitivity", "kind": kind, "columns": terminal_growth_rates, "rows": rows}
    if kind == "multiples":
        multiples = [require_number(value, f"grid.multiples[{index}]", minimum=0.0) for index, value in enumerate(require_list(grid.get("multiples"), "grid.multiples"))]
        for selected_multiple in multiples:
            candidate = {**base, "selected_multiple": selected_multiple}
            rows.append({"selected_multiple": selected_multiple, "value_per_share": multiples_result(candidate, "base")["value_per_share"]})
        return {"command": "sensitivity", "kind": kind, "rows": rows}
    raise InputError("kind must be dcf or multiples")


def main(argv: list[str] | None = None) -> int:
    parser = command_parser("Financial valuation calculations", ["value", "sensitivity"])
    return run_command(argv, parser, {"value": value, "sensitivity": sensitivity})


if __name__ == "__main__":
    raise SystemExit(main())

