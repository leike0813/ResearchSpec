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
    normalize_date,
    normalize_unit,
    optional_number,
    optional_text,
    ratio,
    require_list,
    require_number,
    require_object,
    require_text,
    run_command,
)


BASIS_KEYS = ("currency", "period", "as_of", "share_basis")
BRIDGE_ALTERNATIVES = ("debt", "total_debt", "cash", "cash_and_equivalents")
DCF_KEYS = ("free_cash_flows", "discount_rate", "terminal_growth", "net_debt", "preferred_stock", "noncontrolling_interest", "diluted_shares", *BASIS_KEYS)
MULTIPLES_KEYS = ("metric", "selected_multiple", "net_debt", "preferred_stock", "noncontrolling_interest", "diluted_shares", *BASIS_KEYS)
VALUE_KEYS = ("currency", "unit", "applicability", "weight_rationale", "dcf", "multiples", "weights", *BASIS_KEYS)
SENSITIVITY_KEYS = ("kind", "base", "grid")
DCF_GRID_KEYS = ("discount_rates", "terminal_growth_rates")
MULTIPLES_GRID_KEYS = ("multiples",)


def reject_unknown(item: dict[str, Any], field: str, allowed: tuple[str, ...]) -> None:
    """Refuse fields the contract does not define instead of silently ignoring them."""
    unknown = sorted(set(item) - set(allowed))
    if unknown:
        raise InputError(f"{field} has unsupported fields: {', '.join(unknown)}")


def reject_duplicate_bridge(item: dict[str, Any], field: str) -> None:
    """Refuse debt or cash inputs that would deduct the bridge twice."""
    duplicates = [key for key in BRIDGE_ALTERNATIVES if key in item]
    if duplicates and item.get("net_debt") is not None:
        raise InputError(
            f"{field} supplies {', '.join(duplicates)} alongside net_debt; net_debt already nets debt and cash, "
            "so supplying both would deduct twice - supply net_debt alone"
        )


def metadata(item: dict[str, Any], field: str, top: dict[str, str | None]) -> dict[str, str | None]:
    """Resolve the caller's currency, financial period, valuation date, and share basis for one method."""
    resolved: dict[str, str | None] = {}
    for key in BASIS_KEYS:
        override = item.get(key)
        if override is None:
            resolved[key] = top.get(key)
        elif key == "as_of":
            resolved[key] = normalize_date(override, f"{field}.as_of")
        elif key == "currency":
            resolved[key] = require_text(override, f"{field}.currency").upper()
        else:
            resolved[key] = require_text(override, f"{field}.{key}")
    return resolved


def equity_bridge(item: dict[str, Any], field: str, enterprise_value: float, diluted_shares: float) -> dict[str, Any]:
    """Convert enterprise value to common equity, deducting each claim exactly once."""
    net_debt = require_number(item.get("net_debt"), f"{field}.net_debt")
    preferred = optional_number(item.get("preferred_stock"), f"{field}.preferred_stock", minimum=0.0)
    noncontrolling = optional_number(item.get("noncontrolling_interest"), f"{field}.noncontrolling_interest", minimum=0.0)
    equity_value = enterprise_value - net_debt - (preferred or 0.0) - (noncontrolling or 0.0)
    if equity_value <= 0:
        raise InputError(
            f"{field} common equity value is non-positive ({equity_value:.6g}): net debt, preferred stock, and "
            "noncontrolling interest exceed enterprise value; a negative fair value per share is not publishable"
        )
    unverified = [name for name, value in (("preferred_stock", preferred), ("noncontrolling_interest", noncontrolling)) if value is None]
    return {
        "net_debt": net_debt,
        "preferred_stock": preferred,
        "noncontrolling_interest": noncontrolling,
        "equity_value": equity_value,
        "value_per_share": equity_value / diluted_shares,
        "unverified_claims": unverified,
    }


