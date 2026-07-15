# ResearchSpec Domain Skill Plugins

## Purpose and authority

Domain Skill plugins are ResearchSpec-maintained collections of Open Agent Skills. Users select stable domains; upstream vendors are maintainer concerns, not installation products. Plugin Skills may assist semantic research work, but they never own ResearchSpec routes, workflow profiles, work items, state, artifact registry, Gates, Decisions, transitions, or receipts.

User runtime is offline with respect to plugin maintenance. It reads static assets distributed in the ResearchSpec npm package and never clones an upstream repository, runs a converter, executes a bundled script, installs dependencies, or configures credentials.

Domain identity and taxonomy are canonicalized in [ResearchSpec Domain Taxonomy](./domain_taxonomy.md).

## Vendor and domain layers

The registry separates two many-to-many layers:

```text
upstream project                    stable user domain
      │                                     │
      ▼                                     ▼
vendor converter ──► vendor bundle/Skills ◄── source-neutral domain list
                              │
                              ▼
                    reviewed dependency graph
```

- A **vendor** pins an upstream release and revision, converts reviewed Skills, records Skill-level provenance and licenses, and owns required Skill dependencies.
- A **domain** owns a stable, versioned list of direct Skill IDs. One vendor may contribute to several domains, and one domain may contain Skills from several vendors.
- A **central assembler** validates all isolated vendor bundles against the source-neutral domain catalog and is the only writer of `skills/plugins/registry.json`.
- The same Skill may be a direct member of several domains. Its bytes and global Skill ID remain unique.

ToolUniverse v1.3.1 contributes 130 admitted Skills. Scientific Agent Skills v2.53.0 contributes 49 reviewed, vendor-prefixed Skills after complete admission decisions for all 147 audit records and finding-level decisions for all 40 manual-security targets. Together they populate 48 non-empty domains while remaining isolated vendor bundles; users still select only source-neutral domains.

## Registry and package layout

```text
skills/plugins/
  registry.json
  vendor-bundles/
    <vendor-id>.json
  vendors/
    <vendor-id>/
      <skill-id>/
        SKILL.md
        LICENSE
        NOTICE.md
        scripts/ references/ assets/ ...
  vendor-manifests/
  conversion-reports/
```

Registry Schema 1 contains `schema_version`, `domain_taxonomy`, `vendors`, and `domains`. A vendor records repository identity, release, immutable revision, root license, converter version, and its Skills. Each vendor Skill records a globally unique `skill_id`, applicable content `license`, reviewed `dependencies`, and upstream paths. A domain is a typed `discipline` or `tool` record with a stable ID, title, description, version, and direct Skills; discipline domains additionally retain `anzsrc_group_code`.

Validation rejects unsafe paths, duplicate IDs, base-Skill conflicts, unknown or self dependencies, invalid members, unreachable vendor Skills, invalid Open Agent Skills metadata, and missing attribution. Dependency cycles are finite availability groups: they are resolved with a visited set and diagnosed for maintainers.

## Fixed internal catalog and public availability

The internal catalog pre-creates all 213 ANZSRC Group domains and five ResearchSpec tool domains. Empty domains are valid internally so taxonomy identity does not depend on current vendor coverage. Public availability is derived only from a non-empty reviewed `skills` list.

Normal `plugin list`, direct `show` and `install`, JSON, status availability, checks, and Navigate hide or reject empty domains. A previously selected domain that later becomes empty or disappears remains visible only through installed status as `unavailable`; update blocks, while its saved manifest snapshot permits safe uninstall. Repopulating the same stable ID restores availability.

## Vendor conversion and assembly

Vendor converters are repo-local maintainer tools, not a public converter ABI. The ToolUniverse converter:

- validates the pinned v1.3.1 submodule and complete 150-Skill audit;
- admits 130 research Skills and excludes 20 setup, developer, router, SDK, and platform surfaces;
- classifies all 223 explicit references as `required`, `related`, or `routing` with evidence;
- places only reviewed `required` edges in the dependency graph;
- normalizes frontmatter and progressive disclosure, retains reviewed resources, and adds license, notice, compatibility, and authority guidance;
- emits only the ToolUniverse vendor bundle, Skill tree, manifest, and report before invoking central assembly.

The Scientific Agent Skills converter independently:

- validates the pinned v2.53.0 source and complete 147-record admission catalog;
- admits 49 Skills with `scientific-agent-skills-` IDs and excludes 98 after authority, redistribution, overlap, manual security, content, and domain review;
- validates the complete 40-Skill manual-review SSOT, applies only approved declarative adaptations, removes platform metadata, normalizes compatibility and tool declarations, discloses bundled scripts, and copies reviewed resource trees with 28 explicit exclusions;
- records all 22 audited relationships while allowing only admitted reviewed `required` edges to affect installation;
- emits its isolated tree, bundle, manifest, and report.

Each converter stages against all published vendors before central assembly and commits only its own projection plus the registry. Running one converter cannot replace another vendor's generated tree or bundle.

Converters and the assembler never execute upstream scripts, install dependencies, configure credentials, contact services, or grant workflow authority.

## Workspace selection and dependency resolution

Workspace intent contains domain IDs only:

```yaml
plugins:
  selected:
    - bioinformatics-and-computational-biology
```

For each operation ResearchSpec computes the sorted union of selected domains' direct Skills and transitive required dependencies. Multiple domains and dependency paths are deduplicated by global Skill ID. All configured Agent tools receive the same resolved set; adding a tool later backfills the current closure. Domain Skills add no command wrappers, so the fixed wrapper frontier remains eight wrappers on each of the 28 command-capable tools.

`tool-installation-manifest.json` records vendor/Skill file ownership and a resolution snapshot for every selected available domain. Config is user intent; snapshots are derived recovery evidence retained while a selection is unavailable.

## CLI lifecycle

```bash
researchspec plugin list [--installed]
researchspec plugin show <domain-id>
researchspec plugin install <domain-ids...>
researchspec plugin update [domain-ids...]
researchspec plugin uninstall <domain-ids...>
```

Normal lifecycle surfaces expose domains rather than vendors. `show` includes domain type, ANZSRC Group code where applicable, direct and resolved Skills, dependencies, vendor release, revision, licenses, and provenance. `--installed` means explicit workspace selections, including unavailable recovery entries; it never infers domains from dependencies.

Install and update are idempotent set reconciliation. Install without an Agent tool saves intent and returns a non-blocking warning. Update recomputes the current graph and blocks if any selected domain is unavailable. Uninstall removes only files no longer reachable from remaining snapshots; shared dependencies remain. Drift in any file scheduled for deletion blocks the whole transaction, and `--force` never deletes a user-modified file. Config and manifest commit after generated operations, with the manifest last.

## Navigate integration

Navigate may recommend a semantically matching Skill only when its domain is installed and available and its files are projected. An unavailable snapshot is recovery evidence, not an executable recommendation. Recommendations remain advisory and do not create routes, subflows, work items, Gates, Decisions, receipts, or an alternate workflow state machine.
