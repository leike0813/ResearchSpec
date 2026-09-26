# Design

## Context

Prerequisite: apply 01-reorient-research-task-usage before implementing this change. The approved product plan retains one Navigate Skill, sixteen public commands and schema 2. The current adapters own entire files; installationKey is scope plus path. Reconciliation, legacy reconciliation and managed projection inspection consume installation hashes, so region support must reach every consumer rather than patching init alone.

## Goals / Non-Goals

Deliver concise research-entry instructions across the existing target catalog with honest capability differences. Protect shared user instruction files. Do not configure models, add hooks, edit global settings, claim that installation proves implicit invocation, or introduce another registry.

## Decisions

### Catalog and host targets

Extend ToolDefinition in src/adapters/tools.ts with entry metadata: mechanism (file, region or discovery), project-relative path and format when applicable, documented reference URL and checked date, and a scope/limitations note. Metadata describes installation, not live behavioral certification. Keep 36 target IDs unchanged.

Use these verified project targets in this change:
- codex: region in AGENTS.md; diagnose a nonempty root AGENTS.override.md as shadowing, without editing it.
- opencode: the same AGENTS.md region. Creating AGENTS.md can suppress an existing CLAUDE.md fallback: when AGENTS.md is absent and CLAUDE.md exists, leave files intact and report discovery-only degradation instead of creating AGENTS.md.
- gemini: region in GEMINI.md.
- claude: dedicated .claude/rules/researchspec.md, plain Markdown without path restrictions.
- cursor: dedicated .cursor/rules/researchspec.mdc with alwaysApply: true.
- github-copilot: region in .github/copilot-instructions.md; file-pattern rules alone cannot guarantee context before any file is opened.

All other catalog IDs, including the generic agents directory target, use explicit discovery metadata with no guessed project-rule path. List each target in the generated user matrix. “Discovery” means the currently delivered Skill or command, not “host has no rule support”. Record native-rule support as unverified for these targets. No provider/model runtime probes are performed.

Official sources checked 2026-09-26:
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://code.claude.com/docs/en/memory
- https://cursor.com/docs/rules
- https://geminicli.com/docs/cli/gemini-md/
- https://opencode.ai/docs/rules/
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions

### Shared entry body

One renderer owns a short working agreement: relevant academic requests in an initialized workspace discover current ResearchSpec capabilities without requiring the product name; use current status/instructions, respect existing governed runs, ordinary notes support continuity, unrelated work or explicit opt-out bypass routing, and formal/external consent is not granted by discovery.

Keep the same semantic body for all hosts. Include the actual delivered Navigate Skill path or command file path, calculated from the selected delivery mode; never reference a Skill absent in commands mode. For a shared target, deduplicate actual entry references from all selected hosts using that target. Do not paste the capability inventory into project instructions.

Update Navigate's description and invocation conditions at `src/adapters/companion/workflows/navigate.ts` to name natural literature, manuscript, evidence and review requests, including bounded tasks, rather than requiring framework vocabulary. The canonical Navigate workflow also owns the execution guidance used by command wrappers: `src/adapters/command-renderer.ts` must consume that guidance, with delivery-correct reference handling, instead of keeping a separately authored abbreviated mode policy. Commands-only delivery must expose the same continuity and collaboration behavior that changes 03 and 04 add to Navigate; it must not point at uninstalled Skill references. Preserve host command formatting and argument substitution. Reuse existing rendering and reference generators; add no second workflow registry or visible entry.

### Ownership and bytes

Add a project-entry source variant to ManagedInstallationSourceSchema with mode (file or region) and fixed region ID researchspec-entry for region records. Existing sha256 identifies exactly the owned bytes: the entire dedicated file or the inclusive marked region, never the surrounding shared file. ResolveManagedTarget must check the destination and mode against the catalog before reads; executable is false.

Use one pair of line markers, <!-- researchspec:begin researchspec-entry --> and <!-- researchspec:end researchspec-entry -->. The byte range begins at the begin marker and ends after the end marker's line ending if present. Preserve all bytes outside this range; do not normalize BOM, CRLF or whitespace. For appending to a file without a terminating newline, add one separator newline before the marker and leave it on removal. In a new shared file, create only the marked region; removal leaves an empty shared file, never deletes a potentially user-owned path.

No manifest record plus no markers permits append; markers without recorded ownership are a nonblocking conflict, even if identical to the desired text. Recorded region plus unchanged hash permits replacement/removal. Edited region, missing/duplicate/reversed/unpaired markers, or a nonempty file whose formerly owned region disappeared is preserved and diagnosed. A missing whole target can be recreated. Force never bypasses region ownership. Dedicated unowned/edited entry files are similarly preserved and warned about.

