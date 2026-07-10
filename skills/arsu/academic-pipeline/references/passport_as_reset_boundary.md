# Passport as Reset Boundary (v3.6.3)

## Purpose

Defines how `pipeline_orchestrator_agent` converts FULL checkpoints into reset boundaries when `ARS_PASSPORT_RESET=1` is set. This is the authoritative protocol; any divergent behavior in agent prompts is a bug.

## When this protocol applies

| Flag state | Mode | Behavior at FULL checkpoint |
|------------|------|-----------------------------|
| `ARS_PASSPORT_RESET` unset / `=0` | any | Continuation (pre-v3.6.3 default). No reset tag emitted. |
| `ARS_PASSPORT_RESET=1` | `systematic-review` | **Mandatory reset** at every FULL checkpoint. |
| `ARS_PASSPORT_RESET=1` | any other mode | **Strong-default reset** at every FULL checkpoint. User `continue` response overrides back to continuation for the next stage only. |

MANDATORY checkpoints (integrity Stage 2.5 / 4.5, review decisions, Stage 5 finalization) are orthogonal: reset can co-occur with MANDATORY. SLIM checkpoints never trigger reset.

## The reset boundary protocol

When the orchestrator reaches a FULL checkpoint with the flag ON:

1. **Freeze state.** `state_tracker` stages the current stage's deliverables and prepares a new `kind: boundary` ledger entry — but does NOT yet write `hash` (append happens in Step 2 after hash is known).
2. **Compute hash.** Canonical byte serialization is normative; two implementations must produce the same bytes from the same ledger:
   - Each entry is serialized as **JSON Canonical Form (RFC 8785 / JCS)**: UTF-8, no insignificant whitespace, keys sorted ASCII-ascending at every object level, numbers in JCS canonical form.
   - Entries are separated by a single `\x0a` (LF) byte. The first entry has no leading separator; the last entry has a trailing LF.
   - The new entry is serialized with `hash` set to the canonical placeholder `"000000000000"` and all other fields populated; concatenated AFTER every prior entry (each already carrying its own finalized `hash`).
   - SHA-256 the byte stream. Take the lowercase hex digest. Take the first 12 characters. That IS the new entry's `hash`. Overwrite the placeholder before appending to the ledger.
   - **Iron rule (see §Iron rules 2 + 7):** never hash an entry that already contains a non-placeholder `hash` for itself; never reorder prior entries; never include `kind: resume` entries in a boundary hash computation.
3. **Emit reset tag.** In the checkpoint notification block, append a machine-stable line:
   ```
   [PASSPORT-RESET: hash=<hash>, stage=<completed>, next=<next>]
   ```
4. **Emit human instruction.** In the same checkpoint notification, include a `### Resume Instruction` subsection with:
   - Passport file path (absolute or repo-relative)
   - The exact resume command the user pastes into a fresh session:
     ```
     resume_from_passport=<hash>
     ```
   - A one-line note that the next stage should be invoked in a fresh Claude Code session to realize the token-savings intent.
5. **Halt after emission.** The orchestrator stops after emitting the reset boundary and awaits resume in a fresh session.
6. **In-session override (non-SR modes).** If the user pastes `continue` in the same session, the orchestrator acknowledges but treats the passport as the only input to the next stage. Working-memory content from prior turns is non-authoritative and must not be replayed.
7. **Systematic-review hard stop.** In `systematic-review` mode, in-session continuation is refused outright. The orchestrator repeats the Resume Instruction and asks the user to start a fresh session.
8. **Pending MANDATORY decision.** If the reset co-occurs with a MANDATORY checkpoint that requires a user decision with multiple valid branches (e.g., Stage 3 review outcome: `revise` / `restructure` / `abort`; Stage 5 finalization format choice), the orchestrator sets `pending_decision` on the ledger entry. Each option is an object with required fields `value` (branch identifier) and `next_stage` (stage to route to, or `null` to terminate), plus optional `next_mode` for downstream mode override. On resume, the orchestrator looks up the user's chosen `value` in `options[]` and uses that entry's `next_stage`/`next_mode` to determine actual routing. The boundary entry's `next` field is populated as a best-guess default only; it is advisory and is superseded by the matched option's `next_stage` at resume time. `next` must NOT be used to auto-advance when `pending_decision` is present. `next` MAY be `null` when all branches of `pending_decision` terminate or when no sensible default exists.

