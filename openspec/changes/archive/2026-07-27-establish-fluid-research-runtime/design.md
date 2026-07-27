## Context

ResearchSpec currently exposes the strict ARSU process graph as the universal
runtime model. The complete workflow snapshot leaks through Agent-facing JSON,
write payloads repeat mechanical state, subflow completion can be confused with
run completion, and damaged authority often prevents the same runtime from
diagnosing itself. Revision work also has two competing representations:
ordinary `revision_patch` artifacts and the intended `draft-patches/`
proposed/current lifecycle.

The fixed Zotero Adapter has a related integration break. ResearchSpec delivers
two static Skills and reports only unchecked connection state, while the updated
upstream bundle supplies seven task-oriented Skills and automation metadata.
Generated Deep Research guidance recommends Zotero but has no live-readiness,
provider-result or managed-library contract that makes the recommendation
reliably executable.

The existing file and receipt model remains valuable. This design narrows what
the CLI owns, keeps strict process guarantees where explicitly requested, and
adds adaptive planning without adding runtime LLMs or Adapter-owned workflow
authority.

## Goals / Non-Goals

**Goals:**

- Make hard research commitments and durable evidence authoritative while
  allowing Agents to adapt their work order between those commitments.
- Give every read and write surface one availability result and a bounded,
  discoverable Agent protocol.
- Make subflow completion, run completion, recovery, draft patch application
  and contract-change application explicit and receipt-backed.
- Preserve existing Schema `0.2` workspaces through a strict compatibility
  projection and provide a deliberate migration path.
- Deliver and discover the reviewed seven-Skill Zotero closure, then make ready
  task providers the normal path through literature research.
- Preserve the upstream runner and output schemas as static runtime metadata
  without adopting their execution protocol.

**Non-Goals:**

- Removing the strict ARSU pipeline or weakening formal Gates and Decisions.
- Mirroring every ARSU phase, temporary output or Agent plan in CaseState.
- Adding a runtime LLM, database, network probe to static commands, Adapter
  subflow, Adapter wrapper or generic runner protocol.
- Automatically rewriting existing runtime state or maintaining strict and
  adaptive authority in parallel.
- Inferring missing academic facts during recovery.
- Importing literature without bounded consent or performing implicit Curation.

## Decisions

### 1. Separate durable case authority from soft planning

`CaseState` owns only:

- profile mode and run lifecycle;
- hard obligations and justified dependencies;
- accepted evidence and artifact references;
- formal Gate and Decision references;
- pending patch/change and other case actions;
- explicit completion effects and receipt identities.

`SoftPlaybook` is converter-owned guidance. An Agent may derive an ephemeral
plan from the playbook and current availability, but that plan is not an
authority file. `AttemptRecord` is a scoped trace of producer, method, inputs,
outputs, diagnostics and disposition. Working material remains outside accepted
evidence until a durable submit validates it.

This keeps stable commitments auditable without turning every tactical choice
into a state transition. Extending the current DAG with more optional, retry and
dynamic nodes was rejected because it preserves the same scheduling coupling
and increases the number of blocking states.

### 2. Use one ActionAvailability evaluator

Core exposes one pure evaluator consumed by Status, instructions and all write
preflight. Its public result is:

```text
ActionAvailability
  selector
  disposition: recommended | allowed | blocked
  reason_code
  obligation_scope[]
  blocking_refs[]
  basis_sha256
  expires_when[]
```

`recommended` is executable but preferred; `allowed` is executable without
being the default suggestion; `blocked` is not executable. The evaluator uses
accepted authority facts only. Converter playbook ranking may choose among
already allowed actions but cannot unblock one.

An `ActionDescriptor` is generated from this result and the command's actual
validator schema. It adds CLI-derived mechanical values, human/Agent semantic
slots, constraints, a minimal input template, dry-run/execute requirements and
possible next selectors. There is no independently maintained field list.

Duplicating a read-side recommender and write-side validator was rejected
because that is the source of current frontier contradictions.

### 3. Keep adaptive and strict profile interpreters behind one contract

Profiles carry `mode: adaptive | strict`.

- Adaptive profiles declare obligations, true hard dependencies, formal
  policies, completion criteria and a converter-owned default playbook.
- Strict profiles retain the existing graph, parallel/join, Gate, transition
  and dynamic revision-round interpreter in addition to the shared obligation
  view.

New workspaces default to adaptive. `researchspec init --profile strict`
selects strict explicitly. Existing valid Schema `0.2` workspaces are projected
as strict regardless of the new default and are not rewritten by normal init,
update, status or check.

A single interpreter with implicit compatibility branches was rejected because
it would make legacy and adaptive semantics difficult to audit and eventually
remove.

### 4. Make completion an explicit effect

The common effect vocabulary contains `complete_subflow` and `complete_run`.

- `complete_subflow` terminates only its selected instance.
- `complete_run` is the only effect that writes terminal run lifecycle.
- A standalone final action may emit only `complete_subflow`.
- A strict end-to-end pipeline's declared final transition may emit both
  effects after all completion policies and formal Gates pass.
