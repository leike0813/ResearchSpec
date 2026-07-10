# ARSU Workflow Contract Mapping Design

## 0. Purpose And Status

This document aligns upstream ARSU workflows with the ResearchSpec contract
model and the locked user usage model.

It is a design decision document, not a frozen schema specification. Field-level
schemas, validators, and command behavior should be split into later specs or
implementation changes.

User entry, route confirmation, runtime order, Gate interaction, and the minimal
surface are canonical in [ARSU User Usage Model v0.1](./arsu_user_usage_model.md).

- **Target v0.1** uses one active run, dynamic standalone/pipeline subflows,
  workflow-declared parallel groups, confirmed Gates, transitions, and revision
  round templates.
- **Current implementation (2026-07-10)** provides an explicitly started three-work
  research subflow, dynamic subflow/round instances, all/quorum parallel frontier,
  scoped instructions and Start-authorized receipt-backed `submit work:`, plus the
  typed ARSU routing catalog and nine current Companion Skills.
- **Pending technical layers** are `submit gate:`, `advance`, complete ARSU profiles,
  and four-Companion consolidation.

Source anchors:

- ResearchSpec: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec`
- ARSU: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS upstream checkout: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`

Primary upstream references:

- `vendor/ars/deep-research/SKILL.md`
- `vendor/ars/academic-paper/SKILL.md`
- `vendor/ars/academic-paper-reviewer/SKILL.md`
- `vendor/ars/academic-pipeline/SKILL.md`
- `vendor/ars/shared/handoff_schemas.md`
- `vendor/ars/academic-pipeline/references/pipeline_state_machine.md`
- `vendor/ars/academic-paper/references/workflow_phase_details.md`
- `vendor/ars/*/references/*mode*_guide.md`
- `vendor/ars/*/references/*protocol*.md`
- `docs/arsu_user_usage_model.md`

Current-state policy:

- ARSU-derived content is not required to be current-state-only.
- Upstream version, history, changelog, migration, issue, PR, and
  schema-version text may be recorded as diagnostics or risk findings.
- Those markers are not blocking compatibility defects by themselves.
- ResearchSpec-authored contracts, wrappers, schemas, and validators should
  describe the current intended behavior.

## 1. ResearchSpec Contract Family

ResearchSpec should expose a typed file-contract workspace. Markdown carries
human-readable intent and proposals. YAML, JSON, and JSONL carry stable
machine-facing state.

| Contract | Role | Primary writers | Primary readers |
| --- | --- | --- | --- |
| `specs/project.md` | Research intent, scope, target output, paradigm, global constraints | Human, accepted contract patches | All ARSU skills |
| `specs/sources.yaml` | Source registry, citation keys, corpus entries, verification status, source roles | Source importers, research phases, accepted patches | Research, writing, integrity, review |
| `specs/claims.yaml` | Claim IDs, strength, support, limits, wording constraints, do-not-claim rules | Human, synthesis/review proposals, accepted patches | Writing, integrity, review, finalization |
| `specs/manuscript.yaml` | Manuscript type, outline, section contracts, draft artifact refs, venue/format profile refs | Intake, structure, accepted patches | Writing, revision, review, finalization |
| `specs/workflow.yaml` | Selected ARSU workflow, stage graph reference, mode choices, entry point | Pipeline intake, human decisions | Orchestrator, gate logic |
| `runs/current/state.yaml` | Current run state, active stage, blockers, pending confirmations, resume target | Orchestrator/gate runtime | All converted ARSU wrappers |
| `runs/current/artifact-registry.json` | Artifact refs with path, hash, type, producer, stage, version, verification status | Stage wrappers, renderers, validators | Downstream stages, handoff renderers |
| `runs/current/decision-ledger.jsonl` | Append-only human decisions, overrides, branch choices, accepted limitations | Orchestrator, human-confirmed actions | Gate logic, downstream stages |
| `runs/current/gate-ledger.jsonl` | Append-only gate checks, verdicts, blockers, overrides, validation receipts | Integrity/review/compliance gates | Orchestrator, finalization, process summary |
| `runs/current/handoff.md` | Rendered context packet for agents or new sessions | Renderer only | Humans, agents |
| `changes/<change-id>/contract-patch.yaml` | Proposed high-impact contract changes | Agents, humans | Human review, patch applier |
| `draft-patches/<patch-id>.json` | Block/hash-based manuscript revision patch payloads | Revision agents | Patch validator/apply runtime |

