## Financial statement analysis

Analyze the income statement, balance sheet, cash-flow statement, and segment disclosures over the requested historical and forecast periods. Reconcile related lines across statements, identify accounting-policy or presentation changes, normalize one-offs when justified, calculate growth, margins, returns, leverage, liquidity, cash conversion, and per-share measures, and investigate anomalies rather than smoothing them away.

Use `resources/python/financial_analyzer.py` to assemble source-bound prompts from market and filing providers. Use `financial_data_processor.py` for extraction, historical metrics, and forecast tables. The processor's forecast assumptions, including the PE annual factor, are explicit inputs and may be replaced with task-specific values. Use `provider_contracts.py` and `provider_adapters.py` only when external retrieval is authorized.

State whether each number is reported, adjusted, estimated, or calculated. Show reconciliation breaks and competing interpretations. The analysis may reach conclusions about earnings quality, liquidity, solvency, operating leverage, and financial trajectory; label the evidentiary and assumption basis for each conclusion.
