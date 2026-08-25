## Context

Schema 2 already owns workflow state through frozen profiles and node instances. The remaining gaps come from metadata and behavior that are split across the routing catalog, generated profiles, CLI payload catalog, handlers, Quarto delivery helpers, and installed Skills. The design must close those gaps without creating a second graph authority or adding a public command.

## Goals / Non-Goals

**Goals:**

- Make every advertised graph entry and CLI payload executable through the current protocol.
- Keep routing meaning, graph execution, run state, and external delivery metadata under one owner each.
- Preserve deterministic, bounded, static read commands and zero-write failures.

**Non-Goals:**

- No schema 1 reader, migration, rollback, model integration, Quarto project support, dependency installation, or automatic run finalization.
- No new top-level command and no graph encoded in core runtime code.

## Decisions

### Route metadata is referenced, not copied

`GraphProfileEntry` gains `route_ref`. Converter-owned ARSU profiles require it; generic user/plugin profiles may omit it. Profile instructions resolve semantic fields from the routing catalog and executable fields from the profile. This keeps risk and cost in one catalog while ensuring routing prose cannot create an entry.

### The converter owns the complete academic pipeline

The academic-pipeline generator derives entries and subgraph bindings from the existing routing catalog and capability/profile sources. The profile declares formatting, final integrity, revision rounds, Gates, Decisions, and mid-entry nodes. Core frontier evaluation remains generic.

### Quarto execution stays outside read commands

The producer uses the existing probe and renderer. The CLI validates and records the existing delivery/probe shapes in start confirmation and frontier evaluation consults only that stored state. A later confirmed probe update uses the existing handoff/start input path rather than introducing an implicit background probe.

### Typed catalogs and handlers are reconciled at their narrowest valid surface

`show` remains limited to profile/run/node/change. Gate and Decision inspection uses `instructions`. Publicly declared change instructions, owner-scoped pack, cursor pagination, health summaries, and plugin confirmation are implemented rather than removed.

### Pagination is opaque and snapshot-bound

The cursor is a versioned base64url JSON envelope containing collection kind, last stable sort key, and a deterministic fingerprint of the collection input. The public contract treats it as opaque. A mismatch fails rather than silently restarting pagination.

### Completion readiness remains derived

The runtime continues to expose `completion_ready`; it does not write `run.status: complete` as a side effect of node advance, Gate confirmation, or status evaluation.

## Risks / Trade-offs

- [Generated profile expansion exposes latent binding errors] -> Validate every generated entry against route, capability, subgraph, Gate, Decision, and output-role registries before projection.
- [Health summaries can become unbounded] -> Reuse fixed caps and aggregate counts; keep diagnostic details in targeted check/doctor responses.
- [Cursor fingerprints can invalidate after any relevant workspace edit] -> Return a stable stale-cursor diagnostic and require the caller to restart the read.
- [Quarto metadata could duplicate manuscript facts] -> Reuse the existing manuscript delivery schema verbatim and store only the confirmed snapshot in run authority.
- [Handbook drift can survive handler fixes] -> Generate help and handbook only after catalog, payload, and handler tests agree.

## Migration Plan

1. Extend typed entry and run-confirmation contracts while retaining optional parsing for non-ARSU custom profiles.
2. Update converter-owned profiles and Skills, then regenerate their projections.
3. Reconcile CLI handlers and typed payloads, then regenerate handbook output.
4. Update behavior tests and run full graph, delivery, package, and acceptance checks.
5. No workspace migration is provided; only new schema 2 runs use the newly projected profile and confirmation fields, while active runs continue from their frozen graph.