Hard boundaries:

- `handoff.md` is a rendered view, not a source of truth.
- Drafts, reviews, integrity reports, figures, tables, PDFs, and process
  summaries are artifacts, not ResearchSpec specs.
- High-impact changes to research question, claim strength, contribution,
  target output, manuscript structure, or reviewer-response strategy go through
  `changes/<change-id>/contract-patch.yaml` or an explicit human decision.

## 2. Academic Pipeline Stage Contract Matrix

`academic-pipeline` remains the ARSU-owned semantic stage graph. ResearchSpec core
provides generic contract/runtime primitives rather than hard-coding this graph
into every project. Target profiles instantiate the table below as subflows,
work, Gates, transitions, and dynamic revision rounds; the table is not a second
runtime state machine.

| Stage | ARSU task | Required ResearchSpec contracts | Required artifacts | Writes |
| --- | --- | --- | --- | --- |
| 1 `RESEARCH` | Run `deep-research` in `socratic`, `full`, or `quick` mode | `project`, `workflow`, `state` | Optional seed notes, sources, draft fragments | RQ Brief, Methodology Blueprint, Bibliography, Synthesis artifacts; may propose updates to `project`, `sources`, `claims`; records decisions/checkpoints |
| 2 `WRITE` | Run `academic-paper` in `plan` or `full` mode | `project`, `sources`, `claims`, `manuscript`, `workflow`, `state` | Stage 1 artifacts when available | Paper Configuration Record, Outline/Evidence Map, Argument Blueprint, Paper Draft artifacts; updates manuscript artifact refs |
| 2.5 `INTEGRITY` | Run `integrity_verification_agent` in `pre-review` mode | `sources`, `claims`, `manuscript`, `state` | Paper Draft | Blocking gate-ledger entry, Integrity Report artifact, corrected/verified draft artifact |
| 3 `REVIEW` | Run `academic-paper-reviewer` in full mode | `project`, `claims`, `manuscript`, `workflow`, `state` | Verified Paper Draft, pre-integrity report | Reviewer reports, Editorial Decision, Revision Roadmap artifacts; decision-ledger entries for review outcome |
| 4 `REVISE` | Run `academic-paper` in revision mode | `claims`, `manuscript`, `workflow`, `state` | Review reports, Editorial Decision, Revision Roadmap, current draft | Response to Reviewers, revision patch, revised draft, apply report artifacts; possible contract patches |
| 3' `RE-REVIEW` | Run `academic-paper-reviewer` in re-review mode | `claims`, `manuscript`, `workflow`, `state` | Revised draft, Response to Reviewers, original roadmap, apply report | Verification review report, R&R Traceability Matrix, residual roadmap, new decision artifact |
| 4' `RE-REVISE` | Run `academic-paper` in revision mode for residual major issues | `claims`, `manuscript`, `workflow`, `state` | Re-review report, residual roadmap, current revised draft | Second revision patch, re-revised draft, apply report artifacts |
| 4.5 `FINAL INTEGRITY` | Run `integrity_verification_agent` in `final-check` mode | `sources`, `claims`, `manuscript`, `workflow`, `state` | Final revised draft, revision reports, previous gates | Blocking final gate-ledger entry, final Integrity Report artifact, verified final draft artifact |
| 5 `FINALIZE` | Run `academic-paper` format-convert/finalization | `project`, `sources`, `claims`, `manuscript`, `workflow`, `state` | Verified final draft, final integrity pass, venue/format profile | Final paper artifacts, formatted outputs, disclosure/cover-letter artifacts, finalization decision entries |
| 6 `PROCESS SUMMARY` | Orchestrator process record | `workflow`, `state`, `artifact-registry`, `decision-ledger`, `gate-ledger` | Final paper artifacts and all stage receipts | Process summary artifact; no research-spec semantic changes |

Mandatory stage rules to preserve:

