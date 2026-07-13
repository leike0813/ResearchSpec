## Context

The production plugin registry is intentionally empty after the framework change. ToolUniverse is the first proposed real source, but release `v1.3.1` contains 150 top-level Skills rather than the 68 advertised by its stale Skill README. The collection mixes research workflows, developer maintenance, installation and platform adapters, local scripts, tests, evals, non-standard frontmatter, and extensive cross-Skill routing.

The audit must be reproducible from one immutable checkout while remaining separate from npm distribution and user runtime. It must also create a useful input for a later source-specific adapter without prematurely approving or converting any Skill.

## Goals / Non-Goals

**Goals:**

- Pin the audited ToolUniverse release as repository evidence.
- Account for every top-level upstream Skill with a typed, versioned record.
- Classify business relevance, domain, ingest readiness, resources, coupling, and concrete findings.
- Produce a concise human report and stable tests for audit completeness.
- Recommend a safe follow-up architecture from observed evidence.

**Non-Goals:**

- Generate or publish ToolUniverse-derived plugin assets.
- Add an ingest adapter, generic converter ABI, public command, runtime bridge, or plugin dependency model.
- Install ToolUniverse, execute upstream scripts, validate scientific results, or contact upstream services.
- Treat a candidate disposition as production approval.

## Decisions

### Pin the release commit as a maintainer-only submodule

`vendor/tooluniverse` uses the official repository URL and the immutable commit `9b7ff91ddb45b567cac2fa8ea31b82851e877617` behind `v1.3.1`. The gitlink, not a branch name, is authoritative. The existing npm allowlist excludes `vendor`, so the checkout remains a maintenance input rather than redistributed runtime content.

Using the release tag is preferred over the newer `main` HEAD because it supplies stable version semantics. Copying the upstream tree into ResearchSpec is rejected because it would lose Git provenance and duplicate content before curation.

### Keep one machine audit as the factual source

`audits/tooluniverse/v1.3.1/skill-audit.json` is the audit SSOT. Its root records schema version, upstream identity, aggregate summary, nine domain definitions, and one record per top-level Skill.

Each Skill record contains:

- `skill_id`, `source_path`, and `kind`;
- `scope_disposition` (`candidate` or `exclude`);
- `ingest_readiness` (`standard-adaptation`, `needs-curation`, or `not-applicable`);
- one primary domain for candidates and zero or more secondary domains;
- file, byte, script, test/eval, and environment-template resource counts;
- references to other audited Skills;
- structured findings with code, severity, evidence paths, and a concise note.

The Markdown report summarizes this JSON and may explain recommendations, but it does not duplicate all 150 records.

### Use a fixed domain taxonomy without making plugin boundaries

Candidate Skills receive one primary domain from:

1. `evidence-and-discovery`
2. `genomics-and-genetics`
3. `omics-and-systems-biology`
4. `molecular-and-structural-biology`
5. `drug-discovery-and-pharmacology`
6. `clinical-and-translational`
7. `chemistry-and-toxicology`
8. `microbiology-and-ecology`
9. `quantitative-and-data-analysis`

These values describe content and future options; they do not create nine installable plugins. Secondary domains retain cross-disciplinary meaning without weakening the one-primary-domain invariant.

### Separate relevance from readiness

The 20 developer, setup, router, platform-adapter, SDK, and self-maintenance Skills are excluded from the business candidate set. The remaining 130 Skills are candidates, but all still require later licensing, compatibility, authority, dependency, and resource-policy adaptation. Known malformed or overlong frontmatter is marked `needs-curation` rather than silently repaired.

### Test evidence, not report prose

The audit test validates source identity, complete one-to-one coverage, taxonomy and enum integrity, summary recomputation, known structural findings, resource counts, cross-Skill edges, and the empty production Registry. It does not snapshot the Markdown report or lock explanatory wording.

## Risks / Trade-offs

- **Upstream submodule is not initialized in a checkout** → Tests fail with a clear initialization diagnostic instead of inventing audit data.
- **Exact counts become stale after a future submodule update** → The gitlink and audit revision must move together; complete-coverage tests force an explicit re-audit.
- **Primary domains oversimplify interdisciplinary Skills** → Secondary domains record additional applicability, while plugin packaging remains undecided.
- **Automated structural checks could be mistaken for scientific review** → The report explicitly limits this change to packaging, instruction, safety-boundary, and dependency evidence.
- **A large JSON audit is costly to hand-maintain** → Records use stable enums and concise evidence; future adapter work may consume the file, but no generic framework is introduced now.
