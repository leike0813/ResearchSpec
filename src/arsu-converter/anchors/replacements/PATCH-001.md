### ResearchSpec Current Owner

Replacement scope: `PATCH-001` for `academic-paper`.

In `academic-paper` revision mode, the writer may emit a bounded revision patch
instead of rewriting the complete manuscript. The adapted ARSU contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the sole manuscript
patch schema. It preserves stable operation IDs, block IDs and `old_hash`
preconditions, replace/insert/delete operations, annotation dispositions,
revision rationale, and roadmap traceability.

The patch and manuscript are explicit files selected by the caller. They are not
handoff-referenced ResearchSpec runtime entities. When safe mechanical application is
useful, run `node scripts/apply-revision-patch.mjs` with explicit `--base`, `--patch`,
and `--output` paths and, optionally, `--report`. The helper validates the whole
patch before creating output. Schema errors, stale hashes, unknown blocks,
duplicate targets, injected block markers, or incomplete annotation mappings
leave the selected manuscript and destination unchanged.

Annotation intake normally stays under the owning revision subflow's
`work/annotation-intake/` directory. If an annotation set, patch, revised
manuscript, response, or report must cross a subflow boundary, write it to an
ordinary project path outside `researchspec/` and record its role and path in
that subflow's `handoff.md`.

Mechanical success does not settle academic adequacy. The revision Gate remains
human-confirmed in the owning subflow `control.yaml`. Manual editing and
human-confirmed full re-emission remain valid revision paths; the helper is an
optional safety tool and never mutates control state.

This patch protocol does not apply to the `academic-paper full` in-pair Phase
6→4 loop when that loop's contract requires a complete `## Draft Body`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/work/annotation-intake/`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