- Stage 2 must not skip Stage 2.5 before review.
- Stage 4 must not jump directly to Stage 5.
- Stage 4.5 must verify from scratch and must pass before finalization.
- Review/revision branch choices are human decisions and must be recorded.
- Resume boundaries and checkpoint decisions belong in ResearchSpec state and
  ledgers, not in chat memory.
- A unique transition after an accepted Gate/branch can advance automatically;
  multiple branches or new semantics require Decision.
- Parallel execution is allowed only when the profile declares the group and join
  policy.

## 3. Skill-Level Workflow Matrices

### 3.1 `deep-research`

Internal phase workflow:

| Phase | Task | Contract inputs | Artifact inputs | Outputs / writes |
| --- | --- | --- | --- | --- |
| 1 Scoping | Research question and methodology design | `project`, `workflow`, `state` | User prompt, optional prior notes/sources | RQ Brief, Methodology Blueprint; possible `project` contract patch; checkpoint decision |
| 2 Investigation | Bibliography and source verification | `project`, `sources`, `workflow`, `state` | RQ Brief, Methodology Blueprint, optional literature corpus | Bibliography, Source Corpus, source quality matrix; updates/proposes `sources` |
| 3 Analysis | Synthesis, gap analysis, challenge checks | `project`, `sources`, `claims`, `state` | Bibliography, verified sources | Synthesis Report; possible `claims` patch |
| 4 Composition | Research report drafting | `project`, `sources`, `claims`, `state` | RQ, methodology, bibliography, synthesis | APA report artifact |
| 5 Review | Editorial, ethics, devil's-advocate review | `project`, `sources`, `claims`, `state` | Research report artifact | Review artifacts; gate/advisory entries when blocking issues appear |
| 6 Revision | Final research report revision | `project`, `sources`, `claims`, `state` | Review outputs, report draft | Final research report artifact, acknowledged limitations |

Operational modes:

| Mode | Typical purpose | Required contracts | Produces |
| --- | --- | --- | --- |
| `full` | Complete research report | `project`, `sources`, `claims`, `workflow`, `state` | RQ, methodology, bibliography, synthesis, report, review artifacts |
| `quick` | Short research brief | `project`, `sources`, `state` | Brief, key sources, provisional findings |
| `review` | Review existing text/report | `project`, `claims`, `state` | Review report, risks, suggested patches |
| `lit-review` | Literature search and synthesis | `project`, `sources`, `workflow`, `state` | Bibliography, synthesis, source updates |
| `three-way-scan` | WHY/HOW/WHAT paper comparison | `project`, `sources`, `state` | Comparison matrix, reading shortlist |
| `fact-check` | Verify specific claims | `sources`, `claims`, `state` | Fact-check report, source/gate findings |
| `socratic` | Guided research idea formation | `project`, `workflow`, `state`, decision ledger | Research Plan Summary, RQ candidates, decisions |
| `systematic-review` | PRISMA/systematic review or meta-analysis | `project`, `sources`, `workflow`, `state` | Protocol, PRISMA materials, RoB/meta-analysis artifacts, compliance gates |

### 3.2 `academic-paper`

Internal phase workflow:

| Phase | Task | Contract inputs | Artifact inputs | Outputs / writes |
| --- | --- | --- | --- | --- |
| 0 Config | Intake and paper configuration | `project`, `sources`, `claims`, `manuscript`, `workflow`, `state` | RQ Brief, Bibliography, Synthesis, user materials | Paper Configuration Record; updates/proposes `manuscript` and `workflow`; confirmation decision |
| 1 Research | Search strategy and source corpus | `project`, `sources`, `workflow`, `state` | Existing sources or research artifacts | Search Strategy, Source Corpus, Literature Matrix; source updates |
| 2 Architecture | Outline and evidence map | `project`, `sources`, `claims`, `manuscript`, `state` | Configuration, source corpus, synthesis | Paper Outline, Evidence Map; manuscript contract patch |
| 3 Argumentation | Claim-evidence-reasoning plan | `claims`, `sources`, `manuscript`, `state` | Outline, evidence map | Argument Blueprint; possible claim patches |
| 4 Drafting | Section-by-section draft | `project`, `sources`, `claims`, `manuscript`, `state` | Outline, argument blueprint, style profile | Paper Draft artifact, draft version record |
| 5a Citations | Citation compliance | `sources`, `manuscript`, `state` | Paper Draft | Citation Audit Report; gate/advisory entries; corrected draft artifact if changed |
| 5b Abstract | Bilingual abstract and keywords | `project`, `manuscript`, `state` | Paper Draft | Abstract/keywords artifact or manuscript section artifact |
| 6 Peer Review | In-pair quality review | `project`, `claims`, `manuscript`, `state` | Paper Draft, pre-commitment artifacts if enabled | Review Report, revision instructions, decision/gate entries |
| 7 Format | Final conversion and submission package | `project`, `sources`, `claims`, `manuscript`, `state` | Final draft, citation audit, venue/format profile | LaTeX/DOCX/PDF/Markdown artifacts, disclosure, cover letter |

