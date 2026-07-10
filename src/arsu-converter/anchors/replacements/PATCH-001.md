1. **Prepare the base artifact.** Resolve the current manuscript id and hash
   through `researchspec/runs/current/artifact-registry.json`. The deterministic
   preparation helper assigns stable block markers where missing and emits a
   refreshed block-manifest artifact. Nothing may rewrite the manuscript between
   manifest creation and apply.
2. **Emit the patch.** The writer creates
   `researchspec/draft-patches/<patch-id>.json` with target artifact id/hash,
   block preconditions copied from the manifest, closed operations, and non-empty
   roadmap traceability. The writer does not re-emit the full manuscript, apply
   operations, or update runtime records.
3. **Apply deterministically.** The apply helper validates the entire patch
   fail-closed before writing. A stale hash or invalid operation leaves the base
   byte-identical. Success creates a new manuscript artifact and separate apply
   report containing changed/fresh block ids, structural flags, operations, and
   `preserved_ratio`; both are returned for runtime registration and are required
   re-review inputs.
4. **Escalate structural work, never silently fall back.** Heading rewrites,
   section-count changes, or touched ratio above the accepted threshold stop for
   a human choice. Return the choice to the decision runtime for
   `researchspec/runs/current/decision-ledger.jsonl`. Only confirmed full
   re-emission may regenerate the whole manuscript; mark it
   `mode: full_reemission_escalated`, create fresh block ids afterward, and
   invalidate patches tied to the prior hash.

Orchestrated and phase-by-phase runs use the same preparation and apply helpers.
Patch mode guarantees byte preservation only for untouched blocks; it does not
guarantee the quality of edited text. Finalizer and gate checks run on the new
registered artifact, and any failure is returned to the responsible helper
rather than written directly to a ledger.
