"""Provider-neutral contracts for the FinRobot-derived Skill resources.

ResearchSpec distributes these definitions as inert files. A user-selected Agent or
tool runner may provide implementations and credentials at execution time.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping, Protocol, Sequence


@dataclass(frozen=True)
class DataRequest:
    symbol: str
    as_of: str | None = None
    fiscal_year: str | None = None
    sections: tuple[str, ...] = ()
    provider_options: Mapping[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class GenerationRequest:
    system_prompt: str
    user_prompt: str
    model: str
    temperature: float
    max_tokens: int


class TabularValue(Protocol):
    """Minimal table surface consumed by the adapted analysis code."""

    def to_string(self) -> str: ...


class MarketDataProvider(Protocol):
    def get_income_stmt(self, symbol: str) -> TabularValue: ...
    def get_balance_sheet(self, symbol: str) -> TabularValue: ...
    def get_cash_flow(self, symbol: str) -> TabularValue: ...
    def get_stock_data(self, symbol: str, start_date: str, end_date: str) -> Any: ...
    def get_stock_info(self, symbol: str) -> Mapping[str, Any]: ...
    def get_analyst_recommendations(self, symbol: str) -> tuple[Any, int]: ...


class FilingProvider(Protocol):
    def get_10k_section(self, symbol: str, fiscal_year: str, section: str | int) -> str: ...


class FinancialMetricsProvider(Protocol):
    def get_competitor_financial_metrics(
        self, symbol: str, competitors: Sequence[str], years: int
    ) -> Mapping[str, Any]: ...
    def get_target_price(self, symbol: str, date: str) -> float: ...
    def get_historical_market_cap(self, symbol: str, date: str) -> float: ...
    def get_historical_bvps(self, symbol: str, date: str) -> float: ...


class TextGenerator(Protocol):
    """Implemented by a user-approved model provider or local generator."""

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
        max_tokens: int,
    ) -> str: ...