Operational modes:

| Mode | Required contracts | Produces / writes |
| --- | --- | --- |
| `full` | `project`, `sources`, `claims`, `manuscript`, `workflow`, `state` | Complete paper draft, review, formatted package artifacts |
| `outline-only` | `project`, `sources`, `claims`, `manuscript`, `state` | Outline and evidence map; possible manuscript patch |
| `revision` | `claims`, `manuscript`, `workflow`, `state` | Revision patch, revised draft, apply report, response artifacts |
| `abstract-only` | `project`, `manuscript`, `state` | Abstract and keyword artifact |
| `lit-review` | `project`, `sources`, `claims`, `state` | Annotated bibliography, literature matrix, synthesis artifact |
| `format-convert` | `manuscript`, `sources`, `state` | Formatted output artifacts; no semantic spec changes |
| `citation-check` | `sources`, `manuscript`, `state` | Citation report and optional corrected artifact |
| `plan` | `project`, `sources`, `claims`, `manuscript`, decision ledger | Chapter Plan, INSIGHT collection, possible patches |
| `revision-coach` | `claims`, `manuscript`, `state` | Revision Roadmap, response skeleton, suggested decisions |
| `disclosure` | `project`, `manuscript`, `workflow`, `state` | AI disclosure artifact and placement guidance |
| `rebuttal-audit` | `claims`, `manuscript`, `state` | Rebuttal QA report; advisory gaps; no verified status by default |

### 3.3 `academic-paper-reviewer`

Internal phase workflow:

| Phase | Task | Contract inputs | Artifact inputs | Outputs / writes |
| --- | --- | --- | --- | --- |
| 0 Field analysis | Configure reviewer personas | `project`, `claims`, `manuscript`, `state` | Submitted paper draft | Reviewer Configuration Card; confirmation decision |
| 1 Panel review | Independent multi-perspective review | `project`, `claims`, `manuscript`, `state` | Paper draft, configuration card | EIC/methodology/domain/perspective/devil's-advocate reports |
| 2 Editorial synthesis | Consolidate review and decision | `claims`, `manuscript`, `state`, decision ledger | Phase 1 review reports, optional paper draft for coaching | Editorial Decision, Revision Roadmap, review report artifact; optional revision-coaching strategy notes when decision is not Accept |

Revision coaching is treated as an optional output track inside Phase 2 rather
than a separate ResearchSpec phase. That keeps the reviewer mapping aligned to
the upstream three-phase review workflow while still preserving the 2.5
coaching behavior as an artifact-producing mode.

Operational modes:

| Mode | Required contracts | Produces / writes |
| --- | --- | --- |
| `full` | `project`, `claims`, `manuscript`, `workflow`, `state` | Full panel reports, Editorial Decision, Revision Roadmap |
| `re-review` | `claims`, `manuscript`, `state` | Verification review report, R&R Traceability Matrix, residual decision |
| `quick` | `project`, `claims`, `manuscript`, `state` | EIC quick assessment and key issues |
| `methodology-focus` | `project`, `claims`, `manuscript`, `state` | Methodology review report |
| `guided` | `project`, `claims`, `manuscript`, decision ledger | Socratic review guidance, user strategy decisions |
| `calibration` | `workflow`, `state` | Calibration report and confidence disclosure artifacts |

