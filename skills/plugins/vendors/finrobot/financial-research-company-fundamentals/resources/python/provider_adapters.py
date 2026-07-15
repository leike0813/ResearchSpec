"""Optional adapters derived from FinRobot's yfinance, SEC, and FMP helpers.

Callers construct these adapters with their own approved clients. No credentials,
provider SDK initialization, or network access occurs at module import time.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Callable, Mapping, Sequence


def _next_weekday(date: str) -> str:
    value = datetime.strptime(date, "%Y-%m-%d")
    while value.weekday() >= 5:
        value += timedelta(days=1)
    return value.strftime("%Y-%m-%d")


class YFinanceAdapter:
    def __init__(self, ticker_factory: Callable[[str], Any]) -> None:
        self._ticker_factory = ticker_factory

    def get_stock_data(self, symbol: str, start_date: str, end_date: str) -> Any:
        return self._ticker_factory(symbol).history(start=start_date, end=end_date)

    def get_stock_info(self, symbol: str) -> Mapping[str, Any]:
        return self._ticker_factory(symbol).info

    def get_income_stmt(self, symbol: str) -> Any:
        return self._ticker_factory(symbol).financials

    def get_balance_sheet(self, symbol: str) -> Any:
        return self._ticker_factory(symbol).balance_sheet

    def get_cash_flow(self, symbol: str) -> Any:
        return self._ticker_factory(symbol).cashflow

    def get_analyst_recommendations(self, symbol: str) -> tuple[Any, int]:
        recommendations = self._ticker_factory(symbol).recommendations
        if recommendations.empty:
            return None, 0
        votes = recommendations.iloc[0, 1:]
        maximum = votes.max()
        return votes[votes == maximum].index.tolist()[0], maximum


class SECSectionAdapter:
    def __init__(
        self,
        extractor: Any,
        report_locator: Callable[[str, str], str],
    ) -> None:
        self._extractor = extractor
        self._report_locator = report_locator

    def get_10k_section(self, symbol: str, fiscal_year: str, section: str | int) -> str:
        allowed = {str(i) for i in range(1, 16)} | {"1A", "1B", "7A", "9A", "9B"}
        section_id = str(section)
        if section_id not in allowed:
            raise ValueError(f"unsupported 10-K section: {section_id}")
        report_url = self._report_locator(symbol, fiscal_year)
        return self._extractor.get_section(report_url, section_id, "text")


class FMPAdapter:
    """FMP-shaped adapter using an injected authenticated JSON requester."""

    def __init__(self, get_json: Callable[[str, Mapping[str, Any]], Any]) -> None:
        self._get_json = get_json

    def _get(self, path: str, **params: Any) -> Any:
        return self._get_json(path, params)

    def get_target_price(self, symbol: str, date: str) -> str:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        estimates = [
            item["priceTarget"]
            for item in self._get("/api/v4/price-target", symbol=symbol)
            if abs((datetime.fromisoformat(item["publishedDate"][:10]) - target_date).days) <= 999
        ]
        if not estimates:
            return "N/A"
        ordered = sorted(estimates)
        midpoint = ordered[len(ordered) // 2]
        return f"{ordered[0]} - {ordered[-1]} (md. {midpoint})"

    def get_historical_market_cap(self, symbol: str, date: str) -> float:
        date = _next_weekday(date)
        data = self._get(
            f"/api/v3/historical-market-capitalization/{symbol}",
            limit=100,
            **{"from": date, "to": date},
        )
        return float(data[0]["marketCap"])

    def get_historical_bvps(self, symbol: str, date: str) -> float:
        target = datetime.strptime(date, "%Y-%m-%d")
        data = self._get(f"/api/v3/key-metrics/{symbol}", limit=40)
        closest = min(
            data,
            key=lambda item: abs(target - datetime.strptime(item["date"], "%Y-%m-%d")),
        )
        return float(closest["bookValuePerShare"])

    def get_competitor_financial_metrics(
        self, symbol: str, competitors: Sequence[str], years: int = 4
    ) -> Mapping[str, Any]:
        import pandas as pd

        result = {}
        for current in [symbol, *competitors]:
            income = self._get(f"/api/v3/income-statement/{current}", limit=years)
            key_metrics = self._get(f"/api/v3/key-metrics/{current}", limit=years)
            rows = {}
            for offset in range(min(years, len(income), len(key_metrics))):
                statement = income[offset]
                keys = key_metrics[offset]
                previous = income[offset - 1] if offset > 0 else None
                revenue_growth = None
                if previous and previous["revenue"]:
                    revenue_growth = (statement["revenue"] / previous["revenue"] - 1) * 100
                rows[offset] = {
                    "Revenue": round(statement["revenue"] / 1e6),
                    "Revenue Growth": revenue_growth,
                    "Gross Margin": statement["grossProfit"] / statement["revenue"],
                    "EBITDA Margin": statement["ebitdaratio"],
                    "ROIC": keys["roic"] * 100,
                    "EV/EBITDA": keys["enterpriseValueOverEBITDA"],
                }
            result[current] = pd.DataFrame.from_dict(rows, orient="index").sort_index(axis=1)
        return result
