## Context

Education Agent Skills is pinned at `snapshot-32fce5c`, commit
`32fce5c0d097ec675cf81c750a65a379e4d87e3c`, tree
`3223d79299ae10391c22549debef7ffc9ef7a0e2`. Its immutable audit covers 165
Skills and its evidence map covers 872 declarations through 719 normalized
works. The upstream root has no tracked license file, but its README and plugin
metadata consistently state CC BY-SA 4.0 and identify Gareth Manning as author.
That repository-level statement is usable only after conservative per-Skill
source review; it does not clear third-party authorship or claimed original
framework provenance.

## Goals / Non-Goals

**Goals:**

- Resolve all 165 Skill records exactly once and retain full capability for
  every admitted Skill.
- Bind every decision to immutable source paths, hashes, evidence IDs, and
  relationship IDs.
- Disclose unresolved evidence without implying claim-support review.
- Preserve student-facing, wellbeing, and analytics behavior while preventing
  clinical use, hidden profiling, unreviewed high-risk decisions, unauthorized
  sensitive-data handling, and ResearchSpec workflow writes.
- Produce deterministic complete trees and require aggregate-hash approval
  before production publication.

**Non-Goals:**

- Re-evaluating or modifying the immutable audit or evidence map.
- Verifying whether cited works support upstream claims.
- Distributing or executing the upstream installer, MCP runtime, tests, scripts,
  registry cache, project docs, credentials, or hosted services.
- Creating new domains, public commands, wrappers, hard dependencies, or
  ResearchSpec workflow nodes.

## Decisions

### Resolve licensing through exact conservative exclusions

The policy admits a Skill only when the immutable record identifies Gareth
Manning as its sole content contributor and the Skill has no
`original-framework` risk. The 19 original-framework-risk Skills and the 10
Sean Hu-attributed historical-thinking Skills are fixed exclusions. Any future
source, audit, contributor, or risk change invalidates the policy hash and
requires renewed review.

All generated Skills use CC BY-SA 4.0, retain a complete Skill-local license and
notice, identify Gareth Manning and the upstream repository, link the license,
state the pinned source path and SHA-256, and disclose ResearchSpec's identifier,
frontmatter, evidence-marker, safety-boundary, and authority-boundary changes.

### Build complete catalogs from one compact production policy

`production-policy.json` is the rule SSOT. The typed loader expands it against
the immutable audit and evidence map into:

- exactly 165 admission decisions;
- exactly 872 evidence adaptation decisions;
- exactly 813 advisory relationship decisions;
- one safety and domain decision per admitted Skill.

The loader validates the fixed exclusion sets, counts, source hashes, generated
IDs, authorship, domains, work statuses, and relationship identities. This
avoids duplicating immutable source observations into large hand-maintained
JSON while still making every outcome explicit and inspectable.

### Preserve the complete body and adapt only the envelope

The converter reads only each admitted upstream `SKILL.md`. It retains all
educational metadata and the complete body, changes the Open Agent Skill name to
the vendor-prefixed global ID, adds license/compatibility/provenance metadata,
and inserts concise boundary blocks before the original body.

Tests remove inserted boundaries and evidence markers and compare the remaining
body to the pinned source. Input schema, output schema, prompt, examples,
student-facing interaction, and ordinary workflow text therefore cannot be
silently deleted.

### Mark unresolved evidence at deterministic source-bound units

Every declaration whose mapped work set contains `unresolved` or `conflicting`
status is wrapped as a whole `evidence_sources` citation. Body adaptation uses
the immutable parsed author/year identity to find complete Markdown list items
or complete prose sentences. Overlapping matches are merged so markers are
paired and never nested. If no safe body unit contains the declaration identity,
the frontmatter citation remains marked and the catalog records
`citation-not-used-in-body`.

The generated Skill contains one standard evidence rule:

> Evidence status: Unmarked citations have identity verification only, not
> claim-support review. Text inside `⟦UNRESOLVED⟧…⟦/UNRESOLVED⟧` relies on
> unresolved evidence; verify the source and its support before relying on it,
> otherwise omit or soften the claim and disclose the uncertainty.

### Add conditional boundaries without removing capability

All Skills state that they are semantic helpers and cannot modify ResearchSpec
state. Additional concise clauses are selected from immutable audience,
resource, and risk records:

- learner and minor work requires age-appropriate interaction and accountable
  human oversight for consequential use;
- privacy and analytics work prohibits hidden profiling or monitoring and
  requires data minimization plus explicit authority for transmission or
  persistence;
- wellbeing work remains educational and cannot diagnose, treat, or replace
  qualified safeguarding or clinical support;
- “diagnosis” in error analysis is restricted to task reasoning and cannot
  classify a learner or health condition.

These boundaries do not remove any declared input, output, main workflow, or
student-facing interaction.

### Keep relationships advisory and domains source-neutral

All 813 `chains_well_with` declarations remain advisory metadata. Generated
registry dependencies are always empty. Every admitted Skill uses its single
reviewed prospective domain from the audit, limited to
`curriculum-and-pedagogy`, `education-systems`, or
`specialist-studies-in-education`. Membership is written only after aggregate
hash approval.

### Separate preview from production

Preview generation writes a temporary complete tree, manifest, per-Skill hashes,
aggregate hash, and Chinese review report. `review-decision.json` records the
candidate hash while remaining `pending-human-review`. Production conversion,
registry assembly, domain changes, and package publication fail closed unless
the file records explicit approval of the exact recomputed aggregate hash.

## Risks / Trade-offs

- **Body citation matching may be ambiguous.** The matcher requires immutable
  author/year evidence and complete units, merges overlaps, records unmatched
  declarations, and never guesses from title similarity alone.
- **Repository-level licensing can be overread.** Fixed original-framework and
  third-party-contributor exclusions, source hashes, notices, and renewed hash
  review prevent blanket inheritance.
- **Safety text can silently change capability.** Complete-body equality tests
  and schema-preservation checks make deletion observable.
- **Large generated output can hide drift.** Per-file, per-tree, and aggregate
  hashes plus isolated idempotence checks bind the exact reviewed bytes.
- **Approval can become stale.** Any policy, audit, evidence, license, source, or
  generated-byte change changes the aggregate hash and closes production.

## Migration Plan

1. Add this change and the typed compact policy.
2. Implement deterministic adaptation and complete-tree preview.
3. Generate and review the temporary 136-Skill tree, hashes, and Chinese report.
4. Record the candidate hash and stop at `pending-human-review`.
5. After explicit approval, enable production conversion, add sixth-vendor
   domain membership, generate production assets, and update package/docs.
6. Run strict OpenSpec, converter, test, type, lint, build, release, package,
   idempotence, and diff verification. Leave the change unarchived.

## Open Questions

None. The user approved aggregate SHA-256
`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`
and authorized production conversion.
