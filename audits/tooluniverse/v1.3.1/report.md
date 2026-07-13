# ToolUniverse Domain Skill Audit — v1.3.1

## Executive summary

This audit evaluates ToolUniverse as a possible source for future ResearchSpec domain Skill plugins. It does not approve, convert, package, install, or execute any upstream Skill.

The pinned release contains 150 top-level directories with `SKILL.md`, not the 68 listed in the release's `skills/README.md`. Twenty entries are developer, setup, router, SDK, platform-adapter, or self-maintenance surfaces and are outside the domain plugin business scope. The remaining 130 are research candidates spanning nine primary domains.

No candidate is ready for direct distribution. Of the 130 candidates, 125 require the standard adaptation set and five require additional frontmatter curation. The collection is also strongly coupled: candidate Skills contain 223 explicit references to other candidate Skills. A later ingest change should therefore begin with one reviewed biomedical and life-science umbrella plugin unless ResearchSpec first adopts an explicit plugin dependency contract.

The structured source of truth for every count and disposition in this report is [`skill-audit.json`](skill-audit.json).

The follow-up change `add-vendor-domain-plugin-ingestion` subsequently introduced
the required vendor/domain dependency contract and a ToolUniverse-specific
converter. Production admission remains derived from this immutable audit; see
[`docs/tooluniverse_vendor_adapter.md`](../../../docs/tooluniverse_vendor_adapter.md)
for the current maintenance workflow.

## Source baseline

| Field | Value |
| --- | --- |
| Repository | `https://github.com/mims-harvard/ToolUniverse` |
| Release | `v1.3.1` |
| Revision | `9b7ff91ddb45b567cac2fa8ea31b82851e877617` |
| Repository path | `vendor/tooluniverse` |
| Upstream Skill root | `skills/` |
| Upstream license | Apache-2.0 |

The submodule is audit evidence and a possible future maintainer input. It is excluded from the ResearchSpec npm package and is never read by plugin runtime commands.

## Method and limits

The audit reads the pinned Git tree and performs the following checks without running upstream code:

- enumerate every top-level directory containing `SKILL.md`;
- parse YAML frontmatter and apply Open Agent Skills name and description limits;
- inventory all files, bytes, scripts, tests, evals, and environment templates;
- extract explicit `tooluniverse-*` Skill references from each `SKILL.md`;
- identify external runtime, platform, history/progress, licensing, and high-stakes review signals;
- assign one business disposition, ingest readiness, and primary domain per Skill.

This is a packaging and instruction-surface audit. It does not validate scientific claims, tool outputs, database coverage, clinical accuracy, script correctness, API availability, or the licenses of data returned by external services. Those remain blocking review areas for future ingest.

## Inventory and disposition

| Measure | Count |
| --- | ---: |
| Top-level Skills | 150 |
| Business candidates | 130 |
| Excluded non-business Skills | 20 |
| Candidate files | 550 |
| Candidate bytes | 6,423,781 |
| Standard-adaptation candidates | 125 |
| Candidates needing additional curation | 5 |

The excluded set is:

- Developer maintenance: `create-tooluniverse-skill` and all ten `devtu-*` Skills.
- Setup and installation: `setup-tooluniverse`, `tooluniverse-install-skills`.
- Platform adapters: `tooluniverse-claude-code-plugin`, `tooluniverse-codex-plugin`, `tooluniverse-cs-setup`.
- Router: `tooluniverse`.
- Developer SDK: `tooluniverse-sdk`.
- Self-maintenance or tool creation: `tooluniverse-custom-tool`, `tooluniverse-self-review`.

These exclusions prevent a third-party installation surface, router, runtime SDK, or maintenance workflow from becoming a ResearchSpec domain plugin capability.

## Domain model

The primary domain is descriptive audit metadata, not an install boundary.

| Domain | Candidate Skills |
| --- | ---: |
| Evidence and discovery | 9 |
| Genomics and genetics | 26 |
| Omics and systems biology | 18 |
| Molecular and structural biology | 19 |
| Drug discovery and pharmacology | 20 |
| Clinical and translational | 16 |
| Chemistry and toxicology | 9 |
| Microbiology and ecology | 8 |
| Quantitative and data analysis | 5 |

Secondary domains preserve interdisciplinary relevance. They do not imply duplicate Skill copies or dependencies between future plugins.

## Open Agent Skills conformance

### Blocking frontmatter findings

- `tooluniverse-fastq-qc`: YAML frontmatter cannot be parsed.
- `tooluniverse-phewas`: YAML frontmatter cannot be parsed.
- `tooluniverse-clinical-risk-scoring`: description is 1,269 characters.
- `tooluniverse-mendelian-randomization`: description is 1,102 characters.
- `tooluniverse-product-safety-surveillance`: description is 1,213 characters.

