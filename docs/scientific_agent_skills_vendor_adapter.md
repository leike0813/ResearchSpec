# Scientific Agent Skills Vendor Adapter

The Scientific Agent Skills adapter is the maintainer-only deterministic converter for the pinned `vendor/scientific-agent-skills` submodule at release `v2.53.0`, revision `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`. It converts reviewed static Open Agent Skills; it is not a runtime bridge and is never invoked by user-facing `researchspec plugin` commands.

## Inputs and admission ownership

- `audits/scientific-agent-skills/v2.53.0/skill-audit.json` is the immutable 147-Skill structural, license, security, authority, relationship, and ANZSRC Field evidence.
- `src/vendor-converters/scientific-agent-skills/admission-decisions.json` resolves every audit record into one production admission decision. It is the allowlist and exclusion SSOT.
- `security-review-decisions.json` resolves every finding for the 40 candidates identified by the upstream static report and records the approved adaptation, independent blockers, domains, and maintainer decision.
- `dependency-decisions.json` classifies all 22 audited relationships. Only a reviewed `required` edge from an admitted source may enter registry installation closure.
- `resource-decisions.json` records explicit exceptions to full-tree copying and confirms that the remaining Skill stays coherent.
- `src/plugins/domain-catalog.json` independently owns user-facing direct membership. Audit Fields never populate domains automatically.

The v2.53.0 policy reviews all 139 business candidates and retains the eight audit hard exclusions. It admits 49 Skills and excludes 98. Every admitted ID is `scientific-agent-skills-<upstream-id>`, has a verified MIT Skill-content conclusion based on the repository license and Skill source, passes content and finding-level manual security review, has no ARSU or ToolUniverse semantic overlap, and belongs to at least one existing reviewed domain. Of the 40 manually reviewed candidates, 39 are `clear-with-adaptation`; 16 become newly eligible, 23 remain excluded by independent admission blockers, and `dhdna-profiler` remains failed.

The converter does not infer admission from `ingest_readiness`, upstream `safe`, severity, package licenses, categories, or Field metadata. Missing or contradictory decisions, unsafe evidence paths, unresolved high-risk behavior, absent license text, excluded dependency targets, stale resources, and unreachable domain membership fail conversion.

## Adaptation and resources

Generated entries remove platform-specific `metadata.openclaw`, move environment requirements into standard `compatibility` guidance, normalize array `allowed-tools`, use the generated global ID as frontmatter `name`, and add the ResearchSpec authority boundary. Approved review adaptations may add entry or compatibility guidance, fixed non-secret configuration, or exclude a non-essential resource. They never patch executable business logic. Dependency and installation commands remain target-Agent guidance only.

An admitted Skill copies its complete pinned source tree by default. Explicit reviewed resource decisions remove 28 individual files while preserving coherent Skills; the manifest records every included or excluded source path and hashes copied bytes. Bundled script paths are disclosed in generated entry guidance. Provider-specific LLM and image scripts approved for exclusion are not distributed. Optional external model or service operations use only target-Agent capabilities and identities after user consent; ResearchSpec does not execute scripts, install packages, read or persist credentials, contact services, or certify third-party runtime results.

Every generated Skill carries `LICENSE` and `NOTICE.md`. The notice records repository, release, revision, upstream path, generated ID, content license, adaptation boundary, and resource exclusions. Package, service, dataset, hardware, and runtime licenses named by the Skill remain separately applicable.

## Generated outputs and assembly

```text
skills/plugins/vendor-bundles/scientific-agent-skills.json
skills/plugins/vendors/scientific-agent-skills/
skills/plugins/vendor-manifests/scientific-agent-skills.json
skills/plugins/conversion-reports/scientific-agent-skills.md
```

The converter stages these outputs beside unchanged published vendors, invokes the source-neutral central assembler, and commits only its own projection plus `registry.json`. ToolUniverse uses the same staging discipline. Neither converter owns another vendor's bundle or the domain catalog.

The 49 Skills directly populate 19 ANZSRC Group domains and all five tool domains. Membership may be one-to-many and remains vendor-neutral. The registry contains no installed hard dependency edge from this vendor because every audited source with a `required` relationship was excluded; three reviewed relationships are advisory, and related or routing evidence does not enlarge installation.

## Maintainer commands

```bash
pnpm scientific-agent-skills:convert
pnpm scientific-agent-skills:check
pnpm scientific-agent-skills:idempotence
```

`convert` refuses unexplained generated drift unless `--force` follows review. `check` validates the 49-Skill vendor output inside the combined five-vendor, 218-domain registry, including the complete manual-review catalog and approved resource curation. `idempotence` regenerates against all published vendors and compares only this vendor's owned projection plus the central registry.

To update the vendor, first pin and audit a new immutable upstream release. Reconcile every admission, overlap, license, security, content, relationship, resource, ID, and domain decision before regenerating. Do not reuse v2.53.0 decisions for a changed source tree.