- No evaluator infers terminal run state from an empty active-instance set.

The existing `advance` transaction applies declared completion effects; no
eighteenth `finish` command is added.

Inferring completion from root-instance cardinality was rejected because the
set of already-created instances cannot express whether the user intends to
start more standalone work.

### 5. Bound the read/write protocol

Default `status` returns `CaseStatusSummary`:

- workspace and run identity/lifecycle;
- active, idle and recently relevant instance summaries;
- unsatisfied hard obligations and blockers;
- recommended and other allowed actions;
- pending Gate, Decision, patch and change IDs/counts;
- workflow/profile path and hash;
- diagnostic class counts and directed next selectors.

Collections embedded in this DTO have fixed small limits. Complete workflow
data, histories, artifacts and diagnostics use selector-bound, paginated
`list`, `show` or `instructions` views.

Start, Submit, Advance, Decide and repair responses contain receipt/plan
identity, an effects summary and next selectors. They do not return a complete
post-write snapshot. Validation errors expose stable `code`, `field_path`,
`expectation` and `schema_ref` fields; prose is diagnostic rather than a
contract.

Truncating the existing snapshot was rejected because it would retain an
internal DTO as the public contract and make omitted data ambiguous.

### 6. Add Doctor as a separate recovery transaction

The seventeenth command is `doctor`.

```text
researchspec doctor [--json]
researchspec doctor --repair <finding-id> --dry-run
researchspec doctor --repair <finding-id> --yes \
  --expected-plan-sha256 <sha256>
```

Doctor uses a tolerant raw-file observer rather than the normal Snapshot loader
and returns exactly:

- `healthy`;
- `retry_existing_transaction`;
- `deterministically_repairable`;
- `requires_human_reconstruction`;
- `conflicting_evidence`.

Original idempotent transaction retry has priority. Repair is available only
when receipts, ledgers, schemas and hashes determine one result. A repair plan
binds read hashes, operations, backups, postconditions and `plan_sha256`.
Execution rechecks preconditions, stores original damaged bytes in the
workspace recovery area, writes dependent facts first, commits authority and
receipt last, then runs the relevant checks.

Putting repair flags under `check` was rejected because it would give a
normally read-only command hidden write semantics. General YAML editing and
semantic reconstruction are excluded.

### 7. Use one canonical patch and contract-change lifecycle

Draft text changes use:

```text
submit patch:<selector>
decide patch:<id>
advance patch:<id>
```

A pending patch binds base artifact identity/hash, patch body, semantic delta,
evidence, producer and scope. Decide records accept, reject or postpone.
Advance applies only an accepted, non-stale patch and creates the revised
artifact, apply report and receipt atomically. Base drift makes the patch stale.
The same revision is never also registered as an ordinary `revision_patch`
artifact.

`propose` creates a contract-change case action. `decide change:<id>` records
human disposition and existing revalidation/application rules update current
contracts. A high-impact semantic delta links or creates a change and blocks
only obligations that rely on the old contract.

Combining draft patches and contract changes into one entity was rejected:
they share case-action discovery but modify different sources of truth.

### 8. Migrate legacy runtime explicitly

The only runtime migration entry is:

```text
researchspec update --migrate-runtime --dry-run
researchspec update --migrate-runtime --yes \
  --expected-plan-sha256 <sha256>
```

The plan reports compatibility findings, projected obligations, retained
strict policies, target files and hashes. Execution records a migration receipt
and commits the new authority last. Failure before that commit preserves the
old strict workspace. Rollback restores the pre-migration files captured by the
plan and records a rollback receipt; it never attempts a mixed-mode merge.

Automatic migration during update was rejected because user runtime state
contains accepted research authority, not merely generated configuration.

### 9. Replace primary/helper with a role-aware Adapter catalog

`LiteratureAdapterDefinition.skills[]` is the only membership SSOT. Each entry
declares identity, `router | task | mechanism` role, visibility, capabilities,
authority boundary and hard Skill dependencies.

- `zotero-library-agent`: broad/cross-task router.
- `zotero-library-query`: current-library read and search task.
- `zotero-literature-acquisition`: discovery, duplicate-aware acquisition and
  permitted import task.
- `zotero-literature-analysis`: bounded attachment/evidence analysis task.
- `zotero-research-synthesis`: bounded Topic/Graph/corpus synthesis task.
- `zotero-library-curation`: separately authorized maintenance task.
- `zotero-bridge-cli`: exact operation, diagnosis and recovery mechanism.

All 31 tools receive four ARSU, four Companion and seven Adapter Skills. The 28
command-capable tools still receive only the eight ResearchSpec wrappers.

Flattening all seven Skills as equivalent entrypoints was rejected because it
would make routing noisier and expose mechanism details as product intents.

### 10. Separate Adapter delivery, readiness and operation evidence

Static ResearchSpec commands may inspect only admitted release, runtime, Skill,
asset, hash, ownership and projection facts. They never run a binary or runner,
probe Host Bridge, contact Zotero or read credentials.

