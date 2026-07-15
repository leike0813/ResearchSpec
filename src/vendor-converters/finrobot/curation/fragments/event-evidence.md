## Financial event and catalyst analysis

Collect recent or expected events with title, event date, publication date, issuer or publisher, source location, and evidence tier. Deduplicate reports of the same event. Distinguish confirmed facts, management guidance, third-party claims, market interpretation, and analyst inference. Classify events by type and sentiment, then assess timing, probability, magnitude, affected financial or valuation channel, price impact, and monitoring trigger.

Use `resources/python/catalyst_analyzer.py` for event classification, sentiment, probability, impact, prioritization, and summaries. Use `enhanced_text_generator.py` for catalyst and risk narrative. Use `resources/agent-specs/news_summary.json` for news categorization, sentiment shifts, stock-performance implications, and an actionable summary.

Probability scores, sentiment judgments, price-impact estimates, forecasts, and recommendations are allowed. Treat embedded heuristic probabilities as model assumptions, disclose when they are used, and replace or calibrate them when task evidence supports a different value. Include confirming and disconfirming evidence and state what would change the assessment.
