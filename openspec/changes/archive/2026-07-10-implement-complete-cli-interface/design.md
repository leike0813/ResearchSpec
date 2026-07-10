## Context

The current CLI is a small hand-written dispatcher whose commands print directly
to process streams. Workspace templates, required-file lists, simplified YAML
parsing, and command-specific JSON outputs are separate facts. This is adequate
for the first framework slice but cannot safely support ten commands, interactive
tool delivery, high-impact decisions, or deterministic derived artifacts.

The CLI remains a local file orchestrator. It cannot invoke an LLM, execute ARSU
semantic workflows, hide human decisions, or make converter maintenance public.
The bundled OpenSpec 1.5.0 checkout is an implementation reference only.

## Goals / Non-Goals

**Goals:**

- Expose the complete documented public command surface through one typed command
  context and one output/error contract.
- Make workspace loading, item selection, validation, and write planning shared
  application services instead of command-specific file logic.
- Deliver all OpenSpec-supported agent tools while preserving ResearchSpec's
  stricter ownership and drift protection.
- Keep research contracts, runtime ledgers, generated files, and rendered views
  distinct and auditable.

**Non-Goals:**

- Running agents, LLM APIs, ARSU semantic workflows, converter/upstream sync, or
  telemetry.
- Replacing file contracts with a database or platform-specific state.
- Letting `--force` or `--yes` accept high-impact research decisions.
- Freezing shell completion behavior in this change.

## Decisions

### Use a typed command boundary and a single presenter

Commander defines commands/options and produces a `CommandContext` containing
resolved cwd/workspace, output mode, write flags, and terminal capabilities.
Handlers return `CommandResult<T>` and never write to process streams. One
presenter owns process output and emits human output or a versioned
`CliEnvelope`; interactive prompt rendering remains isolated in the prompt
module.

Alternatives considered: extending the current Map parser would duplicate usage
validation and cannot reliably model option conflicts or nested command help.

### Use stable error categories

Expected failures use `CliError` with code, exit class, diagnostic details, and
optional hint. Exit classes are 0 success, 1 domain-blocked, 2 usage/selection,
3 write/I/O conflict, and 4 unexpected internal failure. JSON mode emits exactly
one envelope to stdout for success and expected failure; human diagnostics use
stderr. Quiet mode suppresses nonessential human progress only.

### Load one workspace snapshot

`loadWorkspaceSnapshot` parses config, contracts, state, registry, and ledgers
once and exposes indexed changes, patches, artifacts, gates, decisions, tools,
and contract aliases. Status, check, list, show, handoff, pack, decide, and
archive consume this snapshot so they cannot disagree about file state.

Canonical selectors are `change:`, `patch:`, `artifact:`, `gate:`, `decision:`,
`source:`, `claim:`, `tool:`, and `contract:`. A bare ID is accepted only when it
has one match across all indexes.

### Make template definitions and write plans authoritative

One `WorkspaceTemplateDefinition[]` owns path, type, default content, and
overwrite policy. Required-file and parser lists are derived from it.

Every writing command first builds a `WritePlan` of create/update/delete/skip
operations with scope, ownership, prior hash, next hash, and reason. Preflight
must succeed before writes begin. Files are staged beside their targets and
renamed into place; user contracts are create-if-missing, while generated files
are writable only when manifest-owned. The installation manifest is committed
last. Decision application appends the decision ledger last so an accepted
decision never precedes its validated contract/artifact updates.

### Separate tool intent from generated ownership

`researchspec/config.yaml` is the user's local selection SSOT. The generated
`tool-installation-manifest.json` records package/adapter versions, paths,
scopes, source assets, and hashes. Unknown existing paths are user-owned;
manifest-tracked drift is preserved unless `--force` is explicit.

The registry contains the 31 selectable OpenSpec tools. Twenty-eight have
command adapters; ForgeCode, Kimi, and Mistral Vibe are skills-only. Tool-neutral
wrapper payloads are rendered through per-tool formatters because TOML,
frontmatter, argument injection, and path conventions differ. The four ARSU
skill trees are copied recursively.

Codex prompts are shared-global under `$CODEX_HOME/prompts` or
`~/.codex/prompts`. They are workspace-neutral, shown separately in previews,
never deleted when one project deselects Codex, and may be written
non-interactively only when Codex was explicitly selected.

### Keep interaction deterministic outside a TTY

Interactive init uses searchable multi-select. Configured tools sort first and
are preselected; on first init detected tools are preselected; on reconfigure,
newly detected tools are shown but not selected automatically. Non-TTY and JSON
modes never prompt. Tool expressions accept `all`, `none`, or a deduplicated
comma list and reject mixtures.

### Treat handoff and pack as derived views

Handoff renders from the snapshot and defaults to
`runs/current/handoff.md`; `--stdout` performs no write. Pack creates a
deterministic ZIP with normalized order/timestamps and a SHA-256 manifest.
Neither command changes workflow semantics, decisions, or stage.

### Keep decision and archive policy explicit

`decide` accepts `accept`, `reject`, or `postpone`, plus a named human actor and
reason where required. Accept applies only a schema-valid proposed patch;
reject/postpone leave stable specs unchanged. `archive` resolves state from the
decision/gate ledgers and moves only resolved changes or draft patches to dated
archive directories without rewriting historical ledgers.

### Add focused dependencies

Use `commander`, `@inquirer/core`, `@inquirer/prompts`, `chalk`, `ora`, `yaml`,
`zod`, and `fflate`. Do not add telemetry, runtime agent launching, or broad
filesystem glob dependencies. Substantial code adapted from OpenSpec retains
MIT source attribution.

## Risks / Trade-offs

- [Large command surface can create duplicate rules] → Route commands through
  snapshot, selector, write-plan, presenter, and adapter registries as SSOTs.
- [Multi-file writes are not a native filesystem transaction] → Preflight all
  operations, stage writes, commit authoritative ledgers/manifests last, and
  report a recovery diagnostic if rollback cannot fully restore prior files.
- [Global Codex prompts can affect other projects] → Treat them as shared-global,
  require explicit non-TTY selection, and never project-delete them.
- [Tool ecosystems change] → Version the registry and test paths/formats as data;
  the OpenSpec checkout is a pinned design baseline, not a runtime dependency.
- [A full TUI is difficult to process-test] → Keep selection as an injected port
  and cover only essential process-level terminal behavior.

## Migration Plan

1. Introduce the typed CLI boundary while preserving the existing three command
   behaviors through the new presenter.
2. Add config/manifest templates as create-if-missing metadata; never rewrite
   existing research contracts.
3. Add snapshot/read commands, then derived views and decision/archive services.
4. Add the adapter registry and route init/update through the shared write plan.
5. Align documentation and run strict OpenSpec, build, lint, test, converter, and
   idempotence checks.

Rollback consists of reverting code/templates while leaving newly created user
workspace metadata in place; older CLI versions ignore those files.

## Open Questions

None. Public contracts and defaults are fixed by this change.
