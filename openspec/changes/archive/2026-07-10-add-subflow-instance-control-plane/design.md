## Context

The current control plane reads one loose `state.yaml`, evaluates top-level workflow work items against a single `active_stage_id`, and identifies outputs by a globally unique `work_item_id`. This is sufficient for the three-work research Slice but cannot safely instantiate the same logical work in multiple standalone subflows or revision rounds. Artifact Submit is already hash-bound and receipt-backed, so the next layer should scope that protocol rather than introduce another registry or workflow engine.

The canonical user model fixes one active run per workspace, route confirmation before start, CLI-owned frontier, workflow-declared parallelism, automatic candidate registration, and user-confirmed formal Gates. Routing facts already live in the converter-owned ARSU catalog. Gate and transition transactions remain separate future changes.

## Goals / Non-Goals

**Goals:**

- Define strict instance-enabled workflow and run-state contracts while retaining legacy workspace reads.
- Make subflow templates and instances addressable through one selector protocol.
- Atomically start a confirmed route and preserve parent/round/start basis evidence.
- Evaluate scoped work and all/quorum parallel joins without hard-coding ARSU modes in core.
- Reuse Artifact Submit with instance provenance and start-delegated automatic registration.
- Demonstrate the protocol by converting the opt-in research Slice to explicit start semantics.

**Non-Goals:**

- Gate verdict submission, transition execution, terminal run semantics, Navigate, or complete route graphs.
- Automatic prerequisite expansion or semantic route selection.
- Migrating or rewriting existing `0.1` workspaces.
- Removing current Companion Skills or changing adapter delivery counts.

## Decisions

### `state.yaml` remains the only run-state SSOT

Instance-enabled state uses Schema `0.2` and a strict `subflows` array. Keeping instances beside run lifecycle avoids an eventually inconsistent `runtime.json`. Legacy `0.1` state remains a separate accepted shape; commands do not rewrite it unless the user invokes an authorized transaction supported by that shape.

### Workflow uses a legacy/instance union

Legacy workflows retain top-level stages/work items. Instance workflows contain strict `subflow_templates`; each template owns stages, work items and parallel groups. Template output paths permit only known placeholders and are resolved and revalidated after an instance exists. The experimental Slice declares partial route coverage so it cannot be mistaken for a complete `deep-research:full` profile.

### Selectors show instance scope explicitly

Templates use `subflow:tpl-*`, instances use `subflow:sf-*`, and instance work uses `work:<instance>/<node>`. This keeps logical node IDs stable across rounds while making provenance and error messages unambiguous. Unscoped `work:<id>` remains legacy-only.

### Start confirmation is hash-bound and receipt-backed

Subflow instructions hash the exact route summary/template/prerequisite view. Start input references that instruction hash. Dry-run derives a semantic plan hash, instance ID and receipt; execution requires the same plan hash plus `--yes` outside a TTY. The receipt is created before state is refreshed, and state records its path/hash. Exact orphan receipts are recoverable; divergent receipts or basis drift are conflicts.

The start receipt is operational evidence, not an academic artifact, so it is not registered in the artifact registry.

### Catalog prerequisites are evaluated, not copied

Contract and artifact requirements are verified from the workspace. User-input requirements are acknowledged by safe ID in strict Start input; their semantic content remains in contracts/artifacts or conversation, not state. Accepted decision requirements are verified against explicit decision IDs. Missing groups expose catalog fallback route refs but are never auto-started.

### Parallel groups constrain dispatchable frontier

Work state remains `done/ready/blocked`, with an additional `dispatchable` flag. For `all`, every required member must be done; for `quorum`, the configured count must be done. Status exposes at most `max_concurrency` ready members per group and marks the remainder capacity-deferred. Group dependencies participate in cycle validation and downstream readiness.

### Start delegates only automatic work registration

Each instance work node declares `automatic` or `manual`. A valid start receipt authorizes automatic nodes to run the existing Submit dry-run/hash-bound commit sequence without another user prompt. It does not authorize content changes, Gates, Decisions or transitions. Candidate and receipt records add instance scope; legacy records and manual confirmation remain readable and executable.

### Converter guidance owns Agent behavior

The generated preflight block is upgraded to v2. It consumes scoped instructions and performs direct automatic Submit only when the packet proves a valid start authorization; otherwise it hands off to the existing Submit Companion. Converter regeneration remains the only way to change generated ARSU trees.

## Risks / Trade-offs

- **Partial Slice route could be mistaken for a full mode** → expose `route_coverage: partial`, covered outputs and a stable warning in instructions/status.
- **State grows with repeated rounds** → store only identities, hashes and lifecycle facts; semantic payloads remain artifacts/contracts.
- **Parallel capacity has no work lease** → status deterministically limits the dispatchable frontier; work leasing is not introduced implicitly.
- **A caller could falsely name a confirmer** → persist the claimed human identity and exact instruction/plan hashes; stronger identity is outside a local file CLI.
- **Core imports converter-owned routing data** → consume only the dependency-free routing module and keep it the single route SSOT.
- **Old and new runtime shapes increase validation complexity** → use explicit Zod unions and isolate legacy evaluation instead of optional-field branching throughout runtime code.

## Migration Plan

New `arsu-research-slice` initializations write `0.2` workflow/state contracts. Existing `0.1` workspaces continue through the legacy evaluator and unscoped Submit. No automatic conversion is attempted. Default `arsu-paper` remains unchanged. A later explicit migration may convert old Slice workspaces if needed.

## Open Questions

None. Gate/transition packets and complete route templates are deliberately delegated to their subsequent changes.
