# Scientific Agent Skills Vendor Adapter

The Scientific Agent Skills adapter converts reviewed static Open Agent Skills from the maintainer-only `vendor/scientific-agent-skills` submodule. The current pin is release `v2.72.0` at `526ebce143bc326f44471554e33d66a19c840360`. User-facing `researchspec plugin` commands consume the generated output.

## Inputs and admission ownership

- `audits/scientific-agent-skills/v2.72.0/skill-audit.json` is the immutable 177-Skill structural, license, security, authority, relationship, and ANZSRC Field evidence.
- `src/vendor-converters/scientific-agent-skills/admission-decisions.json` resolves every audit record into one production admission decision. It is the allowlist and exclusion SSOT.
- `security-review-decisions.json` records 56 manual security decisions with the reviewed resources, adaptations, independent blockers and domains. The September 28 upstream report reused 162 scan rows and ran no new scans. It has no row for the 14 additions or for `fictiv`. Local review uses the actual pinned files.
- `dependency-decisions.json` classifies all 27 audited relationships. Only a reviewed `required` edge from an admitted source may enter registry installation closure.
- `resource-decisions.json` records explicit exceptions to full-tree copying and confirms that the remaining Skill stays coherent.
- `src/plugins/domain-catalog.json` independently owns user-facing direct membership. Audit Fields never populate domains automatically.

The policy admits 68 Skills, including 12 additions, and excludes 109. Every admitted ID uses `scientific-agent-skills-<upstream-id>` and carries an evidence-backed Skill-level license and existing domain membership. The manual catalog records 53 decisions with adaptations, one clear, one deferral for `autoskill` and one failure for `dhdna-profiler`.

The converter does not infer admission from `ingest_readiness`, upstream `safe`, severity, package licenses, categories, or Field metadata. Missing or contradictory decisions, unsafe evidence paths, unresolved high-risk behavior, absent license text, excluded dependency targets, stale resources, and unreachable domain membership fail conversion.

## Adaptation and resources

Generated entries remove platform-specific `metadata.openclaw`, move environment requirements into standard `compatibility` guidance, normalize array `allowed-tools`, use the generated global ID as frontmatter `name`, and add the ResearchSpec authority boundary. Approved review adaptations may add entry or compatibility guidance, fixed non-secret configuration, or exclude a non-essential resource. They never patch executable business logic. Dependency and installation commands remain target-Agent guidance only.

An admitted Skill copies its pinned source tree subject to 45 reviewed resource exclusions. The manifest records each disposition and hashes copied bytes. Release-bound entry adaptations keep the curated image, presentation, retrieval and service-planning procedures within their approved roles. Optional external operations use the user's authorized target-Agent capabilities and identities. ResearchSpec processes these resources statically.

Every generated Skill carries `LICENSE` and `NOTICE.md`. The notice records repository, release, revision, upstream path, generated ID, content license, adaptation boundary, and resource exclusions. Package, service, dataset, hardware, and runtime licenses named by the Skill remain separately applicable.

## Generated outputs and assembly

```text
skills/plugins/vendor-bundles/scientific-agent-skills.json
skills/plugins/vendors/scientific-agent-skills/
skills/plugins/vendor-manifests/scientific-agent-skills.json
skills/plugins/conversion-reports/scientific-agent-skills.md
```

The converter stages these outputs beside unchanged published vendors, invokes the source-neutral central assembler, and commits only its own projection plus `registry.json`. ToolUniverse uses the same staging discipline. Neither converter owns another vendor's bundle or the domain catalog.

The 68 Skills populate 32 ANZSRC Group domains and all five tool domains. Membership may be one-to-many. The current relationships are advisory or have excluded sources, so none adds an installed dependency.

## Maintainer commands

```bash
pnpm scientific-agent-skills:convert
pnpm scientific-agent-skills:check
pnpm scientific-agent-skills:idempotence
```

`convert` refuses unexplained generated drift unless `--force` follows review. `check` validates the vendor output inside the combined registry, including the complete manual-review catalog and approved resource curation. `idempotence` regenerates against all published vendors and compares the Scientific Agent Skills projection and central registry.

To update the vendor, verify the target tag and compare its immutable source with the active pin. Reconcile admission, overlap, license, security, content, relationships, resources and domain membership against the candidate. Keep the previous extension inventory available through regeneration so retired resource paths can be removed.

## Extension mode packages

All 68 reviewed production Skills are projected one-to-one into the
graph-native extension registry under `skills/plugins/extensions/` as
`plugin-scientific-agent-skills-*` capabilities with same-named one-node graph
profiles. The generator
`scripts/generate-scientific-agent-skills-extensions.mjs` produces the packages
from the reviewed vendor bundle and the source-neutral domain catalog.

- Packages with reviewed `.py` resources are `execution_type: mixed`; all
  others are `execution_type: llm`.
- All 664 reviewed non-standard resources keep their original relative paths
  and use byte-level SHA-256 knowledge refs with the reviewed Skill-level license.
  Each extension carries its raw Skill's `LICENSE` and `NOTICE.md`.
- Every package declares `validate_scientific_brief.py` with the same six
  evidence-bearing `research_brief` fields.
- The 37 Scientific Agent Skills domain assignments (32 ANZSRC Group and five
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

The suite anchors at `audits/scientific-agent-skills/v2.72.0` and binds the
immutable skill audit, the vendor bundle, the extension registry subset,
package/profile trees, the maintenance Skill, the maintenance catalog, and
records 01–05 in `manifest.json`. `artifacts` regenerates every reviewed package before
synchronizing reviewed resources. The Agent semantic review is mandatory and
`baseline` refuses an anchor whose `05-semantic-review.md` is not completed.
