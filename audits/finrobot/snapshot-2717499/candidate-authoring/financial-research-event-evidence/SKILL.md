---
name: financial-research-event-evidence
description: Prepare, deduplicate, assess, and rank financial events and catalysts with explicit source provenance, probability, sentiment, impact, horizon, and confidence. Use for news analysis, catalyst research, event timelines, event-impact assessment, or monitoring material company developments.
license: Apache-2.0
metadata:
  vendor: finrobot
  vendor-release: snapshot-2717499
---

# Financial Event And Catalyst Research

## Purpose and scope

Turn a noisy event corpus into a dated, deduplicated evidence set and an
Agent-reviewed catalyst assessment. The script normalizes and orders records; it
never infers event type, probability, sentiment, impact, or investment meaning.

Do not use publication frequency as materiality and do not use this Skill for
general company fundamentals when no event window is central.

## Inputs and prerequisites

Required inputs are the entity, event window, as-of timestamp, timezone,
decision question, and event records with stable source, publication time, event
time when known, title, and summary or excerpt. Ask the user when entity, time
boundary, timezone, or decision horizon is ambiguous.

The Agent may retrieve current records through user-configured browser, filing,
news, market-data, or local-corpus tools. Record query, provider, timestamps, and
source locations. Never discover credentials, persist secrets, or let a provider
assign the final assessment without review.

## Workflow

1. Define the entity, event window, as-of time, timezone, and decision question before collecting event records.
2. Gather source records and distinguish event date from publication date and
   later commentary. Prefer filings, official releases, regulator records, and
   direct transcripts for the fact of an event; use secondary sources for
   context and challenge. Record corrections and whether a record reports fact,
   expectation, rumor, or opinion.
3. Run `prepare` to validate timestamps, normalize dates, compute stable record
   identifiers, and remove exact or declared duplicates.
4. Review the prepared corpus. Resolve conflicts and determine whether records
   describe one event, separate events, expectations, or retrospective analysis.
5. For each retained event, assess causal path, event type, probability,
   sentiment, impact magnitude and direction, horizon, confidence,
   counterevidence, and affected variables. Separate event probability from
   evidence confidence and impact size; give every numeric score a rationale and
   invalidation condition.
6. Place those Agent-supplied assessments in a ranking payload and run `rank`.
   The script applies only the supplied numeric scores and deterministic
   tie-breakers.
7. Synthesize verified events without converting repetition or recency into
   unsupported importance. State scenario implications and monitoring triggers.

### Formal entrypoint

Path: `scripts/event_evidence.py`

Use this entrypoint for every deterministic prepare or rank command.

```bash
python scripts/event_evidence.py prepare --input INPUT.json --output OUTPUT.json
```

```bash
python scripts/event_evidence.py rank --input ASSESSMENTS.json --output RANKED.json
```

Inputs come from one purpose-specific JSON file containing event records or Agent-supplied assessments.
Prepare records require `source`, `published_at`, and `title`; `event_date`,
`summary`, `url`, and `duplicate_of` are optional. Rank records require the
prepared `event_id` plus Agent-supplied `probability`, `impact`, and `confidence`
between 0 and 1; optional sentiment ranges from -1 to 1.

Success writes deterministic JSON to the requested output path and prints its path and SHA-256.
Python 3.11 and the standard library are the only runtime dependencies.
Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.
Pass `--overwrite` only after explicit authorization.

The entrypoint imports `lib/financial_support.py` before parsing a command.
If the support library is missing, stop because the copied tree is incomplete.

## Hard constraints

- Do not let the script infer semantics from titles, keywords, dates, or price
  movements.
- Preserve event time, publication time, timezone, source, and record identity.
- Do not silently merge related but distinct events or delete a conflicting
  report.
- Exact duplicates may be removed; syndication, paraphrase, and conflicting
  accounts require an explicit Agent decision.
- Do not invent probability scores, sentiment, impact, causal paths, or targets.
- Bundled scripts perform no network, credential, installation, or repository
  access and refuse overwrite by default.

## Responsibilities

Agent procedure: assess causal path, probability, sentiment, magnitude, timing, and counterevidence for each event. Agent procedure: synthesize verified events without converting repetition or recency into unsupported importance.

The Agent owns source verification, event identity, classification, probability,
sentiment, impact, horizon, confidence, scenario interpretation, and conclusion.
The script owns validation, date normalization, exact/declared deduplication,
stable IDs, ranking from supplied scores, hashing, and atomic writes.

Record each conclusion with evidence, assumptions, counterevidence, and limitations.
Stop when the available evidence cannot support the requested conclusion.

## Outputs and completion

Return scope and as-of time, source ledger, normalized event timeline, duplicate
decisions, per-event assessment, stable ranking, scenario implications,
counterevidence, limitations, and monitoring triggers. Clearly label every
semantic score as Agent-supplied.

Completion requires that every ranked event resolves to retained evidence,
every score has a rationale, later commentary is not mistaken for the event
date, and repeated execution of the same payload is deterministic.

## Failure handling

If dates lack a timezone, ask or record an explicit assumed timezone. If two
records may or may not be duplicates, keep both and flag the uncertainty. If a
script rejects a score, fix the payload rather than clipping silently. If
current tools are unavailable, use a dated corpus and narrow the as-of claim.

## Examples

Happy path: prepare ten articles and filings about three Acme events, mark exact
duplicates, assess the three retained events, then rank the supplied assessments.

Near miss: ask the script to infer positive sentiment and probability from a
headline. The Agent must assess those semantics and provide explicit scores.
