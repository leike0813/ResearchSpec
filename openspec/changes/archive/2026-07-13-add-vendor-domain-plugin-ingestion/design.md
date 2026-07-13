## Context

Registry Schema 1 currently stores package sources and installable plugins in one structure. A plugin owns both provenance and its Skill list, so a ToolUniverse split would expose vendor names, duplicate domain facts, and leave cross-domain references unresolved. The ToolUniverse v1.3.1 audit pins 150 upstream Skills, admits 130 research candidates, excludes 20 maintenance surfaces, and records 223 candidate-to-candidate references.

The registry has not shipped with production plugins, so its Schema 1 shape can be corrected without a migration. User runtime must remain offline and must never execute vendor scripts or install their dependencies.

## Goals / Non-Goals

**Goals:**

- Separate vendor conversion/provenance from stable domain selection.
- Admit all 130 audited ToolUniverse candidates through one deterministic vendor converter.
- Install domain members plus reviewed hard dependencies idempotently across all configured Agent tools.
- Preserve shared dependencies, drift protection, retired-domain removal, and manifest-last transactions.
- Keep domain identities stable and vendor-neutral while retaining inspectable provenance.

**Non-Goals:**

- A public converter ABI, remote catalog, vendor self-registration, or runtime source checkout.
- Vendor-neutral renaming of individual ToolUniverse Skill IDs.
- Script execution, dependency installation, credential setup, or scientific revalidation of upstream outputs.
- New wrappers, workflow profiles, routes, work items, Gates, Decisions, or receipts.

## Decisions

### Registry Schema 1 becomes a vendor/domain aggregate

`registry.json` contains `vendors` and `domains`. A vendor owns immutable upstream identity and globally unique Skill definitions; a domain owns a stable versioned direct Skill list. Skill bytes live at `skills/plugins/vendors/<vendor-id>/<skill-id>`. Domain lists may overlap and never duplicate those bytes.

The distributed registry is generated from converter-owned vendor bundle manifests plus an author-owned domain catalog. This supplies a common internal bundle contract without requiring vendor converters to share implementation code or exposing a public converter ABI.

### Domain intent and resolved state stay separate

`config.yaml` stores only selected domain IDs. A pure resolver computes the sorted transitive Skill closure. The installation manifest stores vendor ownership for each file and a per-domain resolution snapshot. Snapshots allow shared-dependency reconciliation and safe removal of a selected domain that later disappears from the bundled registry.

### Required dependencies are reviewed facts

The ToolUniverse adapter extracts every explicit Skill reference with source evidence. A checked-in decision catalog classifies each edge as `required`, `related`, or `routing`. Only explicit mandatory prerequisite/delegation edges classified `required` enter the runtime registry; ambiguous edges default to `related`. Unknown or unclassified extracted edges block conversion.

Dependency cycles are valid availability groups rather than execution ordering. Resolution uses a visited set; self-dependencies and unknown targets are invalid. Checks report cycles for maintainers.

### Three fixed domains own explicit membership

The domain catalog defines `translational-medicine-and-therapeutics`, `genomics-and-systems-biology`, and `molecular-and-organismal-biosciences`. Membership is seeded from the nine audit domains, reviewed secondary domains, six shared research-method Skills, and eight agreed object/modality overrides. The converter validates the catalog but cannot create or edit domains.

### ToolUniverse conversion is deterministic and non-executing

The converter validates the pinned submodule and audit inventory, normalizes frontmatter, applies reviewed overrides, filters non-runtime resources, adds compatibility and authority guidance, and generates per-Skill license/notice files. It records every file disposition and never executes copied scripts. Conversion outputs include hashes, a vendor bundle manifest, a human report, and idempotence evidence.

### Domain lifecycle reconciles closures, not vendor packages

List/install/update/uninstall/status accept or display domains. Delivery resolves the union of selected domains once and projects each Skill once per tool. Uninstall removes only files unreachable from remaining domain snapshots; drift in any file scheduled for deletion blocks the whole transaction. Vendor provenance remains available in `plugin show` and structured diagnostics.

## Risks / Trade-offs

- **Large initial conversion surface** → Require complete audit admission, file disposition, dependency classification, deterministic regeneration, and focused overrides before registry assembly succeeds.
- **Dependency edges may be semantically ambiguous** → Default ambiguity to non-installing `related`; require evidence for every `required` edge.
- **Overlapping domains produce large direct sets** → Deduplicate by global Skill ID and report direct versus resolved counts.
- **Future vendor collisions** → Reject duplicate global Skill IDs until a deliberate vendor-neutral capability alias model is designed.
- **High-stakes upstream Skills** → Inject explicit evidence/advisory boundaries and keep ResearchSpec workflow authority unchanged.
- **Unpublished fixture shape changes broadly** → Replace Schema 1 fixtures and tests together; no compatibility branch is retained.