## `resume_from_passport` mode contract

Invocation shape (prompt-layer, user-pasted or auto-dispatched in a new session):

```
resume_from_passport=<hash> [stage=<stage_number_or_name>] [mode=<downstream_mode>]
```

Required:
- `resume_from_passport=<hash>` — must match the 12-hex `hash` from a `[PASSPORT-RESET: ...]` tag emitted in a prior session. Orchestrator verifies the hash against the passport ledger on disk; mismatch is a hard error.

Optional:
- `stage=<stage_number_or_name>` — override the `next=` recorded in the reset tag. Useful when the user wants to re-run a stage rather than proceed. If omitted, the orchestrator uses `next=` from the reset tag.
- `mode=<downstream_mode>` — override the mode of the next stage (e.g., swap `full` for `quick`). Orchestrator validates the override against Mode Advisor rules.

Orchestrator obligations on resume:
- Locate the target `kind: boundary` entry by matching `hash`. Hard error if no match, or if a later `kind: resume` entry already carries `consumes_hash == <hash>` (double-resume is forbidden).
- Do NOT ask the user to re-summarize prior stages; the passport is authoritative. Load artifacts by reference (paths or IDs recorded in the entry).
- Honor the `verification_status` field. If `STALE` or `UNVERIFIED`, display a warning and prompt the user to re-verify before continuing. If `VERIFIED`, proceed without prompting.
- If `pending_decision` is set on the ledger entry, re-prompt the user for that decision BEFORE invoking any downstream stage. Display `pending_decision.question` and each option's `value`. After the user picks, look up the matching entry in `options[]` by `value`, then use that entry's `next_stage` and `next_mode` to determine actual routing. Record the chosen `value` as `chosen_branch` on the new `resume` entry. `next` on the boundary entry is advisory and is superseded by the matched option's `next_stage`. A user-supplied `stage=<n>` override on the resume command does NOT satisfy `pending_decision` — the decision prompt always fires when `pending_decision` is present. CLI `stage=`/`mode=` overrides still win over option routing if the user supplies them after the decision prompt.
- Emit a `### Resume Acknowledged` section at the start of the new session with: hash, source session `session_marker` + `generated_at`, recovered stage, and next-stage plan.
- Append a new `kind: resume` entry to `reset_boundary[]` with `consumes_hash = <hash>`, fresh `generated_at` and `session_marker`, and (if applicable) `chosen_branch` + `user_override`. This is how resume leaves an append-only trace and lets downstream readers compute `awaiting_resume` from the ledger alone.

## Append-only ledger semantics

<!--rs:a:2001afa86b8b-->
### ResearchSpec Resume Protocol

Reset and resume semantics are preserved, but their runtime state is split across ResearchSpec state, decisions, gates, and artifacts.

#### Compatibility Import

- Emit any imported ARS Material Passport reset payload as compatibility evidence for runtime registration.
- Project its active stage and pending branch information into `researchspec/runs/current/state.yaml`.

#### Runtime Ownership

- Use `researchspec/runs/current/decision-ledger.jsonl` for branch selection.
- Use `researchspec/runs/current/gate-ledger.jsonl` for stale, unverified, or blocked recovery state.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:2001afa86b8b-->

## Interaction with existing features

