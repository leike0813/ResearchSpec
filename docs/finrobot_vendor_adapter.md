# FinRobot Vendor Adapter

The FinRobot adapter is the maintainer-only deterministic converter for the
pinned `vendor/finrobot` submodule at `snapshot-297a8d2`, revision
`297a8d28d099be328c8a8eb658b4f782b93f3651`. FinRobot has no upstream
`SKILL.md`; its production package is derived from an immutable capability audit
and explicit source-to-output decisions.

## Production decisions

The audit covers all 146 tracked Git entries, 66 knowledge surfaces, five
content origins, six license claims, and six candidate capabilities. Production
catalogs resolve every record and bind the complete audit JSON SHA-256.

The twelve candidate files contain no hard FinRobot runtime dependency:

- four calculation modules are included as reviewed Python resources;
- the report analyzer and enhanced text generator are adapted to injected
  provider and text-generation contracts;
- six equity agents become provider-neutral AgentSpec JSON with their complete
  prompts and output schemas.

Four additional helper sources provide the minimal reviewed yfinance, FMP, SEC,
and shared-helper closure. The FinNLP gitlink, AutoGen-attributed content,
unclear filing/marker trees, and unrelated FinRobot runtime aggregates remain
excluded.

## Capability and form-safety boundary

The generated Skills retain financial-statement, fundamentals, corporate-risk,
competitive-position, relative-valuation, and event/catalyst capabilities.
Reviewed resources may calculate forecasts and sensitivities and may produce
probabilities, sentiment assessments, price impacts, targets, ratings,
recommendations, and analytical conclusions.

ResearchSpec conversion, checking, idempotence, packaging, installation,
discovery, and update remain file-only. They do not import or execute Python,
initialize provider clients, install dependencies, read credentials, or contact
services. When a target Agent invokes a Skill, providers, credentials, and
execution environments are user-configured. Published bytes are checked for
actual credential values, private keys, private endpoints, private datasets,
local user paths, unresolved origins, and FinRobot aggregate imports.

## Generated package

Each of the six `financial-research-*` Skills contains:

- Open Agent Skills frontmatter and capability-complete instructions;
- a complete Apache-2.0 `LICENSE` and attribution `NOTICE`;
- `DERIVATION.json` binding source Git objects, SHA-256 values, coupling, and
  production actions;
- `dependencies.json` with empty Skill dependencies and documented user-managed
  runtime requirements;
- the approved Python and AgentSpec resources required by that Skill.

The six Skills have no hard Skill dependency edges. Cross-Skill relationships
are advisory. All six belong to `banking-finance-and-investment`; statement
analysis and company fundamentals also belong to
`accounting-auditing-and-accountability`.

## Maintainer commands

```bash
pnpm finrobot:convert
pnpm finrobot:check
pnpm finrobot:idempotence
```

Conversion stages all five published vendors, assembles the complete
source-neutral registry, and commits only the FinRobot tree, bundle, manifest,
report, and combined registry. Drift protection requires `--force` after review.
