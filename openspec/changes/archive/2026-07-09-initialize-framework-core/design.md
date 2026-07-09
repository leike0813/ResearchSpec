# Technical Design

## Goals

Initialize ResearchSpec as a small, testable TypeScript CLI framework. The
implementation should make the documented file-contract workspace real while
leaving ARSU absorption, adapter delivery, and high-impact research decision
flows to later changes.

## Architecture

Use a direct TypeScript module split:

```text
src/
  cli/
    main.ts
    commands/
      init.ts
      status.ts
      check.ts
  core/
    workspace/
      discover.ts
      layout.ts
      templates.ts
    validation/
      check.ts
      parse.ts
  utils/
    fs.ts
    json.ts
tests/
  fixtures/
```

This layout is intentionally modest. It gives the framework clear seams for CLI
dispatch, workspace layout, and validation without introducing a runtime
database, adapter system, or converter layer.

## Package And Tooling

- Use pnpm as the intended package manager.
- Use TypeScript with strict checking.
- Compile source from `src/` into a generated output directory.
- Expose a package bin named `researchspec`.
- Keep dependencies minimal. A lightweight CLI parser and YAML parser are
  acceptable, but dependency installation is not part of the OpenSpec artifact
  creation step.

## Workspace Layout

`researchspec init --tools none` creates this skeleton:

```text
researchspec/
  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
    workflow.yaml
  runs/
    current/
      state.yaml
      artifact-registry.json
      decision-ledger.jsonl
      gate-ledger.jsonl
  changes/
  draft-patches/
```

Template rules:

- Markdown templates may contain short human-facing prompts.
- YAML/JSON templates must contain parseable minimal objects.
- JSONL ledgers may be empty files in the first slice.
- Templates must not invent research questions, claims, sources, manuscript
  structure, or ARSU artifacts.
- Existing files are never overwritten by default.

## CLI Commands

### `init`

`init` is the only writing command in this slice.

Supported behavior:

- `researchspec init [path]`
- `researchspec init --tools none`
- `researchspec init --tools none --dry-run`

The first slice may reject tool values other than `none` with a clear message,
because adapter delivery is a later change.

### `status`

`status` is read-only. It discovers the workspace and reports whether the
required skeleton exists. It should read `runs/current/state.yaml` when present,
but it should degrade cleanly if optional runtime details are not yet populated.

`--json` should emit a single object to stdout. This object is not yet a frozen
wire contract; it only needs to be stable enough for local tests and later
refinement.

### `check`

`check` is read-only. It validates:

- required directories and files exist;
- YAML files parse;
- JSON files parse;
- JSONL ledgers are either empty or contain one JSON object per non-empty line.

The first slice does not validate full field-level schemas from
`docs/contract_schema_design.md`. That belongs to later schema/validator
changes.

## Validation Model

Represent check results internally as structured diagnostics with:

- severity;
- code;
- message;
- path when applicable;
- blocking boolean.

Human output can be concise. JSON output can expose the same diagnostic list, but
the exact shape remains implementation-local until a later CLI wire spec freezes
it.

## Test Strategy

Use temporary directories for CLI and workspace tests.

Required scenarios:

- `init --dry-run` reports planned files and leaves the temp directory unchanged.
- `init --tools none` creates the full skeleton.
- Re-running `init --tools none` does not overwrite existing contract files.
- `status` reports missing workspace with an actionable message.
- `status --json` reports initialized workspace as one JSON object.
- `check` passes on a freshly initialized workspace.
- `check` reports missing required files.
- `check` reports invalid YAML, JSON, and JSONL files.

## Boundaries

Do not implement these in this change:

- ARSU converter or ARSU source ingestion.
- Adapter skill/slash-command generation.
- `decide`, `archive`, `pack`, `handoff`, `list`, or `show`.
- Full field-level schema validation.
- Gate transitions, artifact registration, or ledger append helpers beyond
  parse checks.
