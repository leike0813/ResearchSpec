## Context

Current ResearchSpec owns outer route/subflow contracts while ARSU prose owns internal phases,
agent teams and checkpoints. `PipelineProfileSchema` is route-grained, not capability-grained.
The generated ARSU Skills are still 600–800 line upstream programs with injected preflight blocks.

`docs/ars_capability_taxonomy.md` already reduced 39 upstream agents to 34 capabilities and recorded
seven curation decisions (Q1–Q7). `docs/ars_extraction/` then produced 119 byte-faithful extraction
artifacts across milestones M1–M5. This change freezes the target contracts for the authoring stage:
ResearchSpec becomes the only execution-flow manager, capabilities become composable tools, and preset
graphs become data.

## Goals / Non-Goals

**Goals:**

- Make ResearchSpec the sole authority for legal next actions, state transitions and frontier order.
- Define a versioned capability package contract that prevents prose from carrying workflow authority.
- Define a versioned graph profile contract that composes capabilities, validators, Gates, Decisions,
  parallel groups, revision rounds and subgraphs without engine code changes.
- Reuse the 119 verified extraction artifacts as provenance-bound authoring inputs.
- Preserve human authority at run entry and at every formal Gate and Decision declared by the graph.
- Keep the public CLI at sixteen top-level commands and keep boundary deliverables outside `researchspec/`.

**Non-Goals:**

- Migrating, repairing or compatibly interpreting schema `"1"` workspaces.
- Making the CLI invoke LLM work; the CLI validates and writes state, the host Agent executes capability nodes.
- Shipping upstream ARSU prose as runtime flow carriers after the authoring milestones complete.
- Hand-maintaining capability packages; the authoring converter owns generated output.

## Decisions

### 1. Hard cut to workspace schema `"2"`

`researchspec/config.yaml` uses `schema_version: "2"`. A current workspace contains stable specs,
projected graph profiles, run instances (`runs/<run-id>/run.yaml`), node instances
(`runs/<run-id>/nodes/<node-id>.yaml`), run handoffs, changes and an installation manifest.
Schema `"1"`, subflow controls and unknown layouts are unsupported and never mutated.

The previous additive-migration approach was rejected because preserving subflow semantics would keep a
second flow authority alive next to the new graph engine.

### 2. One execution-flow owner, three actor classes

- **Engine** computes eligible nodes, node cards, Gate/Decision obligations and run completion.
- **Capability Skills** execute the current node procedure and submit outputs/evidence.
- **Host Agent** reads `status`, requests one node card, dispatches the named capability, and never
  chooses or invents a next step.

A capability Skill that says "continue to the next phase" is an authoring validation failure, not a
runtime override. Allowed next steps exist only in graph data and CLI output.

### 3. Run and node instance model

A `run` is a confirmed graph instance. Start confirms a profile entry, expected outputs, cost and
declared human gates, then freezes the profile bytes into the run. A `node` instance owns its own
state file; the run owns the frozen graph and the node IDs/rounds are derived from it.

Node states are `pending`, `eligible`, `complete`, `blocked`, `cancelled` and `skipped`. There is no
agent-owned "running" authority in the control plane: the Agent works from a read-only node card and
submits once. This keeps recovery stateless for the Agent.

### 4. Capability packages are atomic and typed

Each package is one capability: one manifest, one thin `SKILL.md`, referenced knowledge packs,
referenced validators, and provenance. Inputs and outputs use stable role IDs with schema references.
Variants that share a program (drafting document templates, R1/R2/R3 review perspectives, Socratic
personas) are parameter presets in the manifest, never cloned Skills.

The taxonomy Q1–Q7 decisions become schema invariants:

- one drafting capability with `document_template` presets;
- one specialist-review capability with a closed `reviewer_perspective` enum;
- Sprint blind pre-commitment becomes an engine-enforced promise/execution pair;
- P6 internal peer review becomes the optional self-check checker;
- orchestration agents are absorbed by the engine and never emitted as tools.

### 5. ARS four-way absorption

| Upstream ARS content | Target owner |
| --- | --- |
| Orchestrator routing/scheduling, state tracker, checkpoint/transition logic | `capability-graph-engine` |
| 39 agents deduplicated into 34 capability programs | Capability packages (`capability-manifest`) |
| Rubrics, standards, checklists, style and protocol references | Immutable knowledge packs inside capability packages |
| `check_*` scripts, verification gate, patch appliers, temporal verifiers | Deterministic validators declared in package manifests |
| Platform hooks, duplicated routing prose, model-tiering prose, upstream changelog/history text | Dropped or demoted to provenance |

