> **Enforcement boundary.** The compliance override ladder is evaluated by the
> compliance decision runtime over prior accepted override decisions for the
> same stage and run in `researchspec/runs/current/decision-ledger.jsonl`.
> Schema 12 remains the compliance-report payload and deliberately does not
> enforce cross-round rationale length. The runtime applies the first-, second-,
> and third-round friction rules, stops for human confirmation, and records the
> selected override, rationale, scope, report artifact id, and round count only
> after confirmation. The Schema 12 report itself is returned for registration
> in `researchspec/runs/current/artifact-registry.json`. Hand-written passport or
> ledger content that did not pass this decision path is unaudited and cannot
> authorize an override.
