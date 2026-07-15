---
name: histagent-historical-research
description: Run a resumable, gate-driven historical inquiry with explicit source-layer applicability, evidence, conflicts, limitations, and deterministic reports. Use when an Agent must preserve a long historical investigation across context loss without giving local state ResearchSpec workflow authority.
license: Apache-2.0
compatibility: Python 3.11+; state is stored in a user-selected run directory.
metadata:
  vendor: histagent
  vendor-release: snapshot-47bbe21
  source-revision: 47bbe21dc81618489f5d5929358032883a3fe448
---

# Historical research

## Purpose and scope

Use this Skill for a focused historical inquiry whose scope, sources, transformations, evidence, conflicts, limitations, and synthesis must remain inspectable across context loss. It supplies a deterministic Gate and renderer while leaving source criticism and historical judgment to the Agent.

state.json is the Skill-local source of truth and has no ResearchSpec workflow authority. It cannot start, submit, advance, decide, gate, or register a ResearchSpec workflow item.

Run status before doing semantic work in an existing run.

## Inputs and prerequisites

Python 3.11 and the standard library are the only runtime dependencies. Inputs come from ordinary CLI options and purpose-specific scope, source, layer, and evidence record files. Do not use a generic payload file.

- The scope file contains `question` and `source_strategy`.
- A source record contains identity, locator, SHA-256 provenance, a complete five-layer applicability plan, and `registration_complete`.
- A layer record contains one required source layer and its lineage.
- An evidence record has `record_type` equal to `evidence`, `conflict`, `limitation`, `review`, or `synthesis`.

Every source declares all five layers as `required` or `not-applicable`, and every declaration has a reason. The Gate requests only applicable layers. It does not require a translation, emendation, normalization, or interpretation that the source does not need.

The run directory must be user-selected and writable. `state.json` is authoritative; final Markdown and JSON artifacts are read-only projections.

## Workflow

Use this entrypoint for every state transition, Gate check, and deterministic render. The entrypoint imports lib/historical_support.py before parsing a command. If the support library is missing, stop because the copied tree is incomplete.

1. Prepare a scope file and initialize the run:

```bash
python scripts/research_runtime.py init --run-dir RUN --scope-file scope.json
```

2. Run the Gate:

```bash
python scripts/research_runtime.py status --run-dir RUN
```

Status prints the direct Gate view; mutations print command-specific receipts; render writes the three fixed final artifacts. Execute only the returned `next_action`, pass its `status_token` to the mutation, then run `status` again.

```bash
python scripts/research_runtime.py submit-source --run-dir RUN --record-file source.json --status-token TOKEN
python scripts/research_runtime.py submit-layer --run-dir RUN --record-file layer.json --status-token TOKEN
python scripts/research_runtime.py submit-evidence --run-dir RUN --record-file evidence.json --status-token TOKEN
python scripts/research_runtime.py check --run-dir RUN
python scripts/research_runtime.py render --run-dir RUN --output-dir OUTPUT --status-token TOKEN
```

3. Keep submitting sources until one source record sets `registration_complete: true`.
4. Submit only the Gate's next required layer. A not-applicable layer is complete through its reviewed source-plan reason and receives no invented content.
5. Add evidence and any conflicts or limitations. Resolve conflicts, explicitly review conflicts and limitations, then add synthesis tied to known evidence IDs.
6. Render only when `next_action` is `render`.

After every mutation, run status again and execute only its unique next_action.

After context loss, run status and reconstruct the run from state instead of chat memory.

Read this reference when preparing a scope, source, layer, or evidence record file: [references/stage-records.md](references/stage-records.md).

Read this reference when evidence conflicts, limitations, review, or synthesis affect the Gate: [references/evidence-and-conflict-cases.md](references/evidence-and-conflict-cases.md).

## Hard constraints

- Never edit `state.json` or rendered artifacts by hand. Repair the domain record and use the formal command.
- Never continue from chat memory after context loss; `status` is the only next-action authority.
- Never submit a stale status token or bypass the unique `next_action`.
- Every source must declare all five layer applicability decisions with reasons. Never create meaningless content merely to satisfy a Gate.
- Keep raw observation/OCR, normalized transcription, emendation, translation, and interpretation distinct. Do not present inferred content as observation.
- Evidence may cite only registered source IDs; synthesis may cite only known evidence IDs.
- Record unresolved disagreements as conflicts. The script must not choose a historical interpretation through string rules.
- The Skill-local run must not write ResearchSpec state, routes, work items, artifacts, Gates, Decisions, transitions, or receipts.
- Final output paths refuse overwrite unless the user explicitly authorizes `--overwrite`.

## Responsibilities

The Agent defines scope and source strategy, identifies sources, decides layer applicability, performs source criticism, creates layer content, weighs evidence, records and resolves conflicts, reviews limitations, and writes synthesis.

The script validates record structure and references, computes the unique Gate action, writes state atomically, binds hashes, renders stable artifacts, and returns mutation receipts. It does not formulate research conclusions or decide which interpretation is true.

Do not use temporary scripts to perform source criticism or synthesis. Do not hand-assemble the final report, evidence matrix, provenance file, or a replacement state file.

## Outputs and completion

`status` directly returns `run_id`, `phase`, unique `next_action`, `status_token`, `blockers`, `counts`, and `next_record_example`. Mutation receipts contain command, accepted record, input hash, state artifact, and `status_required`. These shapes are command-specific rather than a shared runner envelope.

`render` deterministically writes exactly:

- `research-report.md`: scope, strategy, synthesis, sources, conflicts, and limitations;
- `evidence-matrix.json`: evidence, conflicts, limitations, and synthesis evidence IDs;
- `provenance.json`: state hash, source provenance, layer plans and records, artifact hashes, and an explicit false ResearchSpec-authority flag.

Completion requires status phase complete after deterministic rendering. Re-rendering the same state with `--overwrite` must reproduce the same three artifact bytes.

## Failure handling

Failure exits nonzero and writes an error object to stderr without a success object on stdout.

- `run_not_found`: locate the intended run or initialize a new one from an approved scope file;
- `run_exists` or `artifact_exists`: use a new path or obtain explicit overwrite authority for final artifacts;
- `status_required`: run `status` and use its current token;
- `gate_order_violation`: stop and execute only the returned `next_action`;
- `invalid_input`, `invalid_layer`, or `invalid_record_type`: repair the named domain record;
- `unknown_source` or `unknown_evidence`: register the missing record or correct the reference;
- `gate_blocked`: inspect blockers, repair conflicts/reviews/synthesis, then run `status` again;
- `invalid_state`: stop without editing the state file and report the run path for review.

## Examples

Happy path: a born-digital English catalog record declares raw observation and interpretation required, while normalization, emendation, and translation are not applicable with reasons. The Gate requests only the two required layers, then evidence, review, synthesis, and rendering.

Near miss: a source plan omits the translation entry because no translation is needed. The source is rejected; it must still declare translation `not-applicable` with a reason so the decision is auditable.

Conflict path: two registered sources disagree. Submit an unresolved conflict, preserve both readings, record the Agent's treatment, change the conflict to resolved, review conflicts and limitations, and only then submit synthesis.
