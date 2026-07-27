## Why

ResearchSpec currently exposes a rigid fine-grained workflow frontier, unbounded
runtime projections, implicit run completion, and fragmented recovery and
proposed/current paths. The fixed Zotero Adapter is also statically delivered
but cannot become a discoverable, executable provider throughout literature
research. These failures share one boundary problem: internal process state,
Agent planning, durable research commitments, and provider operations are not
separated by one coherent runtime contract.

## What Changes

- Replace the default fine-grained DAG scheduler with obligation-based adaptive
  case control while retaining the existing strict process engine as an
  explicit profile.
- Separate hard obligations, accepted evidence, formal Gates, Decisions,
  completion and receipts from converter-owned soft playbooks, Agent-selected
  plans, attempts and working material.
- Add one shared action-availability contract for Status, instructions and all
  writing commands, bounded Agent-facing status, schema-derived action
  descriptors, directed detail reads and compact transaction responses.
- Give subflow and run completion distinct explicit effects so completing a
  standalone subflow never terminalizes its enclosing run.
- **BREAKING**: add `doctor` as the seventeenth public top-level command and
  define tolerant diagnosis plus plan-bound deterministic repair without
  semantic reconstruction.
- Reconnect canonical draft patches and contract changes to the runtime as
  discoverable case actions, using the existing `submit`, `decide`, `advance`
  and `propose` commands rather than a new patch command.
- Preserve existing Schema `0.2` workspaces as strict-compatible without
  automatic rewrite; make adaptive profiles the default only for new
  workspaces after the migration and acceptance gate.
- Upgrade the fixed Zotero Adapter from two projected Skills to the reviewed
  seven-Skill router/task/mechanism closure and make literature research
  Adapter-native when the user-authorized provider is ready.
- **BREAKING**: change the fixed Agent Skill surface from ten to fifteen Skills
  and the public CLI registry from sixteen to seventeen commands; retain eight
  ResearchSpec command wrappers for command-capable tools.
- Preserve all seven upstream `runner.json` and seven `output.schema.json`
  files byte-for-byte as audited runtime metadata without executing or
  interpreting them in ResearchSpec.

## Capabilities

### New Capabilities

- `case-obligation-control-plane`: Hard obligations, adaptive and strict
  evaluation, scoped attempts and evidence, case actions, action availability,
  and explicit completion effects.
- `runtime-recovery`: Tolerant runtime observation, recovery findings,
  deterministic repair planning and receipt-bound repair.

### Modified Capabilities

- `framework-core`: Separate internal authority from Agent projections, define
  adaptive defaults and strict Schema `0.2` compatibility, and require explicit
  migration and run completion.
- `cli-interface`: Add Doctor, bounded and directed reads, action descriptors,
  compact transactions, stable validation errors and patch/change selectors.
- `arsu-run-usage`: Replace the unique-frontier protocol with bounded action
  summaries and adaptive work inside confirmed hard commitments.
- `subflow-instance-control-plane`: Separate subflow/run completion and scope
  attempts and local recovery to their owning case obligations.
- `gate-transition-control-plane`: Preserve formal Gate/Decision authority
  while limiting graph transitions to strict profiles and distinguishing
  completion effects.
- `artifact-submit`: Separate working candidates from accepted evidence and
  make draft patch submission canonical.
- `contract-change-proposal`: Represent pending contract changes as case
  actions and scoped blockers with explicit revalidation and apply states.
- `arsu-workflow-profiles`: Express obligations, justified hard edges, formal
  policies, completion and converter-owned playbooks while retaining strict
  graphs as an explicit mode.
- `companion-skills`: Make Navigate source-policy and Adapter aware and make
  Propose, Decide and Verify consume runtime descriptors and case actions.
- `arsu-converter`: Generate bounded adaptive preflight, canonical revision
  patches, and Adapter-native Deep Research provider coordination.
- `literature-system-adapters`: Replace the primary/helper catalog with a
  role-aware seven-Skill catalog and define static delivery, live readiness,
  provider handoff, source policy and bounded managed-library authorization.
- `zotero-literature-adapter-conversion`: Admit the updated seven-Skill release
  and its runner/schema assets through immutable offline conversion.
- `agent-surface-model`: Define fifteen fixed Skills with differentiated
  router, task and mechanism discovery.
- `agent-tool-delivery`: Project fifteen Skills while retaining eight command
  wrappers and static owner-aware delivery.
- `skill-browser-harness`: Verify role- and visibility-aware browsing of the
  fifteen-Skill fixed surface.
- `mvp-release-readiness`: Package and verify the updated runtime protocol,
  Doctor command and complete seven-Skill Adapter release.
- `arsu-user-routing`: Distinguish ARSU research, direct Zotero-bound tasks,
  nested providers, source policies and managed-library consent.
- `arsu-user-model-acceptance`: Validate adaptive, strict, recovery,
  proposed/current and Adapter-native journeys against the seventeen-command,
  fifteen-Skill surface.

## Impact

The implementation will affect runtime DTOs and schemas, workflow/profile
evaluation, command dispatch and JSON contracts, state and receipt
transactions, generated ARSU and Companion Skills, the Zotero converter and
catalog, Agent projection, package verification, canonical usage documentation
and user-journey tests. It will add an explicit legacy migration path but no
automatic workspace rewrite, runtime LLM dependency, adapter execution in
static commands, implicit Zotero curation, generic runner protocol, extra
command wrapper or Adapter-owned workflow authority.