def comparability_reasons(results: dict[str, dict[str, Any]], rationale: str | None, applicability: str | None) -> list[str]:
    """Reasons a weighted composite cannot be certified from the supplied metadata."""
    reasons: list[str] = []
    if rationale is None:
        reasons.append("weight_rationale is required to certify a weighted composite")
    if applicability is None:
        reasons.append("applicability is required to certify a weighted composite")
    shared = {tuple(result["metadata"][key] for key in BASIS_KEYS) for result in results.values()}
    if len(shared) > 1:
        reasons.append("methods are not on one currency, financial period, valuation date, and share basis")
    elif any(value is None for value in next(iter(shared))):
        reasons.append("currency, period, as_of, and share_basis must all be known to certify a weighted composite")
    if len({result["assumptions"]["diluted_shares"] for result in results.values()}) > 1:
        reasons.append("methods use different diluted share counts")
    bridges = {(result["assumptions"]["net_debt"], result["assumptions"]["preferred_stock"] or 0.0, result["assumptions"]["noncontrolling_interest"] or 0.0) for result in results.values()}
    if len(bridges) > 1:
        reasons.append("methods use different bridge inputs for the same issuer")
    if any(result["unverified_claims"] for result in results.values()):
        reasons.append("a bridge claim is unverified and assumed zero; verify preferred_stock and noncontrolling_interest before certifying a composite")
    return reasons