Open Agent Skills permits descriptions of at most 1,024 characters. A future adapter must use reviewed description overrides; blind truncation would risk removing routing distinctions.

### Progressive disclosure findings

Five candidate entry documents exceed the recommended 500 lines:

- `tooluniverse-phylogenetics` — 512 lines
- `tooluniverse-residue-functional-mechanism-interpretation` — 505 lines
- `tooluniverse-rnaseq-deseq2` — 509 lines
- `tooluniverse-statistical-modeling` — 659 lines
- `tooluniverse-variant-analysis` — 502 lines

Detailed material should move into focused references during curation, without changing scientific meaning.

### Non-standard metadata

128 candidates contain non-standard frontmatter, predominantly ToolUniverse's `disable-model-invocation` field. Two candidates contain platform-specific instruction terms. A ResearchSpec derivative must use the supported Open Agent Skills fields and preserve useful routing information through reviewed descriptions or standard metadata.

## Resources, dependencies, and execution safety

- 33 candidates carry 88 files under `scripts/`.
- 44 candidates carry tests or eval resources.
- 19 candidates carry `.env.template` files.
- 39 candidate entry documents explicitly mention MCP, the `tu` CLI, the ToolUniverse Python SDK, or package installation.
- Two candidates contain history, progress, issue, or verification-oriented resources that conflict with ResearchSpec's current-state-only Skill policy unless curated.

ResearchSpec must not execute these scripts, install dependencies, configure MCP, copy API credentials, or create environments. A future derivative must:

1. declare required ToolUniverse runtime, network, API-key, system-package, and script dependencies in `compatibility` and the instructions;
2. distinguish runtime assets from upstream tests, evals, progress files, and maintenance artifacts;
3. review scripts for external binaries, file writes, network effects, and dependency assumptions;
4. retain only static resources needed by the adapted Skill.

## Licensing and provenance

ToolUniverse provides one repository-level Apache-2.0 `LICENSE`. None of the candidates currently carries the per-Skill `LICENSE` and `NOTICE.md` required by the ResearchSpec plugin contract.

For a later derivative, every admitted Skill must receive:

- the applicable license text;
- a concise `NOTICE.md` naming ToolUniverse, repository URL, pinned revision, source paths, and ResearchSpec adaptation;
- registry provenance at Skill granularity;
- a review of any bundled data or reference material whose origin is not established by the repository-level license.

Candidate status in this audit is not a licensing conclusion.

## Coupling and packaging implications

The 130 candidates contain 223 candidate-to-candidate references. These references connect 74 source Skills to 77 target Skills and frequently cross the nine audit domains. Common targets include variant interpretation, drug-target validation, disease research, RNA-seq analysis, adverse-event detection, enrichment, statistics, and data wrangling.

Registry Schema 1 does not define plugin dependencies. Splitting the current collection directly into independently installable domain plugins would therefore produce references to unavailable Skills or require broad semantic rewriting. Duplicating shared Skills is not permitted because Skill IDs are globally unique.

## Safety and ResearchSpec authority

Twenty-one candidates are clinical, treatment, drug-safety, toxicology, or other high-stakes surfaces requiring expert review and explicit limitations. ToolUniverse tools may retrieve evidence or compute candidate outputs, but a derived Skill must not present database or model output as unreviewed clinical advice.

All future derivatives must state that they are semantic helpers. They must not directly modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. When assisting an active ARSU run, they return candidate semantic material to the calling Skill; authoritative writes continue through the existing ResearchSpec CLI.

## Recommended follow-up sequence

1. Open a separate `ingest-tooluniverse-biomedical-plugin` change only after this audit is reviewed.
2. Implement a ToolUniverse-specific maintainer adapter, not a public command or generic converter ABI.
3. Start with one reviewed biomedical and life-science umbrella plugin so cross-Skill references remain available under Registry Schema 1.
4. Use the audit JSON as the explicit include, exclude, domain, and curation input. Any new or unclassified upstream Skill must block regeneration.
5. Normalize frontmatter, apply reviewed description overrides, filter non-runtime resources, inject `compatibility` and the ResearchSpec authority boundary, and generate per-Skill licensing and provenance.
6. Generate a conversion manifest, human report, validation, and idempotence checks before populating `skills/plugins/registry.json`.
7. Consider separate domain plugins only in a later design that either adds an explicit dependency contract or removes every cross-plugin hard dependency through reviewed curation.

No step above is implemented by this audit change.
