# ToolUniverse Vendor Adapter

The ToolUniverse adapter is a maintainer-only, deterministic converter for the pinned `vendor/tooluniverse` submodule. It produces static Open Agent Skills for the domain plugin registry; it is not a runtime bridge to ToolUniverse and is never invoked by `researchspec plugin` commands.

## Inputs and ownership

- `audits/tooluniverse/v1.3.1/skill-audit.json` owns the 150-entry admission inventory, with 130 candidates and 20 exclusions.
- `src/vendor-converters/tooluniverse/dependency-decisions.json` owns the reviewed classification of all 223 explicit Skill references.
- `src/vendor-converters/tooluniverse/domain-catalog.json` owns the three stable domain records and their direct Skill lists.
- The submodule revision must remain `9b7ff91ddb45b567cac2fa8ea31b82851e877617` for this adapter input version.

The converter may validate these inputs and generate reports, but it must not infer a new domain, admit an unclassified upstream Skill, or turn an ambiguous reference into a hard dependency.

## Generated outputs

The converter owns:

```text
skills/plugins/registry.json
skills/plugins/vendors/tooluniverse/
skills/plugins/vendor-manifests/tooluniverse.json
skills/plugins/conversion-reports/tooluniverse.md
```

Do not hand-edit generated Skill files. Change the audit, reviewed policy, or converter rule and regenerate. Every admitted Skill receives normalized frontmatter, compatibility and authority guidance, Apache-2.0 attribution, and a static resource tree. Tests, evaluations, environment templates, and maintenance/history resources are excluded.

## Maintainer workflow

```bash
pnpm tooluniverse:convert
pnpm tooluniverse:check
pnpm tooluniverse:idempotence
```

`convert` refuses unexplained generated drift unless `--force` is used after review. `check` validates the generated registry and the 130/65/72/40 inventory contracts. `idempotence` regenerates into a temporary directory and compares hashes. None of these commands executes upstream Skill scripts or installs their dependencies.

When updating ToolUniverse, first pin the new submodule revision and open a new audit. Reconcile every inventory, resource, frontmatter, dependency, safety, license, and domain-membership change before updating converter inputs.
