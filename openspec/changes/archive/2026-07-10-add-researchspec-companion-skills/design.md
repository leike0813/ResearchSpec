## Context

ResearchSpec separates semantic work from deterministic state changes. ARSU
skills perform research, drafting, review, and revision authoring. ResearchSpec
contracts, ledgers, registries, and lifecycle commands hold authoritative state.
The companion suite must bridge those layers without duplicating the CLI or
becoming another research workflow engine.

The current implementation has one source file containing four short workflows
and emits a duplicated `references/cli-discipline.md` beside every skill. That
shape obscures ownership, makes each workflow too weak to guide an agent through
real state branches, and requires two files to understand one operation. The CLI
also cannot yet create a validated pending contract change, leaving semantic
repairs without a public deterministic entry point.

## Goals / Non-Goals

**Goals:**

- Provide eight complete, self-contained skills with narrow trigger boundaries,
  explicit CLI examples, decision tables, stop conditions, recovery, and output
  contracts.
- Make one workflow module own each canonical instruction body while a typed
  manifest remains the only registration and projection source.
- Add a deterministic create-only `propose` command and reuse the same target
  resolver at creation and acceptance.
- Keep command wrappers thin and preserve existing tool paths, ownership,
  transaction ordering, drift protection, and ARSU delivery.

**Non-Goals:**

- Add setup, status, list, show, handoff, pack, apply, artifact registration,
  gate append, or stage-transition skills.
- Make companions perform literature research, academic writing, manuscript
  review, or draft-patch authoring owned by ARSU.
- Add profiles, migrations, runtime references, runtime LLM dependencies,
  databases, platform-specific adapters, or generated agent metadata.
- Archive the OpenSpec change or commit the worktree.

## Decisions

### 1. Model companions as workflow modules, not command snippets

Use this structure:

```text
src/adapters/companion/
  types.ts
  shared-guidance.ts
  manifest.ts
  render.ts
  index.ts
  workflows/
    explore.ts
    propose.ts
    check.ts
    verify.ts
    next.ts
    context.ts
    decide.ts
    archive.ts
```

Each workflow module owns its mission, triggers and near misses, required inputs,
CLI examples, complete state-aware procedure, decision table, failure recovery,
output contract, guardrails, and completion criteria. `shared-guidance.ts` owns
only genuinely universal CLI discipline and is inlined during rendering. The
installed skill therefore has one complete `SKILL.md` and no runtime dependency
on a shared companion reference.

The manifest is the sole registry and supplies stable ID, skill ID, metadata,
and workflow body. The renderer joins frontmatter, workflow content, and shared
guidance. Command projection consumes the same manifest but emits only a short
route to the installed skill.

### 2. Keep ARSU and companion intent families independent

The existing four packaged ARSU trees and wrapper intents remain unchanged.
Companion metadata never inherits ARSU tags, and companion workflows route
research, writing, review, and manuscript-patch creation back to ARSU. This
avoids both broad companion triggering and accidental duplication of academic
reasoning workflows.

### 3. Add a strict proposal DTO before file rendering

`researchspec propose` reads a JSON-only semantic input DTO. The DTO contains a
title, rationale, risk level, impact statements, and one or more patch requests.
The runtime derives identity, actor, time, status, human-decision requirement,
stable patch IDs, schema version, and validation metadata.

The command validates the ID and directory collision before planning. It then
loads the current workspace, resolves every target against one of the five
stable specs, validates operation-specific current and proposed values, and
checks referenced artifact and decision IDs. Only after all patches validate
does it render `proposal.md`, `tasks.md`, and `contract-patch.yaml`.

### 4. Share one contract-patch target resolver across propose and accept

Extract target resolution from lifecycle application into a core module. YAML
supports deterministic dot segments and unique `collection[id]` selectors.
Markdown supports only `replace section[Heading]`. The resolver returns the
located value and an apply operation; it never chooses among ambiguous matches.

