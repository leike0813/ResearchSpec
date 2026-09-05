### ResearchSpec Current Owner

Replacement scope: `PATCH-001` for `academic-paper`.

In `academic-paper` revision mode, the writer may emit a bounded revision patch
instead of rewriting the complete manuscript. The adapted ARSU contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the sole manuscript
patch schema. It preserves stable operation IDs, block IDs and `old_hash`
preconditions, replace/insert/delete operations, annotation dispositions,
revision rationale, and roadmap traceability.

The optional `authorization_context` defaults to review-roadmap semantics when
omitted. An explicit `integrity_correction` context is limited to the supplied
correction IDs in `roadmap_item_ids` and must leave `claim_strength_changes`
empty. Review-driven claim-strength changes carry the claim ID, an accepted
ResearchSpec `change_id`, the old and new stable claim strengths, a direction,
and a concrete rationale. Structural validation checks their shape only; the
Agent must inspect the accepted change and supporting evidence before applying
them. The local contract does not import upstream roadmap, passport, hash-chain,
or author-adjudication sidecars.

The selected manuscript may be Markdown or QMD. Treat QMD as
Markdown-compatible text and preserve its YAML frontmatter, fenced code,
cell-option comments, citations, cross-references, and Quarto metadata outside
the explicitly targeted anchored blocks. Never convert a `.qmd` path to `.md`
during revision.

The patch and manuscript are explicit files selected by the caller. They are not
handoff-referenced ResearchSpec runtime entities. When safe mechanical application is
useful, run `node scripts/apply-revision-patch.mjs` with explicit `--base`, `--patch`,
and `--output` paths and, optionally, `--report`. The helper validates the whole
patch before creating output. Schema errors, stale hashes, unknown blocks,
duplicate targets, injected block markers, or incomplete annotation mappings
leave the selected manuscript and destination unchanged.

Annotation intake normally stays under the owning revision run's
`work/annotation-intake/` directory. If an annotation set, patch, revised
manuscript, response, or report must cross a node boundary, write it to an
ordinary project path outside `researchspec/` and record its role and path in
that run's `handoff.md`.

Mechanical success does not settle academic adequacy. The revision Gate remains
human-confirmed in the owning run the owning node instance. Manual editing and
human-confirmed full re-emission remain valid revision paths; the helper is an
optional safety tool and never mutates control state.

This patch protocol does not apply to the `academic-paper full` in-pair Phase
6→4 loop when that loop's contract requires a complete `## Draft Body`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `work/annotation-intake/`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
