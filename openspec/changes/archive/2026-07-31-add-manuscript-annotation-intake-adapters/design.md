## Context

The archived manuscript-annotation core change deliberately accepted only
normalized JSON candidates. Its authority path is sound: a candidate at a
fixed instructions-returned path is validated against a registered Markdown
draft, frozen, receipted, registered, mapped through Draft Patch v3, and checked
again at revision-completeness. The missing layer is user-facing intake.

Human review material is not reliably parseable by a fixed Markdown grammar.
Users mix prose, markup, rewrites, lists, comments, and conversation. The Host
Agent already owns semantic interpretation, while deterministic code should
preserve bytes, expose differences, validate references, and protect authority.

## Goals / Non-Goals

**Goals:**

- Generate optional review-copy affordances without making them syntax.
- Preserve raw review material and mechanical differences by hash.
- Give the Host Agent complete, stable context for interpretation.
- Validate that Agent output cites real sources and exact manuscript targets.
- Publish a reusable TypeScript intake API for later editor clients.
- Retain Annotation Set v1 compatibility and all existing authority boundaries.

**Non-Goals:**

- Deterministically understand arbitrary comments or direct edits.
- Invoke a model, choose a manuscript automatically, or judge academic quality.
- Implement VS Code, GitHub, DOCX, ODT, LaTeX, or PDF clients.
- Add a command, Skill, workflow stage, registry type, or second state machine.

## Decisions

### Treat annotation slots as removable review-copy affordances

The generator supports `section`, `block`, and `none` density. Stable comment
envelopes carry slot IDs and target hints; their human prompt text is not a
contract. Removing untouched envelopes reconstructs the exact base. Filled,
deleted, moved, or ignored slots are all accepted because the Agent receives
the complete review copy and delta.

A mandatory marker grammar was rejected because it would make the adapter, not
the Agent, the semantic owner and would reject ordinary human reviewing habits.

### Keep a mutable session outside authority

Each selector has a bounded session directory beside the existing candidate.
The current review copy, session, interpretation draft, and delta may change.
Raw input snapshots are content-addressed and create-only. None is registered.
Only existing Annotation Submit freezes v2 candidate content.

Registering the session was rejected because unfinished thoughts and Agent
clarifications are working context, not accepted evidence.

### Derive a block-aware delta without classifying it

The adapter compares stable Markdown blocks and emits additions, removals,
replacements, slot fills, and unmatched structure with exact source spans.
It does not label a change as a comment, replacement request, or accepted edit.
Both complete documents remain available to the Agent, so the delta is a
navigation aid and provenance source rather than a lossy parser output.

### Put semantic recognition in an explicit Agent draft

The interpretation draft can retain `needs_clarification`,
`needs_confirmation`, `ready`, and `discarded` entries. Ready entries must cite
a raw source span or delta entry and provide the existing target,
interpretation, expected action, impact, and resolved clarification fields.
Materialization fails if an active entry is not ready or cites invalid evidence.

Copying raw text into interpretation fields was rejected because it would
fabricate Agent judgment.

### Add v2 provenance with one normalized reader

Annotation Set v2 adds raw source records and per-annotation source references.
The lifecycle, patch mapping, coverage verifier, snapshot loader, and checks use
one normalized v1/v2 accessor. v1 remains accepted so existing workspaces and
unsubmitted candidates do not break.

### Publish one narrow package subpath

`src/annotation-intake.ts` exports only the supported adapter API through
`researchspec/annotation-intake`. The package gains a narrow subpath export and
matching declarations while retaining its CLI bin. The export map also keeps
the current package metadata path explicit and does not expose core runtime
modules. The API returns values and planned working writes; it never executes
CLI authority.

## Risks / Trade-offs

- **Agent interpretation varies** → Preserve complete raw material, require
  traceable citations, expose ambiguity states, and keep human confirmation.
- **Large free-form changes produce noisy deltas** → Group by stable block and
  retain complete documents so no semantic information depends on the delta.
- **Mutable review files drift after interpretation** → Snapshot content by
  hash and bind source hashes in candidate and submission preconditions.
- **v1/v2 branching duplicates rules** → Normalize both versions at the
  contract boundary and reuse one provenance/target validator.
- **Slots pollute the review copy** → Keep them removable, offer `none`, and
  test exact base reconstruction rather than prompt wording.
- **Public API expands package obligations** → Export one narrow subpath and
  verify it from the packed tarball with declarations.

## Migration Plan

1. Sync capability and user-model requirements.
2. Add session, review-copy, delta, interpretation, and adapter API contracts.
3. Add Annotation Set v2 plus normalized v1/v2 validation.
4. Extend annotation instructions and provenance checking.
5. Update Navigate and converter-owned producer guidance, then regenerate.
6. Verify source-level behavior, packaged API consumption, and packaged CLI
   authority journeys.

Rollback removes the adapter entrypoint and new guidance. Existing v1 sets and
the current annotation core remain readable because no workspace contract is
rewritten during installation.

## Open Questions

None. VS Code packaging and editor-specific invocation remain a later change.
