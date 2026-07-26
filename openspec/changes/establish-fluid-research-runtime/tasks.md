## 0. M0 — Product, Migration, And Interface Freeze

- [x] 0.1 Replace the development guide's linear recommendation with the
  M0–M7 and Z1–Z3 dependency roadmap and milestone exit criteria.
- [x] 0.2 Create the coordination proposal, design and delta specs that freeze
  adaptive/strict authority, completion, bounded protocol, Doctor,
  proposed/current, seven-Skill delivery and Adapter-native behavior.
- [x] 0.3 Validate the complete change as apply-ready, confirm that no prior
  active change existed, and verify that M0 changed no runtime implementation,
  main spec or generated Skill tree.

## 1. M1 — Case And Recovery Contracts

- [x] 1.1 Define the versioned CaseState, hard-obligation, dependency,
  completion-effect, attempt, working/accepted-evidence and case-action
  DTO/schema SSOTs with explicit authority ownership.
- [x] 1.2 Define `ActionAvailability`, `ActionDescriptor`,
  `CaseStatusSummary`, Doctor finding/plan/receipt and common read-precondition
  contracts without duplicating validator field definitions.
- [x] 1.3 Add adaptive and strict profile DTOs plus the read-only Schema `0.2`
  strict compatibility projector; prohibit automatic migration and dual
  runtime authority.
- [x] 1.4 Add representative characterization tests for current Schema `0.2`
  graph, join, Gate, transition, dynamic revision and receipt behavior before
  changing evaluators.

## 2. Z1 — Immutable Seven-Skill Zotero Audit

- [x] 2.1 Inventory the complete upstream commit
  `cec8fcddd8a3ef134bf6bdd80fcb2324c15707de`, release
  `host-bridge/hbrs-f9f28ddce98be3008e13bbdb`, source tree, identities,
  licenses, provenance, dependencies and platform runtime assets.
- [x] 2.2 Record admission decisions for the router, five task Skills and CLI
  mechanism, including role, visibility, capability, authority and hard
  dependency metadata.
- [x] 2.3 Record exact hashes for all seven `runner.json` and seven
  `output.schema.json` assets and classify them as opaque runtime metadata.
- [x] 2.4 Implement an offline, read-only audit checker and verify source,
  release, license, dependency, runtime and runtime-metadata drift failures.

## 3. Z2 — Static Conversion And Fifteen-Skill Delivery

- [x] 3.1 Replace primary/helper Adapter catalog fields with the typed
  `skills[]` SSOT and update static inspection without adding live probes.
- [x] 3.2 Update the Zotero converter to generate the exact reviewed
  seven-Skill tree, runtime assets, runner/schema metadata, provenance,
  licenses and derivations; prove byte-identical idempotence.
- [x] 3.3 Update owner-aware delivery and projection for 31 tools × 15 fixed
  Skills while retaining exactly eight wrappers for the 28 command-capable
  tools and preserving drifted user files.
- [x] 3.4 Update the Skill browser, package verifier and static status/check
  tests for role-aware discovery, complete asset hashes and the no-execution
  boundary.

## 4. M2 — Explicit Completion Vertical Slice

- [x] 4.1 Add typed `complete_subflow` and `complete_run` effects and remove all
  implicit run-terminal inference from instance cardinality.
- [x] 4.2 Make Start and Status consume the shared action-availability
  evaluator for startability and terminal blocking.
- [x] 4.3 Update standalone and strict final transitions to emit only their
  declared completion effects through receipt-backed advancement.
- [x] 4.4 Add black-box journeys proving that a completed standalone subflow
  permits another start and only explicit run completion makes the run
  terminal.

## 5. M3 — Bounded Read And Minimal Write Protocol

- [x] 5.1 Replace default Agent status with bounded `CaseStatusSummary` and add
  selector-bound or paginated workflow, history, artifact, case-action and
  diagnostic reads through existing commands.
- [x] 5.2 Generate action descriptors and minimal input templates from each
  write command's validator schema, availability basis and CLI-derived
  mechanical fields.
- [x] 5.3 Reduce successful write responses to receipt/plan identity, effects
  summary and next selectors; return stable validation codes, field paths,
  expectations and schema references.
- [x] 5.4 Add long-run, multi-round, stale-descriptor, paging and cross-surface
  consistency tests without asserting complete prose or field order.