Build the next whole-file bytes from one read snapshot and use planDirectFileEdit/the existing transaction with its whole-file previousHash to detect races. Never reread then silently adopt a newer snapshot. Recheck existing trusted-root and descendant-symlink protections. Unsafe paths, symlinks and invalid manifests remain blocking; content collisions in optional entry instructions are nonblocking and must not suppress other safe projections.

Snapshot detection is the existing commit-preflight guarantee, not cross-process locking or crash atomicity. Preserve file mode during region edits. Represent optional content collisions as diagnostics with no actionable conflicting operation; `executeWritePlan` currently rejects every `conflict` operation. Preserve existing ownership evidence rather than recording desired bytes for content that was not installed.

### Shared selection and lifecycle

Group selected entry destinations by canonical project path before planning. Produce one operation and one installation record per destination; use the lexicographically first selected consuming tool as the representative tool_id. Desired bytes contain references for all current consumers. When that representative is deselected but another consumer remains, transfer representation without deleting the region. Remove an owned region/file only when no desired consumer remains and the recorded owned bytes match. Preserve drifted ownership records for diagnosis.

Apply the OpenCode fallback check to the grouped AGENTS.md destination: if any selected consumer would lose an existing CLAUDE.md fallback, defer creation of that shared destination for every consumer and diagnose the degradation. This avoids Codex creating the file indirectly after OpenCode declined it.

Keep installationKey at scope:path because each file contains at most one ResearchSpec-owned entry region. Generic whole-file removal must never handle a region record. Use one shared owned-byte extraction/hash helper in reconciliation and managed projection health checks; audit legacy reconciliation so it does not mistake a region hash for a whole-file hash.

### Inspection and compatibility

list tools adds entry metadata to each existing row. doctor adds bounded per-selected-target diagnostics for missing, unowned, drifted and malformed entry content plus documented static shadowing. The user-facing doctor output must show nonblocking findings as well as graph health; no binary execution, network calls or automatic repair.

Generate the host delivery matrix from the typed tool catalog, with separate documentation-backed mechanism and unverified runtime status. Behavioral evidence belongs to change 05; no hard-coded “verified” badge in runtime metadata.

The strict manifest remains version 1 with an added source union variant. Existing current manifests parse and update normally; older binaries may reject new source records, so documentation requires the current CLI after update. No compatibility reader, migration or rollback is added. Graph records and stable specs are untouched.

## Risks / Trade-offs

- Instructions are advisory and host settings may disable them -> separate static delivery diagnostics from live behavioral evidence.
- Shared files introduce ownership ambiguity -> markers plus manifest hash, byte-preserving edits and whole-file preconditions.
- Not every host has verified native rules -> explicit discovery fallback for every remaining registered target; never report unsupported from lack of investigation.

## Validation

Extend existing adapter, managed-target, write-plan and graph CLI tests with table-driven behavior cases. Exercise all target/mode combinations without static assertions on instruction prose. Test user bytes/line endings, idempotence, unowned markers, drift, malformed regions, shared selection transfer, last-consumer removal, shadowing and a concurrent file edit rejected before commit. Run types, focused tests, lint, generated-doc checks and packaged installation verification.

## Implementation files

- `src/adapters/tools.ts`: sole host-entry metadata catalog.
- `src/adapters/project-entry.ts` (new): the bounded entry renderer, owned-region extraction and entry planning; reuse existing write operations.
- `src/adapters/companion/workflows/navigate.ts`, `src/adapters/command-renderer.ts` and, where needed, `src/adapters/companion/render.ts`: natural-task discovery wording and a shared execution contract across delivery modes.
- `src/adapters/installations.ts`, `src/adapters/managed-target.ts`, `src/adapters/delivery.ts`, `src/adapters/workspace-delivery.ts`, `src/adapters/legacy-reconciliation.ts`: source validation, safe reconciliation and all affected hash consumers.
- `src/cli/handlers/graph.ts` and `src/cli/handlers/graph-bootstrap.ts`: entry metadata and bounded diagnostics through current handlers; share entry-owned-byte inspection with reconciliation. Keep plugin-only checks in `src/plugins/graph-check.ts` scoped to plugin sources.
- `scripts/generate-docs.mjs` and its catalog-driven renderer: generate the delivery matrix with the ordinary documentation outputs; update `docs/user/usage-model.md`, relevant adapter/developer documentation and `AGENTS.md` for the new installation authority.
- Existing adapter, managed-installation-path, write-plan and graph CLI tests: observable ownership, delivery and inspection regressions. No new instruction-text test suite.
