## Context

The archived read-only workflow-control change established typed work items, deterministic readiness, and `instructions work:<id>`, but explicitly reported `submit_available: false`. ARSU Skills can write the declared candidate path, yet no public command owns validation, receipt creation, registry mutation, idempotency, or plan-to-commit drift protection.

Submit must remain a mechanical runtime boundary. It may prove that a candidate passed a deterministic validation profile, but it cannot claim academic validity, append a Gate/Decision, change stable contracts, or advance the stage.

## Goals / Non-Goals

**Goals:**

- Atomically register a workflow-owned candidate and a submission receipt.
- Bind user confirmation and execution to one candidate SHA-256.
- Make exact retries idempotent and all divergent retries explicit conflicts.
- Require a trustworthy receipt before workflow completion.
- Give Agent tools one reusable Submit workflow instead of duplicating registry writes.

**Non-Goals:**

- Create or edit the candidate artifact.
- Perform academic semantic review.
- Append Gate or Decision events, update state, or transition stages.
- Support revision/supersession of an already submitted work item.
- Expand the Slice into the complete ARSU pipeline.

## Decisions

### Submit is a high-level workflow transaction

`submit work:<id>` derives path, type, stage, producer Skill, Schema ref, IDs, status, and verification state from the workflow and runtime. Callers provide only provenance, dependency artifact IDs, actor identity, and the expected candidate hash. An open-ended registry append command is intentionally not exposed.

### Dry-run binds execution to the candidate hash

Dry-run computes the candidate SHA-256 and complete write plan. Non-interactive execution requires the same hash and `--yes`; interactive execution binds the displayed hash in-process. Confirmation is operational authorization only and never becomes a research Decision.

### Deterministic verification is separate from academic judgment

`verification_state: verified` means the node's deterministic validation profile passed. The first profile checks safe regular-file containment, UTF-8, non-empty content, exact hash, resolvable template, and trusted dependency coverage. Academic quality remains a Gate concern; missing completion Gate IDs do not block registration but keep the node blocked afterward.

### Receipt-backed completion prevents forged registry state

Submit writes a candidate record, a receipt file, and a receipt registry record. Configured Slice nodes require a receipt whose file, registry hash, candidate reference, path, full candidate hash, workflow basis, and validation payload agree. Receipt records omit `work_item_id` so the evaluator cannot mistake them for node outputs.

### Receipt is committed before registry

The shared WritePlan gains optional read preconditions. Submit checks candidate, workflow, state, registry, relevant contracts/ledgers, and upstream artifacts before staging. Receipt is committed first and registry last. Normal failures roll back; a process interruption can leave only an unregistered orphan receipt, which is reused only when its entire payload and provenance match.

### Exact retry is success; revision is out of scope

The same work item, full hash, dependencies, actor, and producer mode returns `already_submitted` without rewriting timestamps or files. Any different hash or provenance, ID collision, corrupt receipt, or incomplete registered submission is a conflict. Future supersession requires its own change.

### Submit gets its own companion workflow

Preview, candidate-hash review, confirmation, execution, and post-check are too substantial to repeat in each ARSU Skill. A ninth `researchspec-submit` companion owns this operational flow; Next routes unregistered candidates to it, while converter-owned preflight tells ARSU producers to hand off rather than edit runtime records.

## Risks / Trade-offs

- **`verified` may be mistaken for semantic approval** → Artifact metadata and docs explicitly name the validation profile/validator and keep Gate requirements separate.
- **Registry JSON is refreshed rather than append-only** → It is committed last with read/write hash preconditions and full projected Schema validation.
- **Orphan receipts can survive process termination** → They are non-authoritative until registered and are recoverable only by strict payload equality.
- **Existing hand-written records lack receipts** → They remain readable, but receipt-required Slice nodes will not treat them as complete.
- **Generated ARSU output grows** → Only converter-owned shared preflight changes; regeneration and idempotence checks remain authoritative.

## Migration Plan

1. Add strict Submit-created DTOs without tightening every legacy registry record.
2. Add `require_receipt` to the experimental Slice completion policy only.
3. Add Submit runtime/CLI and additive instructions metadata.
4. Add the ninth companion and regenerate converter-owned ARSU artifacts.
5. Preserve the default legacy profile and all stable contracts.

Rollback removes Submit capability and companion; existing registered receipts remain ordinary readable artifacts and no state or ledger migration is required.

## Open Questions

None for this change. Stage transition, semantic verification persistence, and artifact supersession remain separate future changes.
