# Design

## Context

See proposal.md for the motivation. Navigate renders both Skill and command entry surfaces. ARSU preflight and authored capability procedures are separate generated surfaces; workers receive isolated packets and cannot interview the user. Existing review-workspace APIs already support annotation-intake, empty Agent-item lists and published shared HTML.

## Goals / Non-Goals

Make preparation explicit across entry paths and carry confirmed choices into production. Preserve lightweight ordinary work, advisory material inspection, existing citation evidence markers and current workflow authority. No new command, schema, dependency, formal Gate, browser feature or persistent preparation flag is needed.

## Decisions

1. Keep the coordinating Agent responsible for material inspection, discussion, delivery choices, gap research and direction alignment. Discovery and provisional outlines may proceed first. Reuse confirmed context and simplify minor edits. Retain preferences and limits in existing task notes.
2. Reuse one manuscript-preparation instruction fragment between Navigate and ARSU preflight. Leaf procedures consume the confirmed requirements or report a missing dependent choice. Keep writing_configuration optional; use existing material_bindings or graph inputs for delegation, otherwise execute inline. This avoids a new machine gate pretending to evaluate research adequacy.
3. Remove silent Markdown/APA fallback and unconditional APA delivery wording in authored procedures. Working source and final output are distinct choices. Preserve ref/anchor provenance markers and their validation, changing only presentation rules that conflict with confirmed requirements.
4. Extend the existing review hint mapping for academic-paper, generation-manuscript-drafting, transform-revision-roadmap-parsing and transform-revision-patching to annotation-intake. Resolve the already published root review-workspace/index.html rather than duplicating assets. Preserve humanizer package paths and revision-master stage precedence.
5. Offer review before preparation; reuse an applicable task choice. Use annotationCandidateReviewWorkspaceV2 for actual candidates or assembleReviewWorkspace with no items for plain annotation. Validation and accepted-feedback processing stay with the original task.
6. Add a separate dogfood suite without changing natural-18. First-turn cases must accept a focused question as success. Browser choice, rejection and continuation are real multi-turn manual acceptance steps; never concatenate future answers into the initial prompt or claim static tests prove model behavior.

## Risks / Trade-offs

- Host behavior varies: validate observable conversations and keep unrun host acceptance explicit.
- Generated instructions can contradict one another: review the changed entry, preflight and leaf bodies together and regenerate from sources.
- Existing protocol distinctions matter: test adapter, paths and versioned contracts, without prose-string assertions or new UI logic.

## Migration Plan

Deliver through normal init/update projections with existing ownership protection. Update canonical user documentation and AGENTS.md with this OpenSpec change. Regenerate affected ARSU and owned-vendor packages, review semantic differences and refresh current maintenance records and anchors; do not modify vendor sources or archive this change automatically.
