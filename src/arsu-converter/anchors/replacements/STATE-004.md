1. Ask the ResearchSpec checkpoint helper to snapshot the completed stage,
   proposed next stage, active mode, required artifact ids and hashes, and any
   pending decision in `researchspec/runs/current/state.yaml`. The helper owns
   the atomic state update; the orchestrator does not edit the file directly.
2. When `ARS_PASSPORT_RESET=1`, also emit an ARS-compatible `kind: boundary`
   payload as a compatibility artifact. Preserve the legacy canonical hash
   rules—RFC 8785 serialization, LF-separated boundary entries, a
   `"000000000000"` placeholder, and the first 12 lowercase SHA-256 hex
   characters—so external ARS readers can still verify the export. Register the
   passport path and content hash through
   `researchspec/runs/current/artifact-registry.json`; the export is not active
   ResearchSpec state.
3. If the checkpoint coincides with a mandatory user choice, preserve the
   complete `pending_decision` question and option routing in the compatibility
   payload, but stop for the human decision. After confirmation, return the
   selected value and rationale to the decision runtime for
   `researchspec/runs/current/decision-ledger.jsonl`. `next` remains advisory;
   the chosen option's `next_stage` and `next_mode` determine routing unless an
   explicit resume override is present.
4. Emit the compatibility tag and user instruction as a distinct block:

   ```text
   [PASSPORT-RESET: hash=<hash>, stage=<completed>, next=<next>]

   ### Resume Instruction
   - Passport file: <path>
   - To continue, start a fresh agent session and invoke:
     resume_from_passport=<hash>
   - ResearchSpec run state and registered artifacts remain authoritative.
   ```

5. Halt after a FULL checkpoint when the configured workflow requires a fresh
   session. Other modes may accept one in-session continuation, but the next
   stage still loads only current ResearchSpec state and registered artifacts;
   it must not reconstruct state from chat or use the passport as its sole input.

**Iron rules (reset boundary):**

1. With compatibility export disabled, no passport bytes or reset tags are
   emitted; normal ResearchSpec checkpoint behavior is unchanged.
2. ResearchSpec run state, artifact registration, human decisions, and gate
   outcomes remain separated across their runtime files and are written only by
   their responsible helpers.
3. A compatibility passport remains append-only. Existing boundary/resume
   entries are never deleted, reordered, or mutated.
4. The `[PASSPORT-RESET: ...]` tag is the machine-stable identifier for legacy
   import; the human instruction is explanatory only.
5. Hash mismatch is a hard import error.
6. Single consumption is enforced atomically by the ResearchSpec resume helper.
   A legacy `kind: resume` export may mirror the result but does not establish it.
7. Mandatory integrity and review checkpoints are never weakened. Pending
   decisions always re-prompt and confirmed option routing takes precedence over
   advisory defaults.
8. Collaboration-depth output remains advisory and is registered as an artifact;
   it never becomes a blocking state flag.
9. If a compatibility passport is also updated, the import/export helper must
   retain the legacy exclusive-lock guarantee for the complete read-check-append
   sequence. A platform unable to provide that lock must refuse the compatibility
   write, while leaving ResearchSpec state uncorrupted.
