## Why

ResearchSpec `0.1.0` wraps ARSU with file contracts, but the four generated ARSU Skills still carry
the upstream internal execution flow: phases, agent teams, checkpoints, mode routing and next-step
instructions remain prose inside `skills/arsu/*/SKILL.md`. The host Agent therefore acts as a third
planner between ARSU prose and the ResearchSpec control plane. Observed execution paths vary between
sessions, and contract compliance is unstable even when the same task is repeated.

The fix is not stronger prompt injection. Flow authority must move out of ARSU prose into a
ResearchSpec-owned execution graph, and ARSU must become composable atomic capabilities.

## What Changes

- **BREAKING**: Introduce workspace schema `"2"`. Replace the subflow-based runtime with run/node
  graph instances. Schema `"1"` and unknown layouts are unsupported and remain byte-unchanged.
- **BREAKING**: Remove the three route/subflow workflow authority specs (`arsu-workflow-profiles`,
  `subflow-instance-control-plane`, `gate-transition-control-plane`) and absorb their guarantees
  into the new capability graph engine.
- Add **capability manifest schema `"1"`**: every absorbed research skill becomes an atomic package
  with typed input/output roles, deterministic validators, immutable knowledge packs, provenance and
  licensing, and no embedded next-step authority.
- Add **capability graph profile schema `"2"`**: declarative presets compose capability nodes with
  prerequisites, parallel/join groups, formal Gates, branch Decisions, revision rounds and subgraphs.
- Keep the sixteen public CLI commands and extend the existing selector/command surface with `run:`
  and `node:` lifecycle actions; `instructions` emits one bounded node card and `advance` validates a
  node submission before any state write.
- Reuse `docs/ars_extraction/` as the curated authoring input. All 119 extraction artifacts currently
  pass byte-for-byte SHA-256 verification against `vendor/ars`.
- Turn Companion guidance into thin, engine-reading helpers. Generated capability Skills may execute
  exactly one node and then return control to ResearchSpec.

## Capabilities

### New Capabilities

- `capability-manifest`: Versioned atomic capability packages with typed roles, validators, knowledge
  packs, variants-as-data and provenance/licensing.
- `capability-graph-engine`: ResearchSpec-owned execution graphs, frozen runs, node lifecycle,
  deterministic frontier, Gate/Decision authority and preset graph composition.

### Modified Capabilities

- `framework-core`: Current workspace schema `"2"` with stable specs, graph profiles, run/node
  instance files, handoffs and project changes.
- `cli-interface`: Run/node selectors and bounded node cards on the existing sixteen-command surface.
- `arsu-run-usage`: Capability-node producer protocol replaces route/subflow prose flow.
- `arsu-converter`: Authoring converter consumes verified extraction artifacts and emits capability
  packages plus preset graph profiles.
- `companion-skills`: Companions read graph state and never reconstruct the frontier from prose.

### Removed Capabilities

- `arsu-workflow-profiles`: Preset graphs move to `capability-graph-engine`.
- `subflow-instance-control-plane`: Run/node instance authority moves to `capability-graph-engine`.
- `gate-transition-control-plane`: Gate, Decision and transition authority moves to
  `capability-graph-engine`.

## Impact

This is a cross-cutting hard cut. It changes workspace discovery and validation, CLI payloads and
selectors, ARSU conversion output, generated Skills, Companion guidance, installation manifests,
docs and tests. Existing schema `"1"` workspaces are rejected without migration. Boundary deliverables
remain ordinary files outside `researchspec/`, and the CLI gains no runtime LLM, database or external
service dependency.
