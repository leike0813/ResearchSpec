## Context

Anchor replacement v2 separates match evidence from replacement spans and
validates local marker blocks, but replacement text still comes from a template
registry. Seven anchors share three templates, and all templates are rendered
through one imposed title/section structure plus an automatically appended
mutation boundary. This makes structurally valid output less faithful to the
specific upstream instructions that each span replaces.

The v3 pipeline must keep deterministic matching, coverage, write safety,
human-auditable before/after output, and concise runtime markers while moving
semantic authorship to individual anchor occurrences.

## Goals / Non-Goals

**Goals:**

- Give all 52 audited anchors stable, human-readable domain ids.
- Give each of the 50 replaceable anchors exactly one dedicated Markdown body.
- Preserve useful local semantics and rewrite only incompatible contract
  ownership, storage, gate, ledger, registry, and patch behavior.
- Validate all registry entries and bodies before generated output is touched.
- Render the authored body exactly, apart from normalization and paired markers.
- Keep two diagnostic anchors report-only and retain decisions separate.

**Non-Goals:**

- Broad cleanup of upstream ARS history, versions, examples, or design notes.
- Public CLI exposure, runtime LLM calls, or platform-specific adapter behavior.
- Backward compatibility with v2 generated markers, template ids, or profile
  metadata.
- Treating generated output copies as separate semantic anchor occurrences.

## Decisions

### Stable domain-prefixed identity

Anchor ids use `<DOMAIN>-NNN` and are the sole pairing identity. The fixed domain
mapping is:

| Domain | Existing contract categories |
| --- | --- |
| `STATE` | `material_passport_runtime_ssot` |
| `IO` | `phase_directory_boundaries` |
| `HANDOFF` | `handoff_artifacts` |
| `PATCH` | `revision_patch` |
| `GATE` | `gate_policy`, `integrity_gate` |
| `ARTIFACT` | `artifact_provenance` |
| `CLAIM` | `claims_contract` |
| `DECISION` | `decision_ledger` |
| `SOURCE` | `sources_contract` |
| `REVIEW` | `commitment_ledger`, `sprint_contract`, `generator_evaluator_contract` |

Initial numbers are allocated within each domain by normalized source path and
source occurrence. Assigned ids are never reordered or reused; new anchors take
the next unused number. The previous descriptive id becomes a non-key `name`
without the `anchor.` prefix.

This is preferred over skill-prefixed ids because ownership and copied file
location may change, and over current-category abbreviations because several
categories describe the same stable contract domain.

### Discriminated anchor records

The v3 registry uses a `ReplaceableAnchor | DiagnosticAnchor` union. Shared
fields contain id, name, source, owner, category, severity, and match hints.
Replaceable records additionally require replacement scope, semantic role,
ResearchSpec targets, and replacement shape. Diagnostic records forbid those
replacement fields.

`template_id` and `replacement_intent` are removed. The registry is the metadata
source of truth, while full prose lives at the deterministic path
`src/arsu-converter/anchors/replacements/<ID>.md`.

### Exact one-to-one bodies

Every replaceable anchor has a distinct Markdown file. Files contain only the
fragment inserted at the matched location: no frontmatter, marker, shared macro,
or renderer-required wrapper. Authors preserve valid role-specific steps,
ordering, conditions, exceptions, prohibitions, and schema meaning from the
complete before span. They change only semantics that conflict with ResearchSpec
contracts and assign writes to the correct runtime helper, validator, human
decision, or accepted contract patch when the local instruction actually writes.

The validator rejects missing, empty, orphaned, shared, marker-containing, or
byte-identical replacement bodies. Similar language is allowed when roles truly
overlap, but each complete body must remain occurrence-specific.

### Preload before mutation

The planner loads and validates all dedicated bodies after anchor/coverage
validation and before output replacement. Each matched span carries its loaded
body and body hash. Any body or matching failure aborts before `skills/arsu` is
deleted or overwritten.

The replacer performs no semantic composition. It normalizes the body to the
matched file's line-ending boundary, wraps it with:

```text
<!--rs:<ID>-->
...authored body...
<!--/rs:<ID>-->
```

and records exact before, body, and after hashes. One upstream source occurrence
may fan out to several generated paths; all copies use the same body.

### Calibration gate

Before the v3 runtime migration, five high-risk samples are authored in the
change calibration area and presented with full before/after text and rewrite
rationale:

- pipeline orchestrator resume runtime (`STATE`);
- deep-research synthesis claim intent (`CLAIM`);
- methodology reviewer blind/visible phase model (`REVIEW`);
- pipeline orchestrator revision-patch toolchain (`PATCH`);
- compliance agent output (`GATE`).

The user approved all five samples. Their authored bodies are now formal v3
replacement assets; the calibration copies remain audit evidence only and are
not loaded by the converter.

### Manifest and audit output

Profile and schema advance atomically to v3. Manifest records replace template
and marker-alias fields with `anchor_name` and `replacement_body_sha256`; they
retain source/category metadata, semantic role, targets, shape, before/after
hashes, diagnostics, and output paths. Because marker identity equals anchor id,
no separate marker id is recorded.

The human report remains separate and includes complete before/after blocks for
all 50 replacements plus report-only entries for the two diagnostic anchors.
Before-text remains excluded from legacy-risk scanning but included in generated
hash and idempotence checks.

## Risks / Trade-offs

- **Fifty prose assets increase maintenance cost.** → Enforce deterministic
  names, exact one-to-one validation, stable ids, and full audit reporting.
- **Human rewrites can still lose semantics.** → Calibrate five representative
  high-risk spans first and review every complete before/after block.
- **Category meaning may evolve.** → Never change an allocated id; category and
  metadata may be corrected independently.
- **Atomic v3 regeneration creates a large diff.** → Keep generated files
  converter-owned and rely on focused reports, hashes, targeted searches, and
  repeated idempotence checks.

## Migration Plan

1. Produce and approve the five calibration samples without changing active v2
   converter behavior.
2. Allocate all stable ids and migrate the registry to v3.
3. Author the remaining 45 body files and validate the complete asset set.
4. Replace template rendering with body preload and exact rendering; delete the
   template registry.
5. Update manifest, marker, report, output validation, specs, docs, and tests.
6. Regenerate `skills/arsu` only through the converter and run the full strict
   validation suite twice for idempotence.

Rollback before archive is a normal source revert plus converter regeneration;
there is no persisted external data migration.

## Open Questions

None. The five calibration samples were approved before bulk implementation.
