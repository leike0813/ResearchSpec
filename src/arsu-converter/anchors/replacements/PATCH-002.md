### ResearchSpec Current Owner

Replacement scope: `PATCH-002` for `academic-paper`.

In revision mode, emit a patch against the exact manuscript bytes supplied by
the caller. Validate the document against
`assets/shared/contracts/patch/revision_patch.schema.json` and use stable
`operation_id` values, block IDs, twelve-character `old_hash` preconditions,
the closed `replace_block`/`insert_after`/`delete_block` vocabulary, a revision
rationale, and non-empty roadmap traceability.

Omit `authorization_context` for ordinary local review patches; that is the
review-roadmap default. Use `integrity_correction` only for a supplied
correction proposal, citing its IDs through `roadmap_item_ids` and carrying no
claim-strength changes. A review claim-strength declaration must name the
accepted ResearchSpec `change_id`, both stable strengths, the direction, and a
rationale. The schema and helper validate this structure, while the Agent
checks that the referenced change is actually accepted and that the manuscript
evidence supports the move.

When annotations are in scope, each implemented annotation must be referenced
by an operation and represented in `annotation_mapping`. Non-edit dispositions
carry the answer, reason, or successor required by the schema and must not be
attached to an operation. The patch is the only machine-readable mapping; a
prose revision log may explain it but cannot replace it.

You emit the patch; you do not silently apply it or mutate ResearchSpec control.
The caller may review it, edit the manuscript manually, or invoke
`node scripts/apply-revision-patch.mjs` with explicit paths. A failed preflight
produces no output. After revision, expose only the boundary files needed by
another node through the owning `handoff.md`. Formal adequacy remains a
human-confirmed Gate in the owning node state.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
