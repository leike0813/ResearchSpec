# ToolUniverse Vendor Adapter

The ToolUniverse adapter is a maintainer-only deterministic converter for the pinned `vendor/tooluniverse` submodule. It produces one isolated vendor bundle and static Open Agent Skills; it is not a runtime bridge and is never invoked by user-facing `researchspec plugin` commands.

## Inputs and ownership

- `audits/tooluniverse/v1.3.1/skill-audit.json` owns the 150-entry admission inventory and ANZSRC Field evidence: 130 candidates and 20 exclusions.
- `src/vendor-converters/tooluniverse/dependency-decisions.json` owns the reviewed classification of all 223 explicit Skill references.
- `src/plugins/domain-catalog.json` owns all source-neutral domain identities and direct Skill lists.
- `src/plugins/taxonomy/anzsrc-for-2020.json` owns the attributed ANZSRC hierarchy used to validate discipline domains and audit Fields.
- The source revision remains `9b7ff91ddb45b567cac2fa8ea31b82851e877617` for this adapter input version.

The converter may validate these inputs and generate reports, but it cannot create or rename domains, infer membership from audit Fields, admit an unclassified upstream Skill, or turn an ambiguous reference into a hard dependency.

## Generated outputs

The ToolUniverse converter owns:

```text
skills/plugins/vendor-bundles/tooluniverse.json
skills/plugins/vendors/tooluniverse/
skills/plugins/vendor-manifests/tooluniverse.json
skills/plugins/conversion-reports/tooluniverse.md
```

The central assembler, not the converter, owns `skills/plugins/registry.json`. It combines every isolated vendor bundle with `src/plugins/domain-catalog.json`, validates the complete registry against packaged Skill trees, and atomically replaces the registry only after validation.

Do not hand-edit generated Skill files. Change the audit, reviewed dependency decision, catalog membership, or converter rule and regenerate. Every admitted Skill receives normalized frontmatter, compatibility and authority guidance, Apache-2.0 content licensing and attribution, and a static resource tree. Tests, evaluations, environment templates, and maintenance/history resources are excluded.

## Maintainer commands

```bash
pnpm tooluniverse:convert
pnpm tooluniverse:check
pnpm tooluniverse:idempotence
```

`convert` refuses unexplained generated drift unless `--force` is used after review, then refreshes the isolated bundle and invokes central assembly. It stages against all published vendors and commits only ToolUniverse-owned output plus the registry. `check` validates the 130-Skill vendor output and assembled 218-domain registry without owning the evolving public-domain count. `idempotence` compares the isolated outputs and combined registry. None of these commands executes upstream Skill scripts or installs their dependencies.

When updating ToolUniverse, first pin the new submodule revision and open a new audit. Reconcile every inventory, resource, frontmatter, dependency, safety, license, Field mapping, and domain-membership change before updating converter inputs.