## 6. M4 — Doctor

- [ ] 6.1 Implement tolerant raw-file observation and the fixed healthy,
  retryable, deterministic, human-reconstruction and conflicting-evidence
  finding taxonomy.
- [ ] 6.2 Build retry recommendations and deterministic repair plans with
  target/read hashes, operations, backups, postconditions and `plan_sha256`.
- [ ] 6.3 Implement repair execution with plan confirmation, read
  preconditions, original-byte preservation, dependent writes first,
  receipt-last authority commit and post-check.
- [ ] 6.4 Register the seventeenth public `doctor` command and add invalid YAML,
  schema-invalid state, orphan receipt, changed precondition and conflicting
  evidence black-box tests.

## 7. M5 — Adaptive Case Runtime

- [ ] 7.1 Persist hard obligations, accepted evidence, formal Gate/Decision
  references, pending case actions, completion and receipts in CaseState while
  keeping playbooks, ephemeral plans and working material outside authority.
- [ ] 7.2 Implement adaptive availability, scoped attempts, retry, replacement,
  pause, waive and not-applicable behavior with hard-dependency propagation
  only where declared.
- [ ] 7.3 Update converter-owned profiles to emit obligations, justified hard
  edges, formal policies, completion and soft playbooks; expose explicit strict
  profile selection without weakening its graph interpreter.
- [ ] 7.4 Add adaptive reorder/parallel/rework and local-failure acceptance
  journeys plus strict-process regression coverage.

## 8. M6 — Proposed/Current Case Actions

- [ ] 8.1 Make `submit patch:<selector>` create the sole canonical pending
  patch with base identity/hash, patch body, semantic delta, evidence and
  producer scope; remove duplicate ordinary `revision_patch` submission.
- [ ] 8.2 Implement `decide patch:<id>` accept/reject/postpone and
  `advance patch:<id>` controlled apply, revised artifact, apply report,
  receipt, idempotence and base-drift handling.
- [ ] 8.3 Represent contract proposals as case actions and scoped blockers,
  connect `propose`/`decide change:<id>` to revalidation/current application,
  and link high-impact patch deltas to required changes.
- [ ] 8.4 Add patch acceptance, rejection, postponement, stale base, accepted
  apply, contract drift and unrelated-obligation continuation journeys.

## 9. Z3 — Adapter-Native Runtime

- [ ] 9.1 Update Navigate to distinguish ARSU research from direct Zotero tasks
  and present contextual source-policy/readiness guidance separately from
  route, plugin and managed-library confirmations.
- [ ] 9.2 Implement just-in-time Adapter readiness invocation and the
  provider-neutral retrieval handoff without persisting live connection state
  or Adapter-specific output as ResearchSpec authority.
- [ ] 9.3 Update Deep Research bibliography coordination to call Query,
  gap-aware Acquisition and evidence-goal-driven Analysis/Synthesis task Skills
  directly while retaining ARSU screening, verification, coverage and artifact
  ownership.
- [ ] 9.4 Implement run- and collection-bound managed-library authorization,
  candidate-only fallback, expiry/revocation and the hard separation from
  Curation.
- [ ] 9.5 Add ordinary gap-fill, systematic multi-source, external-first,
  private/library-bound pause, managed import and Adapter failure journeys.

## 10. M7 — Convergence, Migration, And Default Switch

- [ ] 10.1 Regenerate and verify all ARSU, Companion and workflow-profile
  outputs so generated guidance consumes the bounded adaptive protocol,
  canonical patches and Adapter-native provider contracts.
- [ ] 10.2 Implement `update --migrate-runtime` dry-run, plan hash,
  non-interactive binding, backup, receipt, rollback and failure preservation
  for legacy Schema `0.2` workspaces.
- [ ] 10.3 Update the canonical user usage model, CLI and contract
  documentation, README, project AGENTS, release process and capability
  traceability from the implemented SSOTs.
- [ ] 10.4 Run targeted and full tests, type checks, lint, build, all converter
  checks/idempotence, package verification, strict OpenSpec validation and the
  full user-journey matrix.
- [ ] 10.5 Switch new workspace initialization to adaptive only after every
  runtime, recovery, migration, proposed/current, Adapter, package and
  acceptance gate passes; retain strict as an explicit supported profile.
