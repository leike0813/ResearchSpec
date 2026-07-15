## Relative valuation research

Choose methods appropriate to the business and data: trading comparables, historical ranges, EV/revenue, EV/EBITDA, PE, PB, PS, FCF yield, or other justified multiples. Normalize numerator and denominator definitions, period, currency, lease treatment, non-recurring items, share count, net debt, and minority interests before comparison. Bridge enterprise value to equity value and per-share value transparently.

Use `resources/python/valuation_engine.py` for DCF, comparable-company, and weighted valuation outputs; `sensitivity_analyzer.py` for scenario matrices and confidence intervals; and `enhanced_text_generator.py` for valuation rationale, target price, and recommendation text. Use `resources/agent-specs/valuation_overview.json` for historical and peer reasonableness analysis. Source defaults remain available but must be visible and overrideable.

The output may state fair value or a target price, upside or downside, valuation range, margin of safety, rating, and whether the security appears overvalued or undervalued. Show sensitivities, method weights, scenario assumptions, and the fundamental conditions required for each conclusion.