Review skills are read-only with respect to manuscript content. They produce
reports, roadmaps, decisions, and patches; they do not directly rewrite the
submitted manuscript.

## 4. Cross-Skill Handoff Mapping

ARS uses Markdown handoff schemas and JSON schemas as cross-skill contracts.
ResearchSpec should preserve the semantics while moving runtime truth into
registries, ledgers, and typed contracts.

| ARS schema / handoff | Producer | Consumer | ResearchSpec target |
| --- | --- | --- | --- |
| Schema 1 RQ Brief | `deep-research` RQ/Socratic agents | Research architecture, paper intake | Artifact registry; accepted stable fields update/propose `project` |
| Schema 2 Bibliography | `deep-research` bibliography | Synthesis, source verification, paper literature strategy | `sources.yaml` plus bibliography artifact |
| Schema 3 Synthesis Report | `deep-research` synthesis | Report compiler, paper argument builder | Artifact registry; possible `claims` or `project` patch |
| Schema 4 Paper Draft | `academic-paper` draft writer | Integrity, reviewer | `manuscript.yaml` artifact ref plus draft artifact registry entry |
| Schema 5 Integrity Report | Integrity agent | Orchestrator, revision | `gate-ledger.jsonl` entry plus integrity artifact |
| Schema 6 Review Report | Reviewer synthesizer | Orchestrator, revision | Artifact registry plus decision-ledger and possible patches |
| Schema 7 Revision Roadmap | Reviewer synthesizer | Revision writer, orchestrator | Artifact registry plus `changes` / `draft-patches` planning input |
| Schema 8 Response to Reviewers | Revision writer | Re-review | Artifact registry plus decision-ledger entries for limitations/disagreement |
| Schema 9 Material Passport | Cross-stage metadata | All pipeline stages | Split into `state.yaml`, artifact registry, decision ledger, gate ledger |
| Schema 10 Style Profile | Paper intake | Draft writer, research report compiler | Artifact registry; optional manuscript/style ref |
| Schema 11 R&R Traceability Matrix | Re-review | Revision, orchestrator | Artifact registry plus gate/decision ledger linkage |
| Schema 12 Compliance Report | Compliance agent | Orchestrator, disclosure/finalization | Gate ledger entry plus compliance artifact |

Additional ARS passport extension aggregates should map by role:

- citation, claim, experiment, temporal, plagiarism, and compliance findings
  belong in `gate-ledger.jsonl` and linked artifacts.
- source/corpus records belong in `sources.yaml` and source artifacts.
- resume/reset entries belong in `state.yaml` plus decision/gate ledgers.
- generated reports remain artifacts.

## 5. ResearchSpec Contract Preflight

Every converted ARSU skill wrapper begins with a contract preflight. Current
implementation supports work selectors; Target v0.1 generalizes the same loop to
subflow, Gate, and transition selectors.

Preflight steps:

1. Locate the project `researchspec/` directory.
2. Read `specs/workflow.yaml` and `runs/current/state.yaml`.
3. Run `researchspec status --json` to discover the authoritative frontier.
4. Request `researchspec instructions <selector> --json`; do not infer a node,
   Gate, or transition contract from chat or static Skill prose.
5. For a `work:` selector, load only the declared contracts and artifact refs.
6. Check pending decisions and blocking Gates before producing new work.
7. Render a small stage input packet for the LLM.

Preflight output should be an internal view containing:

- current run, subflow, workflow stage, Skill, and mode;
- required contract paths read;
- required artifact refs loaded;
- allowed writes for this invocation;
- blocked/pending decisions;
- expected output artifact types;
- declared candidate path, deterministic validation profile, and Submit capability;
- formal Gate and transition boundary, without pretending either is already
  implemented in the current Slice.

Do not let converted skills infer stage truth from chat memory when
`runs/current/state.yaml` exists.

## 6. Upstream Task Refactor Design

### 6.1 Wrapper Changes

Converted ARSU skill wrappers should add a `Contract Inputs / Contract Outputs /
Writes Allowed` block near each workflow or mode entry.

Minimum block:

```text
Contract Inputs:
- <ResearchSpec contracts required>
- <artifact refs required>

Contract Outputs:
- <artifact types produced>
- <contract patches proposed>
- <ledger entries written>

Writes Allowed:
- candidate artifact path declared by dynamic instructions
- contract or draft patch paths explicitly allowed by the workflow
- no direct artifact-registry, receipt, state, or ledger edits by the Agent
- no direct spec edits except through accepted contract patches
```

### 6.2 Material Passport Replacement

ARS Material Passport should not remain the runtime SSOT in ResearchSpec.

Replacement mapping:

- global run position -> `runs/current/state.yaml`
- artifact provenance -> `artifact-registry.json`
- verification and compliance state -> `gate-ledger.jsonl`
- branch choices and overrides -> `decision-ledger.jsonl`
- source/corpus payloads -> `sources.yaml`
- reset/resume protocol -> `state.yaml` plus append-only ledger events

Existing ARS passport semantics can be preserved as imported artifacts or
compatibility views, but new ResearchSpec-native workflows should read the
split contracts above.

### 6.3 Contract Mutation Rules

Converted ARSU tasks should not directly rewrite core specs for high-impact
changes.

Use `changes/<change-id>/contract-patch.yaml` when a task proposes:

- changing the research question or scope;
- adding or strengthening a core claim;
- weakening or rejecting a claim;
- changing manuscript structure or target output;
- changing review-response strategy;
- accepting a limitation or override that affects final claims.

Low-risk artifact registration does not require a contract patch. Current
instance work can automatically perform hash-bound `submit work:<id>` after
candidate production when Start authorization is trusted; manual/legacy work can
still use the transitional Submit Companion. This mechanical submit is not a Gate
or academic approval.

Formal Gate evidence is proposed by `researchspec-verify`, shown to the user, and
persisted by current `submit gate:<instance>/<id>` only after confirmation. A challenge
forces reverification; failed override and branch choice use Decide. The unique
authorized transition advances through a receipt-first/state-last CLI transaction.
ARSU Skills never hand-edit registry, receipts, state, or ledgers.

### 6.4 Preserve Upstream Semantics

The refactor should not attempt broad semantic cleanup of ARS/ARSU history text.

Allowed:

- add ResearchSpec wrapper instructions;
- add contract input/output sections;
- add deterministic validators and renderers;
- record upstream historical/version markers as diagnostics.

Avoid:

- rewriting all upstream changelog/version prose;
- making current-state-only cleanup a validation gate;
- changing ARSU academic behavior merely to fit a simpler contract model.

## 7. Design Consequences

This mapping implies:

- ResearchSpec needs schemas for the contract family before large ARSU wrapper
  rewrites.
- `academic-pipeline` remains the default ARSU orchestration graph, but
  ResearchSpec should support partial entry points through `workflow.yaml` and
  `state.yaml`.
- Artifact registry and ledgers are the critical compatibility layer. Without
  them, ARSU stages will keep depending on monolithic Material Passport and chat
  history.
- Review and integrity stages need explicit gate semantics; ordinary advisory
  feedback should not be mixed with blocking gate entries.
- Draft revision should preserve the useful ARS block/hash patch discipline in
  `draft-patches/<patch-id>.json`.

## 8. Pending Technical Changes

Current contract workspace, work-level control plane, artifact submit, and ARSU
conversion remain in force. Target v0.1 is completed by:

1. `add-arsu-routing-catalog` — implemented; remains active for independent verification/archive.
2. `add-subflow-instance-control-plane`.
3. `add-gate-transition-control-plane`.
4. `add-arsu-workflow-profiles`.
5. `consolidate-researchspec-agent-surface`.

## 9. Acceptance Checklist

This design is sufficient for the next planning step when:

- every ARSU pipeline stage has a ResearchSpec contract read/write mapping;
- `deep-research`, `academic-paper`, and `academic-paper-reviewer` have phase
  and mode mappings;
- ARS handoff schemas have a ResearchSpec target location;
- Material Passport is no longer treated as ResearchSpec runtime SSOT;
- upstream current-state cleanup is explicitly out of default scope.
- all target claims are labeled separately from Current implementation;
- routing and runtime sequences defer to the canonical user model.