- **Collaboration Depth Observer (v3.5.0):** fires on FULL/SLIM as before. Observer output is included in the checkpoint notification regardless of reset state. Observer state does NOT carry across resets; each fresh session observes only its own stage.
- **Compliance agent (v3.4.0):** `compliance_history[]` remains append-only and is consumed from the passport on resume. No change to Schema 12.
- **Sprint contract (v3.6.2):** reviewer sprint contracts load from the passport on resume (Phase 1 paper-content-blind stage remains valid across the reset boundary because the contract + paper metadata are carried in the passport).
- **Socratic reading probe (v3.5.1):** reading probe fires at most once per session. Across a reset boundary, the probe counter resets — the next session may fire its own probe. This is by design: each session is its own Socratic unit.
- **Audit artifact ledger (v3.6.7):** Schema 9's `audit_artifact[]` ledger ([`shared/handoff_schemas.md`](shared/handoff_schemas.md) "Audit Artifact Ledger") is also append-only and survives reset by the same mechanism as `reset_boundary[]` and `compliance_history[]` — the passport carries it intact across the session break. On `resume_from_passport`, the orchestrator does NOT replay prior audit runs; it re-verifies on demand at each gate transition. Per `docs/design/2026-04-30-ars-v3.6.7-step-6-orchestrator-hooks-spec.md` §5.6, the orchestrator first runs Path A — selecting the latest `audit_artifact[]` entry matching the current gate's `(stage, agent, deliverable_sha)` tuple by `verified_at` — after the §5.6 A1.5 superseding-proposal preflight against `<output-dir>` (which preempts the selected entry if a higher-`verdict.round` proposal exists, e.g., from a between-session `another_round` wrapper run). Path A then re-runs the §5.2 verification sequence against the selected entry: L2-1 / L3-1 file-existence + schema preconditions over `artifact_paths.{jsonl,sidecar}`, followed by the eleven Layer 2 + Layer 3 gating checks (L2-2 / L2-3 / L2-4 / L2-5 + L3-2 through L3-8) over the JSONL stream, sidecar metadata, and the current on-disk deliverable + bundle files. After the §5.2 sequence passes, §5.6 Path A step A5 separately validates the verdict file against `audit_verdict.schema.json` and reconciles its mirror in the persisted entry (the verdict file is NOT inside the eleven §5.2 gates — it is A5's responsibility). The selected entry falls through to Path B (fresh proposal merge) on any §5.2 precondition / gate failure or A5 verdict-validation failure: e.g., a missing or schema-invalid jsonl/sidecar (L2-1 / L2-2 / L3-1), the JSONL `thread.started` `thread_id` drifting from the sidecar's `stream.jsonl_thread_id` (L3-2), the on-disk deliverable's SHA-256 drifting from the entry's `deliverable_sha` (L3-3, the canonical "deliverable mutated since audit" trigger), the bundle manifest hash recomputed over current primary + supporting + template files drifting from `bundle_manifest_sha` (L3-4), or the verdict file failing its schema/mirror check at A5. Stale or non-selected historical entries remain in the ledger as audit history and do NOT block unrelated future transitions; only the gate currently being audited must reach a fresh PASS / MINOR / MATERIAL verdict. This closes the post-reset attack surface where a forged passport carries `verified_at` / `verified_by` timestamps but no recoverable evidence behind them.

## What this protocol does NOT do

- Does not define Zotero / Obsidian / folder-scan adapter shapes (defined in [`adapters/overview.md`](adapters/overview.md) from v3.6.4+).
- Does not define `literature_corpus` entry shape (defined in [`../assets/shared/contracts/passport/literature_corpus_entry.schema.json`](../assets/shared/contracts/passport/literature_corpus_entry.schema.json) from v3.6.4+).
- Does not add runtime CLI tooling. Passport resolution is the user's responsibility — the orchestrator loads from the path the user provides.
- Does not claim specific token savings numbers. Empirical measurement goes in `docs/PERFORMANCE.md` only after real runs.

## Related references

- [`shared/handoff_schemas.md`](shared/handoff_schemas.md) — Schema 9 definition
- [`../agents/pipeline_orchestrator_agent.md`](../agents/pipeline_orchestrator_agent.md) — orchestrator integration
- [`pipeline_state_machine.md`](pipeline_state_machine.md) — state transitions
- `docs/PERFORMANCE.md` — long-running session guidance
