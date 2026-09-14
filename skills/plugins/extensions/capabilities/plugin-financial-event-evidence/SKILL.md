---
name: plugin-financial-event-evidence
description: Prepare, deduplicate, assess, and rank financial events and catalysts into an evidence-backed brief for one graph node.
metadata:
  capability_id: plugin-financial-event-evidence
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---

# Financial Event And Catalyst Research

Execute exactly one ResearchSpec capability node.

## Inputs

- `task_request` (plugin-task.v1)

## Outputs

- `research_brief` (plugin-result.v1): a JSON object at the declared output path.

## Knowledge

- Load knowledge ID `event-evidence-tool` from `tools/event_evidence.py`.
- Load knowledge ID `financial-support` from `tools/financial_support.py`.

## Procedure

Work from `task_request` and produce a JSON `research_brief`.

1. Define the entity, event window, as-of time, timezone, and decision question before collecting event records.
2. Gather source records and distinguish event date from publication date and later commentary. Prefer filings, official releases, regulator records, and direct transcripts for the fact of an event. Record corrections and whether a record reports fact, expectation, rumor, or opinion.
3. Write event records into one purpose-specific JSON file and run the packaged tool through the host Agent's Python runtime:
   `python3 tools/event_evidence.py prepare --input events.json --output prepared.json`.
4. Review the prepared corpus. Resolve conflicts and determine whether records describe one event, separate events, expectations, or retrospective analysis.
5. For each retained event, assess causal path, event type, probability, sentiment, impact magnitude and direction, horizon, confidence, counterevidence, and affected variables. Separate event probability from evidence confidence and impact size; give every numeric score a rationale and invalidation condition.
6. Write those Agent-supplied assessments into a ranking payload and run:
   `python3 tools/event_evidence.py rank --input assessments.json --output ranked.json`.
   The script applies only the supplied numeric scores and deterministic tie-breakers.
7. Write the `research_brief` JSON with these required sections: `scope`, `source_ledger`, `event_timeline`, `duplicate_decisions`, `assessments`, `ranking`, and `conclusions`. Include scenario implications, limitations, and monitoring triggers.

## Hard constraints

- Do not let the script infer semantics from titles, keywords, dates, or price movements.
- Preserve event time, publication time, timezone, source, and record identity.
- Do not silently merge related but distinct events or delete a conflicting report.
- Exact duplicates may be removed; syndication, paraphrase, and conflicting accounts require an explicit Agent decision.
- Do not invent probability scores, sentiment, impact, causal paths, or targets.
- The tool uses only Python 3.11 and the standard library. It performs no network, credential, installation, or repository access and refuses to overwrite without explicit `--overwrite`.
- If the support library is missing, stop; the copied tool tree is incomplete.

## Failure handling

- If dates lack a timezone, ask or record an explicit assumed timezone.
- If two records may or may not be duplicates, keep both and flag the uncertainty.
- If a script rejects a score, fix the payload rather than clipping silently.
- If current-data tools are unavailable, use a dated corpus and narrow the as-of claim.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
