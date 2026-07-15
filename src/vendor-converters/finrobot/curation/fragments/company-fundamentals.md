## Company fundamentals research

Build a decision-useful view of the company: business model, products and services, revenue streams, customer and geographic concentration, leadership and strategy, industry setting, historical operating record, capital intensity, unit economics, growth drivers, and constraints. Identify causal links between operational drivers and financial results, then construct base, upside, and downside forecasts when requested.

Use `resources/agent-specs/company_overview.json` for the foundational company profile and `major_takeaways.json` for strategic implications. Use `resources/python/financial_analyzer.py`, `financial_data_processor.py`, and `enhanced_text_generator.py` for filing-grounded prompts, forecasts, executive synthesis, and investment implications. Provider and text generation implementations are injected through `provider_contracts.py`; optional examples live in `provider_adapters.py`.

The output may include forecasts, an investment thesis, key takeaways, rating rationale, and scenario implications. Distinguish sourced facts from forecast inputs and analyst judgment, expose material defaults, and show what would falsify the thesis.
