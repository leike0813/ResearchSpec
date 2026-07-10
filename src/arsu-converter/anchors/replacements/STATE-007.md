ResearchSpec owns active reset and resume state. A legacy Material Passport
`reset_boundary[]` ledger may be imported or exported as compatibility evidence,
but it is never the current run ledger.

- At a checkpoint, the runtime records stage, mode, required artifact ids,
  pending decisions, and resume status in
  `researchspec/runs/current/state.yaml`.
- Compatibility export may append a `kind: boundary` entry using the legacy
  canonical hash and version fields. The exported passport is registered with
  its path and content hash in
  `researchspec/runs/current/artifact-registry.json`.
- Re-running a stage creates new versioned artifacts and a new checkpoint; prior
  artifacts and compatibility entries remain immutable.
- A resume import may mirror successful consumption as a legacy `kind: resume`
  entry, but single consumption is decided atomically by the ResearchSpec resume
  helper rather than inferred from the passport alone.

### Computing awaiting-resume state

The runtime considers a checkpoint awaiting resume when current run state marks
it resumable and no later atomic state transition has consumed it. For imported
passports, the helper checks the matching boundary and any legacy consuming
entry as evidence, then reconciles that evidence with current ResearchSpec
state. A disagreement is stale or conflicting evidence and must be submitted to
the resume gate instead of guessed away.

### Concurrency model

ResearchSpec state consumption is an atomic helper operation over the expected
run and checkpoint identity. Two callers cannot both consume the same checkpoint;
the second receives a hard already-consumed error.

When the same operation also appends to a compatibility passport, retain the
legacy exclusive advisory lock across the complete read, no-prior-consumption
check, append, and durable flush. Use a bounded timeout no greater than 60
seconds and surface lock timeout as a hard compatibility error. POSIX and
Windows implementations must use an OS-level exclusion mechanism; if none is
available, refuse the passport update rather than silently degrade. Failure to
update the compatibility copy must not produce a partial ResearchSpec state
transition—prepare and validate both sides before committing, then report any
post-commit mirror failure as a blocking gate finding.

### Iron rules

1. Compatibility export disabled means no passport mutation.
2. Stable ResearchSpec state changes are atomic and helper-owned.
3. Compatibility ledgers remain append-only.
4. The reset tag identifies imported/exported evidence, not active state.
5. Hash mismatch blocks import.
6. Mandatory checkpoints remain mandatory across reset.
7. Boundary hash calculation retains the legacy placeholder and serialization
   rules when a compatibility payload is produced.
8. Pending decisions always re-prompt; confirmed option routing or explicit
   overrides—not an advisory `next` value—select the next stage. Return the
   choice to the decision runtime for
   `researchspec/runs/current/decision-ledger.jsonl`.
9. Verification, stale evidence, lock failures, and double-consumption attempts
   are submitted to the resume gate for
   `researchspec/runs/current/gate-ledger.jsonl`.
