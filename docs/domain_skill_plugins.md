# ResearchSpec Domain Skill Plugins

## Purpose and authority

Domain Skill plugins are ResearchSpec-maintained collections of Open Agent Skills. Users select stable domains; upstream vendors are maintainer concerns, not installation products. Plugin Skills may assist semantic research work, but they never own ResearchSpec routes, workflow profiles, stable specs, subflow controls, handoffs, Gates, Decisions, or transitions.

User runtime is offline with respect to plugin maintenance. Installation,
discovery, update, and validation read static assets distributed in the
ResearchSpec npm package and never clone an upstream repository, run a converter,
execute a bundled script, install dependencies, or configure credentials. A
target Agent may later invoke an admitted Skill resource under the user's own
execution environment and authority.

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

ToolUniverse v1.3.1 contributes 130 admitted Skills. Scientific Agent Skills
v2.53.0 contributes 49 reviewed, vendor-prefixed Skills after complete admission
decisions for all 147 audit records and finding-level decisions for all 40
manual-security targets. Materials-Science-Skills-For-LLM
`snapshot-fafd3ab` contributes seven curated Skills after resolving all twelve
audit records and all 24 admitted source files. FinRobot `snapshot-297a8d2`
contributes six neutral, capability-complete financial research Skills after
resolving all 146 source entries and 66 knowledge surfaces. HistAgent
`snapshot-47bbe21` contributes three independently authored, hash-approved
historical research Skills after resolving all 120 source entries and 21
admitted capability surfaces. Education Agent Skills `snapshot-32fce5c`
contributes 136 complete CC BY-SA 4.0 Skills after resolving all 165 admission
decisions, 872 evidence declarations, and 813 advisory relationships. Together
the six isolated vendor bundles populate 56 non-empty domains; users still
select only source-neutral domains.

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
        NOTICE or NOTICE.md
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

The Materials-Science-Skills-For-LLM converter independently:

- validates the pinned `snapshot-fafd3ab` source and complete 12-record admission catalog;
- admits seven `materials-science-skills-` Skills and excludes five for maintenance scope, private tooling, overlap, or privileged authority;
- publishes one complete Tier 1 Atomsk tree and six complete Tier 2 trees, each Tier 2 tree carrying one substantial conditionally read reference;
- maps 14 semantic capabilities to Agent procedures and nine execution capabilities to explicit user-configured external tools, with no bundled script or state authority;
- preserves all 24 source-file decisions as 22 source-to-authored-output adaptations and two exclusions, with per-Skill derivation and exact aggregate hash approval;
- classifies all seven audited relationships as advisory or source-excluded and emits no hard dependency;
- treats software, models, data, services, documentation, GPU, and HPC environments as reviewed external resources rather than provisioned assets;
- emits its isolated tree, bundle, manifest, and report.

The FinRobot converter independently:

- binds the archived immutable `snapshot-297a8d2` audit and the explicitly approved complete-tree hash;
- admits six neutral `financial-research-*` Skills as complete ResearchSpec-authored non-native trees;
- publishes four script-assisted Skills with tree-local deterministic Python entrypoints and two complete Agent-procedure Skills;
- excludes provider wrappers, AgentSpec JSON, dependency manifests, prompt factories, credential handling, and automatic network access;
- preserves reviewed calculations, forecasts, probability and sentiment analysis, targets, ratings, recommendations, and conclusions while rejecting embedded sensitive values and unresolved origins;
- publishes complete Apache-2.0 attribution, empty hard dependencies, derivations, its isolated bundle, manifest, and report.

The HistAgent converter independently:

- binds the archived immutable `snapshot-47bbe21` audit and approved complete-tree aggregate hash;
- publishes exactly three complete eight-file Skill trees through independent capability reimplementation;
- maps all 21 admitted surfaces to conventional commands while preserving five historical-source layers;
- keeps six sibling relationships advisory, all hard Skill dependencies empty, and Skill-local state outside ResearchSpec workflow authority;
- excludes Cookie material, telemetry, bytecode, unresolved browser code, benchmark payloads, unverified media, fixed credentials, and copied AutoGen/Magentic-One implementation.

The Education Agent Skills converter independently:

- binds the immutable `snapshot-32fce5c` audit, evidence map, production policy,
  license text, and approved complete-tree aggregate hash;
- admits 136 Gareth Manning Skills and excludes 19 original-framework Skills
  plus ten Sean Hu Skills whose redistribution authority is not established;
- preserves the complete educational body and declared input/output schemas
  while adding source-bound unresolved-evidence markers and reviewed learner,
  privacy, analytics, wellbeing, diagnosis, human-oversight, and ResearchSpec
  authority boundaries;
- publishes only static `SKILL.md`, CC BY-SA 4.0 `LICENSE`, and complete
  `NOTICE.md` files with empty hard dependencies;
- assigns the generated Skills only to `curriculum-and-pedagogy`,
  `education-systems`, and `specialist-studies-in-education`.

