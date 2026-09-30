# FinRobot Vendor Adapter

The FinRobot adapter is the maintainer-only deterministic converter for the
pinned `vendor/finrobot` submodule at `snapshot-2717499`, revision
`2717499b8e30f242640af08c4ad9afd1113c2d45`. FinRobot has no first-party
upstream `SKILL.md`; its production package is derived from an immutable
capability audit, reviewed policy catalogs, and an approved authored tree set.

## Production decisions

The immutable audit covers all 1,049 tracked Git entries, 129 knowledge
surfaces, eight content origins, seven license claims, and six candidate
capabilities. Production policies retain every source decision as evidence and
map the 39 admitted surfaces exactly once through `skill-definitions.ts`. No
upstream FinRobot file is copied into a published runtime tree.

The approved aggregate tree hash is
`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`.
Converter version 2 emits only those exact trees. The FinNLP gitlink,
AutoGen-attributed content, 56 third-party Skill copies with four fixtures,
unredistributable datasets, unclear filing and marker trees, provider helpers,
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

## Extension mode packages

The six reviewed raw Skills are also projected one-to-one into the graph-native
extension registry under `skills/plugins/extensions/`:

| raw Skill | extension capability | execution |
| --- | --- | --- |
| `financial-research-company-fundamentals` | `plugin-financial-company-fundamentals` | mixed |
| `financial-research-competitive-position` | `plugin-financial-competitive-position` | llm |
| `financial-research-corporate-risk` | `plugin-financial-corporate-risk` | llm |
| `financial-research-event-evidence` | `plugin-financial-event-evidence` | mixed |
| `financial-research-relative-valuation` | `plugin-financial-relative-valuation` | mixed |
| `financial-research-statement-analysis` | `plugin-financial-statement-analysis` | mixed |

Mixed packages copy the reviewed formal entrypoint and `lib/financial_support.py`
byte-for-byte into `tools/` as hash-bound knowledge refs. Each mixed package
declares `validators/validate_financial_brief.py` with its own evidence-bearing
`--required` field list; llm packages use the engine-enforced output-role policy.
Every package has a same-named one-node graph profile.

`accounting-auditing-and-accountability` projects company-fundamentals and
statement-analysis extensions; `banking-finance-and-investment` projects all six.
Install, update, status, and check read manifests and hashes only. Only
`advance` executes the declared `python3` validator.

## Maintenance suite

```bash
pnpm finrobot-maintenance:artifacts
pnpm finrobot-maintenance:records
pnpm finrobot-maintenance:baseline
pnpm finrobot-maintenance:check
```

The suite anchors at `audits/finrobot/snapshot-2717499`, binds the immutable
audit, the vendor bundle, the extension registry subset, package/profile trees,
the maintenance Skill, the maintenance catalog, and records 01–05 in
`manifest.json`. The Agent semantic review is mandatory and `baseline` refuses
an anchor whose `05-semantic-review.md` is not completed.

## Candidate preview

Build and compose an isolated candidate from a file-only extraction of a pinned
source tree:

```bash
pnpm build
node dist/src/vendor-converters/finrobot/cli.js preview \
  --anchor audits/finrobot/<anchor> \
  --source-root /path/to/verified-snapshot
node dist/src/vendor-converters/finrobot/cli.js preview \
  --anchor audits/finrobot/<anchor> \
  --source-root /path/to/verified-snapshot --check
```

`preview` validates every inventoried file's length, Git blob ID and SHA-256,
composes the six complete candidate trees, projects six isolated extension
packages and unchanged profiles, and records all bytes in
`artifacts/candidate/review.json`. `--check` is read-only and verifies exact
closure and reproducibility. A preview requires a `pending-human-review`
candidate policy and leaves the production pin, catalogs, packages, registries
and workflow state unchanged until the exact displayed tree-set hash is
approved. Candidate authored inputs are frozen under `candidate-authoring/`,
and `artifacts/source-evidence/` holds only audit evidence used for offline
candidate tests, never part of a distributed Skill.
