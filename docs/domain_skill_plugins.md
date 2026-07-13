# ResearchSpec Domain Skill Plugins

## Purpose and authority

Domain Skill plugins are ResearchSpec-maintained collections of Open Agent Skills. Users select stable professional domains; upstream vendors are maintainer concerns, not installation products. Domain Skills may assist semantic research work, but they never own ResearchSpec routes, workflow profiles, work items, state, artifact registry, Gates, Decisions, transitions, or receipts.

User runtime is offline with respect to plugin maintenance. It reads static assets distributed in the ResearchSpec npm package and never clones an upstream repository, runs a converter, executes a bundled script, installs dependencies, or configures credentials.

## Two-layer model

The registry deliberately separates two many-to-many layers:

```text
upstream project                 stable user domain
      │                                  │
      ▼                                  ▼
vendor converter ──► vendor Skills ◄── domain Skill list
                           │
                           ▼
                 reviewed dependency graph
```

- A **vendor** pins an upstream project release and revision, converts reviewed Skills, records provenance, and owns required Skill dependencies.
- A **domain** owns a stable, versioned list of direct Skill IDs. One vendor may contribute to several domains, and one domain may contain Skills from several vendors.
- The same Skill may be a direct member of several domains. Its bytes and global Skill ID remain unique.
- Vendor converters cannot create, rename, or silently change domains. Domain catalog changes require explicit review and a domain version change.

ToolUniverse v1.3.1 is the first production vendor. Its 130 admitted research Skills are organized into:

- `translational-medicine-and-therapeutics` — 65 direct Skills;
- `genomics-and-systems-biology` — 72 direct Skills;
- `molecular-and-organismal-biosciences` — 40 direct Skills.

The overlap is intentional: 89 Skills belong directly to one domain, 35 to two, and six reusable research-method Skills to all three.

## Registry and package layout

`skills/plugins/registry.json` is the distributed runtime catalog:

```text
skills/plugins/
  registry.json
  vendors/
    <vendor-id>/
      <skill-id>/
        SKILL.md
        LICENSE
        NOTICE.md
        scripts/       optional and inert at installation time
        references/    optional
        assets/        optional
  vendor-manifests/
  conversion-reports/
```

Registry Schema 1 contains `schema_version`, `vendors`, and `domains`. A vendor records repository identity, release, immutable revision, license, converter version, and its Skills. Each vendor Skill records a globally unique `skill_id`, reviewed `dependencies`, and upstream source paths. A domain records `domain_id`, title, description, version, and direct Skill IDs.

Validation rejects unsafe paths, duplicate vendor/domain/Skill IDs, base-Skill conflicts, unknown dependencies, self-dependencies, unknown domain members, unreachable assets, invalid Open Agent Skills metadata, and missing attribution. Dependency cycles are allowed as availability groups, resolved with a visited set, and reported to maintainers.

## Vendor conversion

Vendor converters are repo-local maintainer tools that emit a common internal bundle manifest; they are not a public converter ABI. The ToolUniverse adapter:

- validates the pinned v1.3.1 submodule and complete 150-Skill audit inventory;
- admits 130 research Skills and excludes 20 setup, developer, router, SDK, and platform surfaces;
- classifies all 223 explicit Skill references as `required`, `related`, or `routing` with evidence;
- writes only reviewed `required` relations into the installation dependency graph;
- normalizes frontmatter and progressive disclosure, filters non-runtime resources, and adds compatibility and ResearchSpec authority guidance;
- generates per-Skill Apache-2.0 attribution, a conversion manifest, a report, hashes, and idempotence evidence.

Maintainer commands are:

```bash
pnpm tooluniverse:convert
pnpm tooluniverse:check
pnpm tooluniverse:idempotence
```

## Workspace selection and dependency resolution

Workspace intent contains domain IDs only:

```yaml
plugins:
  selected:
    - genomics-and-systems-biology
```

For every operation ResearchSpec computes the sorted union of each selected domain's direct Skills and transitive required dependencies. Multiple domains and dependency paths are deduplicated by global Skill ID. All configured Agent tools receive the same resolved set; adding a tool later backfills the current closure. Domain Skills add no command wrappers, so the fixed wrapper frontier remains eight wrappers on each of the 28 command-capable tools.

`tool-installation-manifest.json` records vendor/Skill file ownership and a resolution snapshot for each selected domain. Config is user intent; snapshots are derived recovery evidence.

## CLI lifecycle

```bash
researchspec plugin list [--installed]
researchspec plugin show <domain-id>
researchspec plugin install <domain-ids...>
researchspec plugin update [domain-ids...]
researchspec plugin uninstall <domain-ids...>
```

Normal list, install, update, uninstall, and status surfaces expose domains rather than vendor packages. `show` may expose vendor, release, revision, license, direct Skills, resolved dependencies, and provenance. `--installed` means explicitly selected domains, never domains inferred from dependencies.

Install and update are idempotent set reconciliation. Install without an Agent tool saves intent and returns a non-blocking warning. Update recomputes the graph from the current package. A selected unavailable domain blocks update but remains safely removable from its saved snapshot.

Uninstall first removes the selected domain from intent, recomputes the remaining closure, and deletes only no-longer-reachable files. Shared dependencies remain. Drift in any file scheduled for deletion blocks the entire transaction, and `--force` never deletes a user-modified file. Config and the installation manifest are committed after generated file operations, with the manifest last.

## Navigate integration

Navigate may recommend a semantically matching Skill only when it is in the resolved installed set. Recommendations remain advisory and do not create routes, subflows, work items, Gates, Decisions, receipts, or an alternate workflow state machine.
