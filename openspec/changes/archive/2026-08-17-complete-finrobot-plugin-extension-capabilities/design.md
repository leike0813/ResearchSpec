## Context

The prior change proved one FinRobot extension capability and one script validator. This change completes FinRobot's new-mode surface and makes the vendor maintainable through an ARSU-shaped maintenance suite. FinRobot remains the first vendor in the agreed migration order.

## Goals / Non-Goals

**Goals:**

- Convert all six reviewed FinRobot production Skills into one-to-one extension capability packages with one-node graph profiles.
- Give every mixed package a deterministic, evidence-bound `research_brief` validator; llm packages keep the engine-enforced output-role policy.
- Preserve the reviewed raw vendor bundle as the advisory source of record and derive tools byte-for-byte from it.
- Establish the FinRobot maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream FinRobot or changing the immutable `snapshot-297a8d2` capability audit.
- Replacing the raw vendor-bundle Skills or removing them from domain resolution.
- Introducing new capability manifest schema fields or public CLI commands.
- Executing bundled calculation tools during install, update, status, check, or maintenance records.

## Decisions

### One raw Skill -> one extension package

Every reviewed FinRobot Skill maps to exactly one `plugin-financial-*` capability and one same-named profile. This preserves one-to-one provenance and keeps raw and extension surfaces independently selectable.

### Tools stay knowledge refs

Each mixed package copies the reviewed vendor-bundle script and `lib/financial_support.py` into `tools/` and records them as hash-bound `knowledge_refs`. Projection therefore copies them into Agent tool trees without any new package asset field. Maintenance `artifacts` re-copies and verifies byte identity against the vendor bundle.

### One shared evidence-bound validator contract

Each mixed package declares `validators/validate_financial_brief.py` with a package-specific `--required` field list. The validator reads the runner-produced submission JSON, resolves the `research_brief` output path, and requires a non-empty JSON object containing the declared evidence-bearing sections. The existing statement-analysis validator is refactored to the same contract while keeping its original required fields.

### Agent-only packages use llm execution

Competitive position and corporate risk have no bundled script by review decision. They are `execution_type: llm` with the `capability.policy.output_roles` validator only. Their procedure and hard constraints are complete in `SKILL.md`.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/finrobot/snapshot-297a8d2` and binds the immutable capability audit, vendor-bundle tree, extension registry subset, extension package trees, maintenance Skill, catalog, and records. `scripts/finrobot-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The `research_brief` contract is intentionally minimal per package. Later changes can formalize package-specific schemas once plugin schemas are stable.
- The raw Skills remain installable and could diverge stylistically from the extension packages; the maintenance catalog records the mapping so future anchor diffs are explicit.
