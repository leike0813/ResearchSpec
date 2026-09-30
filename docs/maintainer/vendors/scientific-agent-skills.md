# Scientific Agent Skills Vendor Adapter

The Scientific Agent Skills adapter is the maintainer-only deterministic converter for the pinned `vendor/scientific-agent-skills` submodule at release `v2.70.0`, revision `d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b`. It converts reviewed static Open Agent Skills; it is not a runtime bridge and is never invoked by user-facing `researchspec plugin` commands.

## Inputs and admission ownership

- `audits/scientific-agent-skills/v2.70.0/skill-audit.json` is the immutable 167-Skill structural, license, security, authority, relationship, and ANZSRC Field evidence.
- `src/vendor-converters/scientific-agent-skills/admission-decisions.json` resolves every audit record into one production admission decision. It is the allowlist and exclusion SSOT.
- `security-review-decisions.json` records the retained 42-entry manual security review — historical review targets plus current high/critical findings — with the approved adaptation, independent blockers, domains, and maintainer decision for each. The upstream `docs/security-report.json` (2026-09-28) is observation only: it scans 166 of 167 Skills with no `fictiv` result and reports 674 findings, and its severity and `safe` flags are not production decisions.
- `dependency-decisions.json` classifies all 28 audited relationships. Only a reviewed `required` edge from an admitted source may enter registry installation closure.
- `resource-decisions.json` records explicit exceptions to full-tree copying and confirms that the remaining Skill stays coherent.
- `src/plugins/domain-catalog.json` independently owns user-facing direct membership. Audit Fields never populate domains automatically.

The v2.70.0 policy reviews all 158 business candidates and retains the nine audit hard exclusions. It admits 56 Skills and excludes 111. Every admitted ID is `scientific-agent-skills-<upstream-id>`, has a verified MIT Skill-content conclusion based on the repository license and Skill source, passes content and finding-level manual security review, has no ARSU or ToolUniverse semantic overlap, and belongs to at least one existing reviewed domain. Of the 42 manually reviewed candidates, 39 are `clear-with-adaptation` and 2 are `clear`: 16 are admitted, 25 remain excluded by independent admission blockers, and `dhdna-profiler` remains failed.

The converter does not infer admission from `ingest_readiness`, upstream `safe`, severity, package licenses, categories, or Field metadata. Missing or contradictory decisions, unsafe evidence paths, unresolved high-risk behavior, absent license text, excluded dependency targets, stale resources, and unreachable domain membership fail conversion.

## Adaptation and resources

Generated entries remove platform-specific `metadata.openclaw`, move environment requirements into standard `compatibility` guidance, normalize array `allowed-tools`, use the generated global ID as frontmatter `name`, and add the ResearchSpec authority boundary. Approved review adaptations may add entry or compatibility guidance, fixed non-secret configuration, or exclude a non-essential resource. They never patch executable business logic. Dependency and installation commands remain target-Agent guidance only.

An admitted Skill copies its complete pinned source tree by default. Explicit reviewed resource decisions remove 19 individual files while preserving coherent Skills; the manifest records every included or excluded source path and hashes copied bytes. Bundled script paths are disclosed in generated entry guidance. Provider-specific LLM and image scripts approved for exclusion are not distributed. Optional external model or service operations use only target-Agent capabilities and identities after user consent; ResearchSpec does not execute scripts, install packages, read or persist credentials, contact services, or certify third-party runtime results.

Every generated Skill carries `LICENSE` and `NOTICE.md`. The notice records repository, release, revision, upstream path, generated ID, content license, adaptation boundary, and resource exclusions. Package, service, dataset, hardware, and runtime licenses named by the Skill remain separately applicable.

## Generated outputs and assembly

```text
skills/plugins/vendor-bundles/scientific-agent-skills.json
skills/plugins/vendors/scientific-agent-skills/
skills/plugins/vendor-manifests/scientific-agent-skills.json
skills/plugins/conversion-reports/scientific-agent-skills.md
```

The converter stages these outputs beside unchanged published vendors, invokes the source-neutral central assembler, and commits only its own projection plus `registry.json`. ToolUniverse uses the same staging discipline. Neither converter owns another vendor's bundle or the domain catalog.

The 56 Skills directly populate 24 ANZSRC Group domains and all five tool domains. Membership may be one-to-many and remains vendor-neutral. The registry contains no installed hard dependency edge from this vendor because every audited source with a `required` relationship was excluded; seven reviewed relationships are advisory, and related or routing evidence does not enlarge installation.

## Maintainer commands

```bash
pnpm scientific-agent-skills:convert
pnpm scientific-agent-skills:check
pnpm scientific-agent-skills:idempotence
```

`convert` refuses unexplained generated drift unless `--force` follows review. `check` validates the 56-Skill vendor output inside the combined six-vendor, 218-domain registry, including the complete manual-review catalog and approved resource curation. `idempotence` regenerates against all published vendors and compares only this vendor's owned projection plus the central registry.

To update the vendor, first fetch upstream tags and confirm a newer release than the catalog pin exists, then pin and audit that immutable release. Reconcile every admission, overlap, license, security, content, relationship, resource, ID, and domain decision before regenerating. Do not reuse v2.70.0 decisions for a changed source tree.

## Extension mode packages

All 56 reviewed production Skills are also projected one-to-one into the
graph-native extension registry under `skills/plugins/extensions/` as
`plugin-scientific-agent-skills-*` capabilities with same-named one-node graph
profiles. The generator
`scripts/generate-scientific-agent-skills-extensions.mjs` produces the packages
from the reviewed vendor bundle and the source-neutral domain catalog.

- Packages with reviewed `.py` resources are `execution_type: mixed`; all
  others are `execution_type: llm`.
- All 632 reviewed non-standard resources keep their original relative paths
  and are bound as byte-level SHA-256 knowledge refs under MIT, including the
  reviewed TimesFM binary example assets.
- Every package declares `validate_scientific_brief.py` with the same six
  evidence-bearing `research_brief` fields.
- The 29 Scientific Agent Skills domain assignments (24 ANZSRC Group and five
  tool domains) are derived directly from the domain catalog and mirrored into
  the extension registry.

Install, update, status, and check read manifests and hashes only. Only
`advance` executes the declared `python3` validator. ResearchSpec never imports
or executes packaged scripts, installs dependencies, or configures credentials.

## Maintenance suite

```bash
pnpm scientific-agent-skills-maintenance:artifacts
pnpm scientific-agent-skills-maintenance:records
pnpm scientific-agent-skills-maintenance:baseline
pnpm scientific-agent-skills-maintenance:check
```

The suite anchors at `audits/scientific-agent-skills/v2.70.0`, binds the
immutable skill audit, the vendor bundle, the extension registry subset,
package/profile trees, the maintenance Skill, the maintenance catalog, and
records 01–05 in `manifest.json`. `artifacts` regenerates every reviewed package before
synchronizing reviewed resources. The Agent semantic review is mandatory and
`baseline` refuses an anchor whose `05-semantic-review.md` is not completed.
