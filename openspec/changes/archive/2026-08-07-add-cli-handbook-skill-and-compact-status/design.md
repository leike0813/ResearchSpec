## Context

The command catalog already owns public command identity, syntax, options, and handbook rendering. Runtime validation is owned by existing Zod contracts and command handlers. Delivery currently treats the handbook as a Navigate-local generated reference. Status currently calls the all-target checker and embeds full query, diagnostics, history, and Adapter inspection data.

## Decisions

### Payload documentation SSOT

Extend the typed catalog with a command payload definition. A payload definition contains a stable kind, accepted transport (`yaml`, `json`, `scalar`, `list`, `selector`, or `none`), a concise shape string, field rows, allowed values, and cross-field constraints. The catalog covers every command entry, including explicit `none` definitions, so handbook/help completeness is mechanically checkable.

The renderer will format this metadata for the handbook, generated MDX pages, and Commander help. Runtime code continues to parse and validate with the existing schemas; documentation references those schema names and their observable constraints rather than introducing a second validator.

### Independent handbook Companion

Add `cli-handbook` to `COMPANION_WORKFLOW_IDS` and manifest workflow sources. Its description is intentionally broad: use it whenever an Agent uses, invokes, explains, inspects, troubleshoots, or modifies ResearchSpec CLI or workspace contracts. Its rendered `SKILL.md` contains the generated handbook body. Delivery loops over the normal Companion manifest only; no workflow receives a special reference file.

### Status projection

Introduce a typed `CurrentStatus` projection and a small summarizer layer. Status keeps workspace/schema/profile identity, spec counts, subflow counts and capped active instances, capped frontier/pending selectors, capped blocker summaries, aggregate Agent-tool projection counts, compact Adapter state, and diagnostic counts with directed detail selectors.

Growing collections use one fixed cap (`MAX_STATUS_ITEMS = 20`) and expose `total` plus `truncated`. Items contain only selectors and state needed to choose the next command. Status does not include history, full changes, complete controls, per-tool objects, Adapter tool ID arrays, file paths/hashes, or diagnostic details. `status` uses load-time diagnostics and static Adapter inspection to calculate `ok`/exit code; full validation remains with `check` and `doctor`.

The JSON envelope remains schema version `1`. For status, the top-level diagnostics array is empty and `data.diagnostics_summary` carries bounded counts and a `list diagnostics` selector; this prevents the generic envelope from reintroducing the unbounded diagnostic payload.

## Compatibility

The sixteen public commands and their mutation authority remain unchanged. Existing start and handoff schemas remain the runtime validators. Existing detailed query/check/doctor payloads are preserved. The fixed installed surface changes from ten to eleven Skills (and from seventeen to eighteen when the seven-Skill Adapter is selected), which requires regenerated manifests and updated package assertions.

## Verification Strategy

Add catalog completeness checks, help/handbook parity checks, schema-bound payload examples, independent Companion delivery assertions, and status projection tests with many tools/diagnostics/history items. Run the focused CLI, adapter, delivery, harness, package-verification, typecheck, build, and full test commands before marking tasks complete.