No hard rule may exist only as prose. A package checker reports `capability_rule_without_validator`
when a mandatory rule in `SKILL.md` lacks a schema field or validator reference.

### 6. Extraction artifacts are reusable and stay the authoring source

The five milestones under `docs/ars_extraction/` are byte-faithful extraction artifacts, not runtime
Skills. Verification against the pinned `vendor/ars` snapshot currently reports:

| Milestone | Artifacts | SHA-256 pass | Fail |
| --- | ---: | ---: | ---: |
| M1 research | 16 | 16 | 0 |
| M2 writing | 15 | 15 | 0 |
| M3 integrity/review | 25 | 25 | 0 |
| M4 revision/finalize | 15 | 15 | 0 |
| M5 side branches | 48 | 48 | 0 |
| **Total** | **119** | **119** | **0** |

They remain useful in three ways:

1. **Authoring input**: each package manifest references the exact `CAP-*`/`KP-*` extraction IDs and
   the upstream path/line range. Authoring therefore starts from a verified byte snapshot instead of
   re-reading mutable upstream files.
2. **Knowledge/validator assets**: knowledge packs are curated from `KP-*`; script assets in M4/M5
   (`*.py`, degradation registry JSON) become validator entries after a deterministic policy review.
3. **Provenance audit**: the generated index (task 0.1) records ID, milestone, kind, source mapping,
   SHA-256 and pass status for all 119 artifacts, so `check capabilities` can prove provenance.

They cannot be shipped verbatim as runtime Skills because their bodies still contain upstream phase
flow. Authoring must split them into thin procedures plus graph facts.

### 7. CLI keeps sixteen commands and gains run/node selectors

No new top-level command is introduced. Existing commands extend selector families:

- `start profile:<profile-id>` creates one confirmed run and freezes the graph;
- `instructions node:<run-id>/<node-id>` returns exactly one bounded node card;
- `advance node:<run-id>/<node-id>` validates declared outputs and validators, then atomically marks
  the node complete or returns stable diagnostics without a state write;
- `decide gate:<run-id>/<node-id>` and `decide decision:<run-id>/<node-id>` remain separate human
  confirmations and never implicitly advance;
- `status --json` exposes run/node counts, the deterministic frontier, blockers and pending
  Gate/Decision selectors.

A `--dry-run` on `advance node:` runs submission validation without writing.

### 8. Preset graphs are converter-owned data

The converter authors preset graph profiles for the ARSU main chain and side branches. Profiles are
strictly validated against the capability registry. Users and plugins may add profiles that compose
registered capabilities, but they cannot redefine engine behavior or create prose-only edges.

Parallelism is expressed as `parallel_groups` with `all`/`any` join policy. A `subgraph` node binds
another validated profile and its input/output roles. Revision loops use a repeatable node pair plus a
continue/exit Decision; no graph may express an unbounded implicit loop outside that template.

### 9. Validators are first-class and isolated

Validators have a manifest (`schema`, `script` or `policy`), typed input/output, stable error codes
and an explicit interpreter contract for scripts. Script validators are invoked only by the CLI with
declared arguments, never through shell interpolation. Network-dependent validators declare `network:
true` and a degraded verdict (`unresolvable`) that is never equal to `pass`.

## Risks / Trade-offs

- **The graph engine could become a new rigid monolith.** Mitigation: DAG + explicit revision-round
  template only, `optional`/`observer` nodes, subgraph composition, and user-extensible profiles.
- **Authoring 34 capabilities is large.** Mitigation: milestone order M1 → M2 → M3 → M4 → M5, with the
  M1 vertical slice (RQ → methodology → literature → grading → synthesis → report) implemented first.
- **Per-node files may be noisy for small tasks.** Mitigation: a run can declare a small preset graph;
  `status` is bounded and `instructions` returns one card at a time.
- **Model output quality still varies.** The engine stabilizes state and contracts, not prose quality;
  validators and Gates make failures visible and blocking where declared.
- **Old workspaces are rejected.** This is deliberate pre-1.0 debt removal. Users re-enter selected
  external files through stable specs or handoffs in a fresh workspace.

## Migration Plan

No runtime migration. After all tasks pass, release switches directly to schema `"2"` workspaces and
capability-based delivery. Existing schema `"1"` workspaces remain byte-unchanged and unsupported.
Rollback is source-control rollback of the unreleased implementation.

## Open Questions

- Exact final fixed user-visible Skill surface after authoring (preserved ARSU Skill IDs vs. generated
  capability IDs) is not frozen in this change; it is locked in task 4.3 after the M1 package shape is
  proven.
- Whether legacy anchor-injected ARSU Skills remain temporarily installable during the authoring
  transition is deferred to task 7.1; both paths must never coexist as flow authorities in one run.
