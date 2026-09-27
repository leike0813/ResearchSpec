# Design

## Context

Change 05 stores 18 natural-task scenarios in `playbooks/dogfooding/scenarios.yaml` and 144 curated session records. The temporary runner hard-coded model IDs and workspace paths; raw streams live under `/tmp`, and the scorer used heuristics. The existing Skill Browser binds `0.0.0.0`, so it cannot safely serve raw host evidence. The runtime tool catalog already owns all target IDs, including the non-runnable shared `agents` target.

## Goals / Non-Goals

**Goals:** One repeatable all-target init matrix, a single-host natural behavior suite with configurable models, Orca terminal provenance, sealed local evidence, live local review and validated human import.

**Non-Goals:** Running Agent behavior on every target; proving native host invocation through static checks; automatic release authorization; a new public ResearchSpec command or general provider API.

## Decisions

### Campaigns and configuration

`pnpm dogfood` is a repository-only Node entrypoint. Every campaign checks all targets from the built tool catalog in `skills`, `commands` and `both` delivery modes, including shared `agents`. Each static case initializes a fresh temporary project and records CLI output, manifest, projected files and structured checks without a host binary, model or Orca. Optional `--behavior-host` selects exactly one runnable adapter and requires an explicit model and assessor configuration. `natural-18` runs twice per scenario by default. Campaign selection, build hash and scenario bytes are frozen; source drift requires a new campaign.

### Orca execution and isolation

After the static matrix passes, the coordinator launches the selected behavior worker through `orca-ide terminal create` in the registered ResearchSpec worktree, then watches its sealed evidence record and closes its Orca terminal. The worker stages an independent `/tmp` project, runs the local built CLI for `init` and fixture setup, and launches the configured host inside a Linux bubblewrap boundary. Host programs receive a private scratch area and state, required read-only program/auth paths, the one writable project and network access. The source checkout is exposed only through required runtime trees; sibling test projects and prior conversation stores are hidden. Preflight refuses execution if isolation cannot be established. Behavior attempts are serial and never auto-retry service errors or failed behaviour.

### Evidence and live page

Campaign state lives under `$XDG_STATE_HOME/researchspec/dogfooding` unless `--state-dir` is supplied. Static cases keep separate reports and projected-file evidence. Each behavior attempt streams raw stdout/stderr and normalized events to its own directory; atomic JSON state updates seal final inventories, output files, status/check results and an evidence digest. A separate Node HTTP server binds only `127.0.0.1`; it exposes bounded GET routes for campaign, matrix reports, behavior reports, exact evidence locations, incremental events and allowlisted files, plus one same-origin token-protected human-review POST. The page polls every two seconds and reads details for only the selected item. The server starts after build and preflight, before the first case, and stops when `run` exits; `serve` reopens a saved campaign.

### Review and reporting

The assessor has its own configured host/model, fresh session and isolated scratch project for each selected-host behavior attempt. An Orca terminal runs it against read-only sealed evidence. The Agent writes a structured draft; the harness verifies the report shape, evidence references and that any pass suggestion meets the deterministic rubric. Reports, assessment traces and status live outside the sealed attempt tree and bind to its evidence digest. `assess` retries missing/failed reports for current campaigns; incomplete evidence is explicit and cannot yield a pass suggestion. The page shows the static matrix first and a report-first behavior queue with exact evidence drilldown.

The browser keeps drafts keyed by report and evidence digest. A same-origin, token-protected POST saves only an evidence-bound human review, using the same validator as `import-review`. An explicit amendment requires a reason and retains prior review history. `invalid` and `interrupted` attempts never count. A scenario passes only with two independent valid reviewed passes; an observed failure remains after retry. `report` previews by default; explicit `--write` creates curated, redacted evidence. Legacy import is read-only. Full static coverage plus a complete human-reviewed `natural-18` suite on one host meets this part of the release gate; behavior conclusions never transfer to untested hosts.

## Risks / Trade-offs

- Host credential layouts differ → each adapter has a bounded preflight; no fallback to an unisolated process.
- Source changes between interruption and resume → compare pinned hashes and refuse resume on drift.
- Candidate suitability after a search is semantic → show actual query and result, require human precondition judgment.
- Partial raw evidence may contain private paths → keep it local; serve over loopback, render as text, and publish only reviewed curated output.
