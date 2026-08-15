## 0. Extraction Source Freeze

- [x] 0.1 Generate a deterministic `docs/ars_extraction/extraction-index.json` (or equivalent
  converter-owned index) that records milestone, kind, extraction ID, source mapping, upstream
  SHA-256 and verification status for all 119 artifacts.
- [x] 0.2 Add a reproducibility test that verifies every indexed artifact byte-for-byte against the
  pinned `vendor/ars` snapshot and fails on any non-pass entry.
- [x] 0.3 Run the M1–M5 review generators and record the 119/119 pass baseline in the change.

## 1. Current Contracts

- [x] 1.1 Add workspace schema `"2"` contracts for config, stable specs, graph profile projection,
  run, node, handoff and project change; keep schema `"1"` files unsupported and byte-unchanged.
- [x] 1.2 Add TypeScript/Zod schema for capability manifest `"1"` and capability graph profile `"2"`
  with the invariants in the two new specs.
- [x] 1.3 Add capability registry resolution: unique IDs, node-kind compatibility, schema refs,
  knowledge refs, validator refs, provenance and license checks.
- [x] 1.4a Implement isolated schema `"2"` discovery (`inspectGraphWorkspaceFormat`) and read-only
  derived index (`loadGraphWorkspaceIndex`) for graph profiles, runs, nodes, handoffs and changes.
- [x] 1.4b1 Add the graph CLI handler layer (status, instructions, start, decide, advance, check,
  doctor) and schema `"2"` discovery (`resolveGraphWorkspace`) with isolated handler tests.
- [x] 1.4b2 Wire `main.ts` discovery and bootstrap to schema `"2"`; init creates a graph workspace,
  core commands (status/instructions/start/decide/advance/check/doctor) run through the graph CLI,
  and schema `"1"` workspaces are rejected as unsupported.
- [x] 1.4b3a Migrate the remaining CLI handlers (`list`, `show`, `handoff`, `pack`, `propose`,
  `archive`, `plugin`) to graph contracts with simplified plugin selection semantics.
- [x] 1.4b3b Move legacy schema `"1"` packaged user journeys out of the active test suite
  (`tests/*.legacy.ts`) and keep them as migration source; graph CLI/context journeys are the active
  packaged acceptance tests.
- [x] 1.5a Replace the active user-journey test surface with graph run/node contract tests; legacy
  subflow journey tests remain compiled but non-blocking in `tests/*.legacy.ts`.
- [x] 1.5b Delete legacy runtime modules and `.legacy.ts` fixtures after every runtime consumer is
  migrated.

## 2. Graph Engine

- [x] 2.1 Implement run creation with human-confirmed profile entry, frozen graph projection and
  profile identity/hash binding.
- [x] 2.2a Implement deterministic frontier evaluation for entry nodes, prerequisites, parallel
  groups, Gate/Decision blocking and deterministic ordering.
- [x] 2.2b Extend frontier evaluation with revision-round templates, mid-entry branch readiness,
  subgraph role binding and run completion derivation.
- [x] 2.2 Implement deterministic frontier evaluation: prerequisites, parallel groups, Gate/Decision
  blocking, revision rounds, mid-entry nodes, subgraph role binding and completion derivation.
- [x] 2.3 Implement per-node instance files and atomic node completion writes; reject illegal,
  stale or ambiguous submissions without state change.
- [x] 2.4 Implement Gate attempts, failed-Gate overrides and branch Decisions inside owning node/run
  files; keep confirmation and advance separate.
- [x] 2.5 Add validator runner with declared interpreter/args, stable diagnostics, fail-closed script
  behavior and `unresolvable`-never-pass network semantics.

## 3. CLI And Companions

- [x] 3.1 Extend the typed CLI catalog and handlers with `profile:`, `run:`, `node:`, `gate:` and
  `decision:` selectors while keeping exactly sixteen top-level commands.
- [x] 3.2 Implement `instructions node:<run>/<node>` bounded node cards and `--dry-run` validation for
  `advance node:`.
- [x] 3.3a Update command catalog and payload catalog descriptions to the run/node model.
- [x] 3.3b Regenerate and check the CLI handbook, docs site and packaged documentation against the
  updated catalog.
- [x] 3.4 Rewrite Companion guidance to read graph state and never reconstruct the frontier from Skill
  prose; Verify prepares Gate findings, Decide records only confirmed human choices.

## 4. Capability Authoring

- [x] 4.1 Build the authoring converter stage that consumes the extraction index and emits capability
  packages (`manifest.yaml`, thin `SKILL.md`, knowledge refs, validator refs, provenance) from
  `CAP-*`/`KP-*` artifacts.
- [x] 4.2 Implement package checks: no embedded flow authority, no prose-only mandatory rules,
  variant presets are data, license/provenance complete.
- [x] 4.3a Author the first M1 capability package (`cap.design.research-question-formulation`) from
  verified extraction artifacts with knowledge refs, provenance and idempotent registry output.
- [x] 4.3b Author the remaining M1 capabilities (methodology-design, literature-search-screening,
  source-quality-grading, evidence-synthesis, report-compilation).
- [x] 4.4 Author M2 writing and M3 integrity/review capability families with Q1/Q3/Q4 parameterized
  variants (packages generated from verified extraction artifacts; variant parameters remain presets).
- [x] 4.5a Author M4 revision/finalize and M5 optional side-branch package shells into the bundled
  registry; script capabilities are registered with `execution_type: script`.
- [x] 4.5b Bind the extracted M4/M5 Python assets as real script validator entries and invoke them from
  `submitGraphNode`; keep optional packages disabled by default until curated.

## 5. Preset Graphs

- [x] 5.1 Generate the M1 research preset graph (`research-main`) and a minimal report preset
  (`minimal`); validate schema, reachability and Gate/prerequisite binding.
- [x] 5.2 Generate academic-paper, reviewer and academic-pipeline preset graphs as subgraph
  compositions with formal integrity Gates and revision-round template.
- [x] 5.3 Add user/plugin graph extension validation and a no-code-change custom profile test.

## 6. Deprecation And Delivery

- [x] 6.1 Replace anchor-injected large ARSU Skills as runtime flow carriers after preset graphs and
  capability Skills pass acceptance; the graph CLI installs no ARSU prose Skills as flow carriers,
  and upstream text remains provenance/reference assets.
- [x] 6.2 Update delivery adapters, installation manifests and package files for capability packages
  and graph profiles; init/update project all authored capability Skills into selected Skill-capable
  Agent tools.
- [x] 6.3a Update AGENTS.md locked product direction to schema `"2"` run/node authority and regenerate
  the CLI handbook/docs from the updated command catalog.
- [x] 6.3b Update README, architecture docs and core runtime docs to the schema `"2"` graph model;
  canonical user-usage prose is covered by the regenerated CLI handbook.

## 7. Acceptance And Release Gate

- [x] 7.1 Add deterministic-path tests: identical workspace bytes produce byte-identical `status --json`
  frontier and node-card sequence.
- [x] 7.2 Add illegal-action tests: out-of-order node advance, skipped Gate, prose-only rule and
  schema-`"1"` mutation attempts all fail without changing workspace bytes.
- [x] 7.3 Run full typecheck, lint, build, tests, extraction verification, converter idempotence,
  docs checks, packaged CLI journeys and strict OpenSpec validation.
- [x] 7.4 Archive the change only after the new user-usage model is accepted on a fresh packaged CLI
  and no runtime path still reads ARSU prose as workflow authority.