def run_diagnostics(results: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Advisory spread and terminal-share diagnostics; no threshold and no method selection."""
    per_share = [result["value_per_share"] for result in results.values()]
    currencies = {result["metadata"]["currency"] for result in results.values()}
    multi = len(per_share) > 1 and len(currencies) == 1 and None not in currencies
    return {
        "method_absolute_spread": max(per_share) - min(per_share) if multi else None,
        "method_span_ratio": ratio(max(per_share), min(per_share)) if multi else None,
        "terminal_value_share_of_ev": results["dcf"]["terminal_value_share_of_ev"] if "dcf" in results else None,
    }


def run_advisories(results: dict[str, dict[str, Any]]) -> list[str]:
    """Advisory notes that never fail the run and never withhold a documented value."""
    notes: list[str] = []
    for name, result in results.items():
        for claim in result["unverified_claims"]:
            notes.append(f"{name} {claim} was not reported and is assumed zero in the bridge; verify it before relying on the equity value")
    return notes


def dcf_result(raw: Any, field: str = "dcf", top: dict[str, str | None] | None = None) -> dict[str, Any]:
    item = require_object(raw, field)
    reject_duplicate_bridge(item, field)
    reject_unknown(item, field, DCF_KEYS)
    cash_flows = [require_number(value, f"{field}.free_cash_flows[{index}]") for index, value in enumerate(require_list(item.get("free_cash_flows"), f"{field}.free_cash_flows"))]
    discount_rate = require_number(item.get("discount_rate"), f"{field}.discount_rate", minimum=0.0, maximum=1.0)
    terminal_growth = require_number(item.get("terminal_growth"), f"{field}.terminal_growth", minimum=-1.0, maximum=1.0)
    if discount_rate <= terminal_growth:
        raise InputError(f"{field}.discount_rate must exceed {field}.terminal_growth")
    if cash_flows[-1] <= 0 or terminal_growth == -1.0:
        raise InputError(f"{field}.free_cash_flows terminal value must be positive; {cash_flows[-1]:.6g} cannot be capitalized into a terminal value")
    diluted_shares = require_number(item.get("diluted_shares"), f"{field}.diluted_shares", minimum=0.000000001)
    present_values = [cash_flow / ((1.0 + discount_rate) ** year) for year, cash_flow in enumerate(cash_flows, start=1)]
    terminal_value = cash_flows[-1] * (1.0 + terminal_growth) / (discount_rate - terminal_growth)
    present_terminal = terminal_value / ((1.0 + discount_rate) ** len(cash_flows))
    enterprise_value = sum(present_values) + present_terminal
    bridge = equity_bridge(item, field, enterprise_value, diluted_shares)
    resolved = metadata(item, field, top or {})
    return {
        "method": "dcf",
        "metadata": resolved,
        "assumptions": {"discount_rate": discount_rate, "terminal_growth": terminal_growth, "net_debt": bridge["net_debt"], "preferred_stock": bridge["preferred_stock"], "noncontrolling_interest": bridge["noncontrolling_interest"], "diluted_shares": diluted_shares},
        "present_value_cash_flows": present_values,
        "terminal_value": terminal_value,
        "present_value_terminal": present_terminal,
        "enterprise_value": enterprise_value,
        "equity_value": bridge["equity_value"],
        "value_per_share": bridge["value_per_share"],
        "value_per_share_currency": resolved["currency"],
        "terminal_value_share_of_ev": ratio(present_terminal, enterprise_value),
        "unverified_claims": bridge["unverified_claims"],
    }


def multiples_result(raw: Any, field: str = "multiples", top: dict[str, str | None] | None = None) -> dict[str, Any]:
    item = require_object(raw, field)
    reject_duplicate_bridge(item, field)
    reject_unknown(item, field, MULTIPLES_KEYS)
    metric = require_number(item.get("metric"), f"{field}.metric")
    selected_multiple = require_number(item.get("selected_multiple"), f"{field}.selected_multiple", minimum=0.0)
    diluted_shares = require_number(item.get("diluted_shares"), f"{field}.diluted_shares", minimum=0.000000001)
    enterprise_value = metric * selected_multiple
    bridge = equity_bridge(item, field, enterprise_value, diluted_shares)
    resolved = metadata(item, field, top or {})
    return {
        "method": "multiples",
        "metadata": resolved,
        "assumptions": {"metric": metric, "selected_multiple": selected_multiple, "net_debt": bridge["net_debt"], "preferred_stock": bridge["preferred_stock"], "noncontrolling_interest": bridge["noncontrolling_interest"], "diluted_shares": diluted_shares},
        "enterprise_value": enterprise_value,
        "equity_value": bridge["equity_value"],
        "value_per_share": bridge["value_per_share"],
        "value_per_share_currency": resolved["currency"],
        "unverified_claims": bridge["unverified_claims"],
    }


def value(payload: dict[str, Any]) -> dict[str, Any]:
    reject_unknown(payload, "value", VALUE_KEYS)
    currency = require_text(payload.get("currency"), "currency").upper()
    unit, multiplier = normalize_unit(payload.get("unit"))
    rationale = optional_text(payload.get("weight_rationale"), "weight_rationale")
    applicability = optional_text(payload.get("applicability"), "applicability")
    top: dict[str, str | None] = {
        "currency": currency,
        "period": optional_text(payload.get("period"), "period"),
        "as_of": normalize_date(payload.get("as_of"), "as_of") if payload.get("as_of") is not None else None,
        "share_basis": optional_text(payload.get("share_basis"), "share_basis"),
    }
    results: dict[str, dict[str, Any]] = {}
    if payload.get("dcf") is not None:
        results["dcf"] = dcf_result(payload.get("dcf"), "dcf", top)
    if payload.get("multiples") is not None:
        results["multiples"] = multiples_result(payload.get("multiples"), "multiples", top)
    if not results:
        raise InputError("at least one of dcf or multiples is required")
    single = next(iter(results)) if len(results) == 1 else None
    if single is not None:
        weights: dict[str, float] = {single: 1.0}
        reasons = ["a single method is reported without a composite point estimate"]
        weighted: float | None = results[single]["value_per_share"]
    else:
        weight_input = require_object(payload.get("weights"), "weights")
        reject_unknown(weight_input, "weights", tuple(results))
        weights = {name: require_number(weight_input.get(name), f"weights.{name}", minimum=0.0, maximum=1.0) for name in results}
        if abs(sum(weights.values()) - 1.0) > 1e-9:
            raise InputError("weights must sum to 1")
        reasons = comparability_reasons(results, rationale, applicability)
        weighted = sum(results[name]["value_per_share"] * weights[name] for name in results) if not reasons else None
    return {
        "command": "value",
        "requested_currency": currency,
        "unit": unit,
        "unit_multiplier": multiplier,
        "share_count_unit": unit,
        "applicability": applicability,
        "methods": results,
        "weights": weights,
        "weighted_value_per_share": weighted,
        "composite": {"certified": single is None and not reasons, "weight_rationale": rationale, "uncertified_reasons": reasons, "advisories": run_advisories(results)},
        "diagnostics": run_diagnostics(results),
    }


def sensitivity(payload: dict[str, Any]) -> dict[str, Any]:
    reject_unknown(payload, "sensitivity", SENSITIVITY_KEYS)
    kind = require_text(payload.get("kind"), "kind")
    base = require_object(payload.get("base"), "base")
    grid = require_object(payload.get("grid"), "grid")
    rows: list[dict[str, Any]] = []
    if kind == "dcf":
        reject_unknown(grid, "sensitivity.grid", DCF_GRID_KEYS)
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
        reject_unknown(grid, "sensitivity.grid", MULTIPLES_GRID_KEYS)
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
