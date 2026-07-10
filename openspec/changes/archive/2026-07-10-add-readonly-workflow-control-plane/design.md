## Context

ResearchSpec separates stable research contracts, runtime records, proposed changes, generated Skills, and tool adapters. Before this change, the workflow contract described stages but not executable work-item dependencies, and `status` could only summarize raw state. Companion Skills therefore had to infer the next ARSU Skill and its inputs from static guidance, while ordinary ARSU artifacts had no deterministic read-side protocol comparable to OpenSpec's status/instructions loop.

The implementation must remain file-based and agent-neutral. It must preserve existing `arsu-paper` workspaces, reuse the current JSON envelope, avoid runtime LLM dependencies, and stop before artifact submission or state transition semantics are designed.

## Goals / Non-Goals

**Goals:**

- Define a typed workflow-node contract that is shared by initialization, snapshot validation, status evaluation, and instructions.
- Provide a deterministic, read-only work-item frontier with trustworthy artifact completion checks.
- Exercise the protocol through one explicit ARSU research Slice without presenting it as the complete paper pipeline.
- Make `researchspec-next` consume CLI facts rather than reproduce the graph or producer mapping.
- Preserve legacy workspaces and existing status fields.

**Non-Goals:**

- Submit or register candidate artifacts.
- Append ledgers, transition stages, or modify run state.
- Model optional, waived, or not-applicable dependencies.
- Convert the full ARSU pipeline or rewrite all companion and ARSU Skills.
- Treat file existence alone as workflow completion.

## Decisions

### Use the workflow contract as the graph source of truth

`specs/workflow.yaml` may contain typed `work_items`. Each node declares its stage, producer Skill, required work items/contracts/artifact types/gates/decisions, candidate output, validation profile, allowed writes, and completion policy. Zod schemas and inferred TypeScript types live together; layout templates and runtime evaluation consume that model rather than maintaining parallel field definitions.

Alternative considered: keep the graph in companion Skill text. Rejected because Skills would duplicate state semantics and could not provide a deterministic cross-session frontier.

### Introduce an explicit Slice profile instead of changing the default

`arsu-research-slice` contains RQ Brief, Bibliography, and Synthesis nodes in one `research` stage. It is selected explicitly through `init --profile`; the default `arsu-paper` profile remains unchanged. Existing workspaces cannot switch profiles through `init`, because doing so would silently replace user-owned workflow and state contracts.

Alternative considered: add three nodes to `arsu-paper`. Rejected because a partial research graph would be mistaken for the complete paper workflow.

### Share one asynchronous evaluator across status and instructions

Workflow evaluation loads the typed snapshot, validates the graph, inspects artifacts, resolves dependencies, and derives `done`, `ready`, `blocked`, warnings, and unlocks. `status` and `instructions` call this same evaluator. Status becomes asynchronous, and the existing handoff and pack consumers await it.

Alternative considered: let handlers and Skills compute readiness separately. Rejected because it would create competing facts for the same frontier.

### Require registered, hash-matched evidence for completion

A work item is done only when a matching registry entry points to the expected artifact type/path, the file remains inside allowed roots, SHA-256 matches, required artifact/verification states match, and completion gate IDs have passed. An unregistered candidate remains ready and receives a `candidate_unregistered` warning. A registered but missing or drifted output is blocked.

Alternative considered: use output-file existence like OpenSpec. Rejected because research completion requires auditable evidence and must detect drift.

### Keep the control plane read-only

`instructions work:<id>` returns context, rules, dependency paths, output path, template, validation, completion policy, and `submit_available: false`. It never writes runtime files. When every node in the active Slice stage is done, status reports `stage_work_complete` and `transition_required` without changing the run or declaring the workflow terminal.

Alternative considered: include artifact submit and stage transition in the same change. Rejected because that would prematurely freeze receipt, idempotency, conflict, and atomic multi-file write semantics.

### Resolve templates through packaged ARSU logical references

The profile uses `ars:shared/handoff_schemas.md#...` references. Instructions resolve the requested Markdown section from the packaged `deep-research` shared schema, avoiding copied workspace templates and keeping converter-owned ARSU content authoritative.

### Extend, rather than version, the existing CLI envelope

The JSON envelope remains schema version `1`. Existing status fields are retained and a single `workflow_control` object is added. Work items use canonical `work:<safe-id>` selectors, and invalid selectors, unavailable graphs/resources, blocked items, and completed items return stable error codes.

## Risks / Trade-offs

- **The Slice is intentionally incomplete** → It has a distinct profile name, no terminal stage, and reports a transition boundary rather than workflow completion.
- **Status now performs filesystem/hash work** → Artifact inspection is centralized and asynchronous, preventing duplicate checks while keeping the current local-file scale acceptable.
- **Packaged template paths can drift** → Resolution is constrained to one supported ARS logical namespace and fails with `workflow_resource_unavailable`.
- **Legacy workspaces gain no dynamic frontier automatically** → They remain valid with `configured: false`; migration must be explicit and must not overwrite user contracts.
- **Candidate artifacts cannot be submitted yet** → Instructions expose `submit_available: false`, making the boundary machine-readable instead of implying completion support.

## Migration Plan

1. Keep `arsu-paper` as the default profile and parse missing `work_items` as a valid unconfigured graph.
2. Allow new workspaces to opt into `arsu-research-slice`; create only derived output directories, not empty artifacts or template copies.
3. Extend status and instructions without changing envelope version or existing status fields.
4. Require explicit future contract migration before an existing workspace can change profiles.
5. If the Slice must be rolled back, remove the optional profile and instructions surface; legacy `arsu-paper` workspaces remain unaffected.

## Open Questions

None for this change. Artifact submission, receipt/registry transactions, stage transition, and optional dependency states are intentionally deferred to a subsequent change.