Each converter stages against all published vendors before central assembly and commits only its own projection plus the registry. Running one converter cannot replace another vendor's generated tree or bundle.

Converters and the assembler never execute upstream or generated scripts,
install dependencies, configure credentials, contact services, or grant
workflow authority. This inert maintenance boundary does not prohibit a target
Agent from invoking an admitted resource later in a user-configured environment.

## Workspace selection and dependency resolution

Workspace intent contains domain IDs only:

```yaml
plugins:
  selected:
    - bioinformatics-and-computational-biology
```

For each operation ResearchSpec computes the sorted union of selected domains' direct Skills and transitive required dependencies. Multiple domains and dependency paths are deduplicated by global Skill ID. All configured Agent tools receive the same resolved set; adding a tool later backfills the current closure. Domain Skills add no command wrappers, so the fixed wrapper frontier remains sixteen wrappers on each of the 28 command-capable tools when the configured delivery includes commands. The complete catalog contains 37 tools, and Codex plus the shared `.agents` target use one physical Skill tree.

`tool-installation-manifest.json` records vendor/Skill file ownership and a resolution snapshot for every selected available domain. Config is user intent; snapshots are derived recovery evidence retained while a selection is unavailable.

In schema 2 graph workspaces, `plugin install`, `plugin uninstall`, and `plugin update` reconcile the selected-domain Skill closure with the configured skill-capable Agent tools through the same generated-file ownership rules. `plugin instructions <skill-id>` succeeds only when the Skill belongs to the current available selected-domain closure and every configured skill-capable tool has the complete manifest-owned, hash-clean projection.

## CLI lifecycle

```bash
researchspec plugin list [--installed] [--summary]
researchspec plugin show <domain-id> [--summary]
researchspec plugin install <domain-ids...> [--summary] [--yes]
researchspec plugin update [domain-ids...]
researchspec plugin uninstall <domain-ids...>
researchspec plugin instructions <skill-id>
```

Normal lifecycle surfaces expose domains rather than vendors. `show` includes domain type, ANZSRC Group code where applicable, direct and resolved Skills, dependencies, vendor release, revision, licenses, and provenance. `--installed` means explicit workspace selections, including unavailable recovery entries; it never infers domains from dependencies.

`list --summary` returns compact domain identity, state, and direct/resolved counts. `show --summary` adds the direct and resolved Skill IDs, descriptions, dependencies, and packaged `SKILL.md` SHA-256 values needed for Agent-side semantic matching. Full views retain license and provenance detail. ResearchSpec does not score or recommend domains in the CLI.

Install and update are idempotent set reconciliation. Preview reports exact domain IDs, resolved Skills,
configured tools, and summarized write impact. Non-interactive installation requires explicit domain IDs
and `--yes`; interactive installation retains its confirmation prompt. Install without an Agent tool
saves intent and returns a non-blocking warning. Update blocks when a selected domain is unavailable.
Uninstall removes only projections no longer reachable from remaining selections; shared dependencies
remain. Drift in a file scheduled for deletion blocks the operation, and `--force` never deletes a
user-modified file. Config and manifest commit after generated operations, with the manifest last.

`plugin instructions <skill-id>` is a read-only immediate-activation bridge. It succeeds only when the Skill belongs to the current available selected-domain closure and every configured tool has the complete manifest-owned, hash-clean projection. The packet returns the exact packaged `SKILL.md`, its entry hash, resource paths, providing domains, projected tools, and an advisory authority boundary. It never executes bundled resources.

## Agent-assisted runtime integration

Navigate and the current ARSU producer evaluate optional plugin assistance at bounded semantic moments: a new or materially changed route, a newly ready work item, or an explicit specialist request. They query compact metadata, inspect only plausible domains, and recommend nothing unless one or more named Skills materially help the current research task.

For uninstalled assistance, the Agent proposes at most three domains in one batch, states the matching Skills and installation counts, and obtains consent separately from route confirmation. After the core Start is confirmed, the Agent previews the exact domain IDs, resolved Skills, configured tools, and write impact, executes only the explicitly confirmed domain set, then reloads plugin status. Installation authorizes static Skill projection only; it does not authorize network access, script or dependency execution, credentials, external services, or sensitive-data transfer.

An installed Skill remains a bounded advisory helper of the current ARSU producer. If the host has loaded it, the Agent may invoke it natively. Otherwise the Agent reads the exact current instructions through the bridge. The helper receives only the current task, necessary inputs, expected response, and forbidden ResearchSpec authority writes. Its result returns to the original ARSU producer for validation and integration; it is not itself a submitted workflow candidate.

An unavailable snapshot is recovery evidence, not an executable recommendation. Recommendations and invocations never create routes, subflows, work items, Gates, Decisions, receipts, frontiers, producers, or an alternate workflow state machine. Declining a suggestion is conversation context, not a Decision. Discovery, installation, activation, or invocation failure is non-blocking: report the unavailable augmentation and continue the same core ARSU route.
