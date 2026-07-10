--> Treats `resume_from_passport=<hash>` as a compatibility import request. It
loads the legacy Material Passport, locates the matching `kind: boundary`
payload, and submits that payload plus the passport content hash to the
ResearchSpec resume helper. The helper checks
`researchspec/runs/current/state.yaml` for prior consumption and resolves
recovered outputs through
`researchspec/runs/current/artifact-registry.json`. If the imported boundary
contains `pending_decision`, the user must still choose a branch before routing;
the confirmed choice is returned to the decision runtime for
`researchspec/runs/current/decision-ledger.jsonl`. Explicit `stage=` and `mode=`
overrides retain precedence over option routing.
- **Gate (compatibility emission):** `ARS_PASSPORT_RESET=1` controls only whether
  an ARS-compatible `[PASSPORT-RESET: ...]` export is produced. ResearchSpec
  checkpoint state remains owned by the runtime regardless of that flag.
- **Gate (resume):** no flag is required. Resume proceeds only after the helper
  verifies the imported boundary, current artifact hashes, unresolved gates in
  `researchspec/runs/current/gate-ledger.jsonl`, and single-consumption state.
- **Intent:** use a fresh agent session when context reduction is desired. The
  runtime files, not chat recall or the imported passport alone, reconstruct the
  run.
- **Stage:** any stage allowed by the configured workflow and verified routing
  decision.
- **Reference:** `references/passport_as_reset_boundary.md` defines the legacy
  payload and import rules.
