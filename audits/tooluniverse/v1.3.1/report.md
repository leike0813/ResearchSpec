# ToolUniverse Domain Skill Audit — v1.3.1

## Result

ResearchSpec audits the immutable ToolUniverse v1.3.1 revision `9b7ff91ddb45b567cac2fa8ea31b82851e877617`. The machine SSOT is [`skill-audit.json`](./skill-audit.json); this report explains the reviewed boundary.

The pinned source contains 150 top-level directories with `SKILL.md`. The audit admits 130 research Skills and excludes 20 developer, setup, router, SDK, platform-adapter, or self-maintenance surfaces. Of the admitted set, 125 use the standard adaptation and five require reviewed frontmatter overrides. Candidate Skills contain 223 explicit candidate-to-candidate references.

## Source and inventory

| Fact | Value |
| --- | --- |
| Repository | `https://github.com/mims-harvard/ToolUniverse` |
| Release | `v1.3.1` |
| Revision | `9b7ff91ddb45b567cac2fa8ea31b82851e877617` |
| Root license | Apache-2.0 |
| Top-level Skills | 150 |
| Admitted candidates | 130 |
| Excluded surfaces | 20 |
| Candidate files | 550 |
| Candidate bytes | 6,423,781 |
| Skills with scripts | 33 |
| Script files | 88 |
| Skills with tests/evals | 44 |

The source checkout is maintainer-only. Runtime plugin commands read only packaged registry metadata and static adapted Skill assets.

## ANZSRC audit metadata

All 130 candidates have one primary ANZSRC 2020 FoR Field and may have distinct additional Fields. The 20 excluded surfaces have no Field and carry an explicit unclassified reason. Field metadata records the subject evidence of each upstream Skill; it does not assign production membership, dependencies, or admission.

The source-neutral catalog separately places the admitted Skills in 28 ANZSRC Group domains. It also places eight reviewed cross-disciplinary method Skills in `experimental-design-and-data-analysis` and computational biophysics in `computational-modeling-and-simulation`. These lists may overlap; generated Skill IDs and bytes remain unique.

## Exclusion and authority boundary

The excluded set covers ToolUniverse routers, setup/install Skills, SDK and custom-tool surfaces, Claude Code/Codex adapters, developer automation, self-review, and self-evolution. Admitting these surfaces would create a third-party installation, dispatch, runtime, or maintenance authority that conflicts with ResearchSpec core.

Admitted Skills remain semantic helpers. Their generated boundary text prohibits direct writes to ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts.

## Dependency review

Every one of the 223 explicit candidate-to-candidate references has a reviewed decision:

- `required`: a mandatory prerequisite and runtime dependency edge;
- `related`: optional or supporting material that does not enlarge installation;
- `routing`: upstream dispatch guidance that does not grant routing authority.

Only eight `required` edges enter the recursive registry dependency graph. The remaining 138 related and 77 routing references remain provenance evidence.

## Adaptation and resources

The converter normalizes frontmatter to the supported Open Agent Skills contract, adds compatibility and authority guidance, and moves long secondary content into `references/upstream-details.md` where required. It copies reviewed scripts, references, assets, and other runtime resources byte-for-byte, while excluding tests, evaluations, environment templates, and maintenance/history material.

Each derived Skill carries Apache-2.0 `LICENSE`, `NOTICE.md`, immutable upstream paths and revision, and a Skill-level license value in the isolated vendor bundle. ResearchSpec never executes copied scripts, installs dependencies, configures credentials, or contacts upstream services.

## Conversion and assembly

The ToolUniverse converter emits only:

- `skills/plugins/vendor-bundles/tooluniverse.json`;
- `skills/plugins/vendors/tooluniverse/**`;
- `skills/plugins/vendor-manifests/tooluniverse.json`;
- `skills/plugins/conversion-reports/tooluniverse.md`.

The source-neutral catalog owns direct domain membership. The central assembler validates the vendor bundle, catalog, packaged Skill roots, licenses, provenance, dependencies, and reachability before atomically writing `skills/plugins/registry.json`. This prevents converter ordering from overwriting other vendors.

## Review limitations

The audit and converter establish structural, ownership, licensing, dependency, and workflow-authority boundaries. They do not certify scientific correctness, service availability, package compatibility, data fitness, or the safety of executing upstream scripts. Target Agents remain responsible for satisfying each Skill's documented environment and dependency requirements.
