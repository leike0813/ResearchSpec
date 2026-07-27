## Context

The adaptive runtime already separates durable obligations from soft planning,
but the Agent-facing write path still exposes internal DTOs. Action descriptors
label fields as CLI-derived without actually deriving them, every write shares
two coarse booleans, and handlers require external preview replay even when the
current route already authorizes a mechanical action. Static Adapter inspection
and Doctor recovery also have gaps at the status and crash-consistency
boundaries.

## Goals / Non-Goals

**Goals:**

- Make every action descriptor's minimal template valid for its public action.
- Keep deterministic planning internal for low-risk writes and externalize plan
  binding only at formal human or repair boundaries.
- Preserve one authority source for action fields, execution policy, Adapter
  health and recovery evidence.
- Close black-box acceptance and repository validation.

**Non-Goals:**

- Add commands, Skills, wrappers, runtime authority files or dependencies.
- Change workspace-state schemas or migrate stored academic semantics.
- Weaken Gate, Decision, change/patch apply, Doctor or migration confirmation.
- Add live Zotero probes to ResearchSpec status.

## Decisions

### 1. Split public semantic input from the internal canonical DTO

Each input action owns a strict semantic Zod schema and a deterministic resolver
for CLI-derived fields. The action registry stores those two parts and composes
the existing internal canonical validator after resolution. Descriptors are
generated from the semantic schema; derived field names are generated from the
resolver's typed output schema rather than copied into string arrays.

Action descriptors and schema references move to version 2. Mechanical fields
in a caller payload are rejected as unknown fields. Adaptive and strict
workspaces use the same public semantic contract; only their internal resolver
differs.

Allowing caller fields when they happen to match was rejected because it keeps
two writers for one fact. Supporting both v1 and v2 payloads was rejected
because the project has not published a stable v1 API and dual parsing would
preserve the defect this change removes.

### 2. Replace booleans with one execution policy

The registry exposes `direct`, `human_confirmed` or `plan_bound`.

- `direct`: delegated child Start, automatic artifact Submit, adaptive
  attempt/evidence operations, pending proposal/patch creation and a unique
  non-semantic Advance.
- `human_confirmed`: external route Start and manual artifact acceptance.
- `plan_bound`: Gate Submit, Decisions, accepted patch/change apply, Doctor,
  runtime migration and existing privileged maintenance transactions.

Direct and human-confirmed actions support optional dry-run. One execution
invocation builds the deterministic plan internally and commits it under read
preconditions. Human-confirmed actions additionally require the existing named
confirmation evidence. Plan-bound actions continue to require a previewed plan
hash and explicit confirmation. An optional expected action-basis hash remains
available for direct callers; if present it is enforced.

Adding an `--auto` command or a second transaction family was rejected because
the selector and policy already determine the safe path.

### 3. Project compact Adapter health from the inspection SSOT

Default status receives one bounded summary derived from the existing static
literature-Adapter inspection: fixed adapter count, healthy count, compact
per-adapter installation/runtime/projection state, diagnostic counts and the
directed `check:literature-adapters` selector. It never embeds runtime assets,
manifests or live readiness.

### 4. Make an interrupted Doctor repair evidence-first

All writes are staged before commit. Commit order becomes original-byte backup,
repair receipt, repaired authority, then post-check. A crash before authority
therefore leaves an orphan receipt whose expected authority hash can be retried
or diagnosed. A crash after authority leaves both durable evidence and the
authority bytes.

### 5. Test contracts rather than prose

Registry tests verify schema composition and execution policy. Public CLI tests
round-trip minimal templates and exercise risk tiers. Journey traceability maps
the existing ARSU/Zotero requirements to explicit acceptance cases. No test
asserts complete messages or large JSON documents.

## Risks / Trade-offs

- [Existing callers send full internal payloads] → Reject them with structured
  v2 validation and regenerate all shipped instructions in the same change.
- [Direct execution observes stale state] → Re-evaluate availability and retain
  write-plan read preconditions; enforce an expected basis when supplied.
- [Status grows again] → Return only fixed compact Adapter state and direct
  detailed inspection to the existing check selector.
- [Receipt precedes authority] → Treat the receipt as retry evidence rather than
  proof of a completed post-check; include expected hashes and final disposition.

## Migration Plan

No stored workspace migration is required. Regenerate Agent instructions and
tests with action schema v2, then run adaptive and strict workspace journeys.
Rollback restores the previous code and generated instructions; runtime files
remain readable because no authority schema changes.

## Open Questions

None.
