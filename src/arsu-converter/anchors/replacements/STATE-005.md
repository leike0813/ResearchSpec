**Trigger:** user input starts with or contains `resume_from_passport=<12-hex>`.

**Compatibility contract:** the referenced ARS Material Passport boundary is
import evidence only. Active resume state is owned by
`researchspec/runs/current/state.yaml`; imported files and recovered outputs are
resolved through `researchspec/runs/current/artifact-registry.json`; human branch
choices are recorded through the decision runtime in
`researchspec/runs/current/decision-ledger.jsonl`; verification and blocking
conditions are recorded by the resume gate in
`researchspec/runs/current/gate-ledger.jsonl`.

**Orchestrator obligations:**

1. Parse `<hash>` from user input and validate `^[0-9a-f]{12}$`.
2. Locate the compatibility passport: prefer an explicit path in user input;
   otherwise look in `./passports/` or `./material_passport*.yaml` relative to
   the current working directory; if none is found, ask the user for the path.
3. Read `reset_boundary[]` without modifying the passport. Find the
   `kind: boundary` entry whose `hash` matches. No match is a hard error:
   `Passport hash <hash> not found in <path>. Cannot resume.`
4. Submit the passport path, its content hash, and the matched boundary payload
   to the ResearchSpec resume helper. The helper owns the exclusive run-state
   update lock and MUST atomically check whether this imported boundary has
   already been consumed in the current run. A prior consumption is a hard
   error and MUST identify when the boundary was resumed. Do not implement this
   check by appending a `resume` entry to the passport.
5. Resolve every recovered output by artifact id and recorded hash through
   `researchspec/runs/current/artifact-registry.json`. A missing, changed, or
   unregistered required artifact makes the resume stale and blocks automatic
   advancement until the resume gate records a verified result.
6. Emit the acknowledgement in this form:

   ```text
   ### Resume Acknowledged
   - Hash: <hash>
   - Source session: <session_marker> (generated <generated_at>)
   - Recovered stage: <stage>
   - Next stage: <next> [override: stage=<user-stage>, mode=<user-mode>]
   ```

   Include the bracketed override only when the user supplied `stage=` or
   `mode=`. When the imported boundary has `pending_decision`, print
   `(pending user decision)` as `<next>` until step 8 resolves it.
7. Honor the imported `verification_status` as evidence, not as a current gate
   result. For `STALE` or `UNVERIFIED`, warn the user and ask whether to
   re-verify. For `VERIFIED`, the resume gate may reuse it only after current
   artifact hashes and required gate receipts have been checked.
8. If `pending_decision` exists, stop and display its question and option
   values. After the user selects a value, resolve `next_stage` and `next_mode`
   from the matching option. Explicit `stage=` or `mode=` resume overrides take
   precedence. Return the confirmed choice and rationale to the ResearchSpec
   decision runtime before advancing; do not write the decision ledger directly.
9. Ask the resume helper to atomically register the imported passport as a
   compatibility artifact, mark the boundary consumed in run state, record any
   human-confirmed branch, and submit verification findings to the resume gate.
   The helper, decision runtime, and gate validator own their respective stable
   files; the orchestrator MUST NOT edit those files or the source passport.
10. Invoke the resolved next stage with the current ResearchSpec state and the
    registered artifact ids required by that stage. The passport is not the
    sole runtime input. Do not ask the user to re-summarize prior stages.