Operation rules are validated at proposal creation and repeated immediately
before `decide accept` writes. Revalidation includes Markdown `current_value`,
which the prior implementation did not check. Any target disappearance,
ambiguity, current-value drift, or evidence-reference conflict blocks the
operation.

### 5. Make proposal writes create-only and commit the machine contract last

The proposal write plan contains exactly three user-owned create operations:
`proposal.md`, `tasks.md`, then `contract-patch.yaml`. Existing active or archive
IDs fail before any write, and `--force` cannot authorize replacement.
`contract-patch.yaml` is written last so an active change is not discoverable as
valid until its human views exist. Dry-run and execution share the same plan;
propose never changes stable specs, runtime state, registry, or ledgers.

Interactive execution asks for low-risk creation confirmation unless `--yes` is
present. Non-interactive execution requires `--yes`; this only authorizes
creating a pending proposal and never accepts it.

### 6. Preserve the existing delivery transaction

`planToolDelivery` renders each companion `SKILL.md` through the same `planFile`
and installation-manifest path as ARSU assets and command wrappers. All 31 tools
receive eight skills. The 28 command-capable tools receive eight companion and
four ARSU wrappers. ForgeCode, Kimi, and Mistral Vibe receive skills and the
existing non-blocking command diagnostic. Codex continues using its registered
shared-global prompt path.

After this change, old manifest-owned `references/cli-discipline.md` files are
absent from the desired plan. Existing update stale cleanup removes them only
when their hash still matches the manifest; modified files remain recorded and
produce `generated_file_drift`.

## Companion Workflow Boundaries

- `explore` is read-only orientation over status, list, show, and check. It
  reports evidence, unknowns, options, and whether a proposal is warranted.
- `propose` turns an evidence-backed semantic change into a validated pending
  contract change; it never accepts or applies the change.
- `check` explains deterministic diagnostics and separates mechanical repair
  from semantic change and human decision.
- `verify` performs read-only semantic readiness review after deterministic
  checks and cites contract paths and evidence IDs.
- `next` restores context and returns one primary action using the fixed blocker,
  gate, pending, archive, and stage priority.
- `context` chooses handoff stdout/write or pack, evaluates privacy and artifact
  inclusion, previews writes, and confirms output risk.
- `decide` is the only public semantic apply workflow and always inspects,
  previews, confirms, executes, and rechecks.
- `archive` moves only resolved, evidence-complete items and never fabricates
  receipts, gates, or decisions.

## Error And Exit Model

The command uses the existing JSON envelope version 1. Argument, ID, and payload
schema errors exit 2. Target, current-value, selector, and reference conflicts
are domain blocks and exit 1. Existing output paths and filesystem write
conflicts exit 3. Unexpected internal failures retain exit 4. JSON mode emits
one envelope and never prompts.

## Risks / Trade-offs

- **Longer generated skills:** repetition increases installed bytes, but each
  skill becomes independently usable across agent platforms. Build-time shared
  fragments limit source duplication.
- **Target selector complexity:** the supported grammar is deliberately small;
  unsupported semantic edits stop rather than attempting general YAMLPath or
  Markdown rewriting.
- **Proposal files are user-owned:** later regeneration cannot silently repair
  them. This is intentional because they encode human-reviewable semantics.
- **Semantic verification is LLM judgment:** `verify` must cite evidence and
  label unknowns, while deterministic validity remains owned by `check`.
- **Large delivery matrix:** tests assert registry-derived parity and stable
  behaviors rather than full text, hashes, line counts, or snapshots.

## Migration Plan

The next `init` or `update` adds the four new skills and refreshes the four
existing ones only where generated ownership permits. Obsolete unmodified local
CLI references are removed by normal stale cleanup; modified references are
preserved as drift. No workspace schema migration or configuration change is
required.

## Open Questions

None. The eight-skill default surface, proposal interface, resolver grammar,
tool matrix, and ownership semantics are fixed for this change.
