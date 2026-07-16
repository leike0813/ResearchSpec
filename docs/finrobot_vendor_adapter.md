# FinRobot Vendor Adapter

The FinRobot adapter is the maintainer-only deterministic converter for the
pinned `vendor/finrobot` submodule at `snapshot-297a8d2`, revision
`297a8d28d099be328c8a8eb658b4f782b93f3651`. FinRobot has no upstream
`SKILL.md`; its production package is derived from an immutable capability audit,
reviewed policy catalogs, and an approved authored tree set.

## Production decisions

The immutable audit covers all 146 tracked Git entries, 66 knowledge surfaces,
five content origins, six license claims, and six candidate capabilities.
Production policies retain every source decision as evidence and map the 32
admitted surfaces exactly once through `skill-definitions.ts`. No upstream
FinRobot file is copied into a published runtime tree.

The approved aggregate tree hash is
`eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e`.
Converter version 2 emits only those exact trees. The FinNLP gitlink,
AutoGen-attributed content, unclear filing and marker trees, provider helpers,
and hard FinRobot aggregate dependencies remain non-distributed evidence or
excluded inputs.

## Skill architecture

The six fixed `financial-research-*` Skills use the lowest sufficient thickness:

- company fundamentals, event evidence, relative valuation, and statement
  analysis are Tier 3 script-assisted Skills;
- competitive position and corporate risk are Tier 1 Agent procedures.

The four formal entrypoints use Python 3.11 standard-library modules only. Each
Tier 3 tree receives the same `lib/financial_support.py` bytes for JSON, number,
date, unit, hash, atomic-write, and command-error behavior. Domain formulas stay
in the corresponding entrypoint. The current reviewed trees contain no
`references/` directories because all supporting rules are short and required on
ordinary invocations.

Agent procedures own source quality, peer selection, business interpretation,
risk transmission, semantic scores, assumptions, conflicts, valuation choices,
and conclusions. Scripts own deterministic validation, normalization, ratios,
forecasts, DCF and multiples, sensitivity, explicit deduplication, ranking from
Agent-supplied assessments, hashing, and JSON rendering.

## Safety and external tools

ResearchSpec conversion, checking, idempotence, packaging, installation,
discovery, update, and registry assembly remain file-only. They do not import or
execute generated Python, install dependencies, initialize clients, read
credentials, or contact services.

When a user invokes a Skill, the target Agent may use user-authorized browser,
filing, market-data, or local-corpus tools under host policy. The distributed
trees contain no provider client, provider adapter, credential contract,
AgentSpec, dependency manifest, generic runner, or automatic network access.
Published bytes are checked for secret-like values, private keys, private
endpoints, local user paths, repository coupling, and undeclared Python imports.

## Generated package

Every tree contains a complete current-state `SKILL.md`, Apache-2.0 `LICENSE`,
source-bound `NOTICE`, and `DERIVATION.json`. Tier 3 trees additionally contain
one formal script and `lib/financial_support.py`. Each derivation record binds
the immutable audit, source path and hash, audited symbol, implementation kind,
and complete file closure.

The six Skills have empty hard dependency arrays and advisory-only
relationships. All six belong to `banking-finance-and-investment`; company
fundamentals and statement analysis also belong to
`accounting-auditing-and-accountability`.

## Maintainer commands

```bash
pnpm finrobot:convert
pnpm finrobot:check
pnpm finrobot:idempotence
```

Conversion stages all six published vendors, assembles the complete
source-neutral registry, and commits only the FinRobot tree, bundle, manifest,
report, and combined registry. Drift protection requires `--force` after review.