After the user confirms a provider-bearing route, the selected Adapter Skill
performs just-in-time profile, bridge, authentication and capability checks.
That live result is invocation-scoped. An operation result becomes producer
working evidence through:

```text
ProviderRetrievalHandoff
  provider / skill / release
  operation / query / filter
  collection / selection / search scope
  retrieved_at / paging completeness
  Zotero refs / external provenance
  evidence depth / duplicate and readiness diagnostics
  upstream result path / sha256
  coverage limits
```

ResearchSpec references rather than copies the Adapter-specific output
contract. The ARSU producer remains responsible for screening, deduplication,
verification, coverage, claims and formal artifacts.

Persisting live connection state in normal Status was rejected because
readiness can expire and static commands must remain offline.

### 11. Make provider policy Adapter-native, not Adapter-only

Source policy has four modes:

- `adapter-native`: query the library first; use Acquisition and bounded
  external supplementation for evidenced gaps; use Analysis/Synthesis when
  their evidence goals are present.
- `protocol-multi-source`: follow the systematic-review protocol; Adapter
  provides seed, deduplication, full text and supplemental coverage.
- `external-first`: use current authoritative web or external sources first or
  in parallel; Adapter supplies academic context.
- `library-bound`: use the requested private selection/collection or offline
  library only; pause when the Adapter is unavailable.

These modes determine provider priority, not a mandatory sequence of all task
Skills. Bibliography coordination remains in Deep Research.

Adapter-only as the ordinary default was rejected because a personal library
may be incomplete or stale. Web-first as the universal default was rejected
because it bypasses the more reliable managed library backend.

### 12. Keep managed-library writes narrow

`ManagedLibraryAuthorization` binds:

- run and route identity;
- one target collection;
- screened accepted item identities;
- permitted Acquisition effects;
- grant time, expiry and revocation state.

Without a current authorization, Acquisition is candidate-only. The grant may
permit importing accepted items and preparing permitted attachments. It never
permits library-wide metadata, tag, note, collection, merge, delete or other
Curation actions.

Treating route confirmation as write consent was rejected because source
selection and external-state mutation are distinct user decisions.

### 13. Preserve runner/schema assets as opaque bytes

The immutable Zotero audit admits all seven `runner.json` and seven
`output.schema.json` files. Conversion, projection, packaging and update
preserve and hash them byte-for-byte. ResearchSpec never executes a runner,
interprets `__SKILL_DONE__`, adopts its output envelope, or maps its schema
directly to CaseState or action descriptors.

Deleting these assets was rejected because supported Agent hosts may use them.
Normalizing them into a generic ResearchSpec runner was rejected because it
would create an unused second runtime protocol.

## Risks / Trade-offs

- **[Change spans runtime, generation and Adapter delivery]** → Keep one
  coordination change but implement independent M and Z milestone lanes with
  explicit convergence gates.
- **[Adaptive mode weakens reproducibility if hard edges are underspecified]**
  → Require every hard obligation and dependency to carry a policy
  justification; retain strict mode for high-assurance work.
- **[Legacy behavior drifts during refactoring]** → Add Schema `0.2`
  characterization tests before moving evaluators and prohibit automatic
  migration.
- **[Bounded status hides needed detail]** → Every omitted collection exposes a
  stable directed or paginated selector; Status and detail reads share facts.
- **[Doctor repair could become an authority bypass]** → Limit repair to unique
  deterministic facts, preserve bytes, require plan hash and receipt, and
  escalate all semantic ambiguity.
- **[Adapter use creates provider lock-in]** → Keep handoff and source policy
  provider-neutral and retain gap-driven external supplementation.
- **[Managed-library consent expands accidentally]** → Bind it to run,
  collection, accepted items and named Acquisition effects; keep Curation
  separate.
- **[Upstream runner metadata is mistaken for executable authority]** → Enforce
  static byte handling in catalog, converter, delivery and release tests.

## Migration Plan

1. Complete M1 contracts and strict Schema `0.2` characterization before
   changing runtime behavior.
2. Implement M2 explicit completion and shared availability as the first
   vertical slice.
3. Introduce bounded protocol and Doctor, then implement adaptive obligations
   and proposed/current case actions.
4. In parallel, complete the immutable seven-Skill audit and static delivery
   closure.
5. Enable Adapter-native routing only after bounded descriptors, adaptive
   attempts and the fifteen-Skill projection are all available.
6. Regenerate ARSU, Companion and profile outputs, run full acceptance, then
   make adaptive the new-workspace default.
7. Leave all existing Schema `0.2` workspaces strict until their users execute
   the explicit plan-bound migration.

If a milestone fails before authority commit, retain the previous behavior and
artifacts. M7 may switch the default only after runtime, migration, converter,
idempotence, package, OpenSpec and user-journey gates all pass.

## Open Questions

None. M0 freezes the product, interface, migration and milestone decisions
needed to begin implementation.
