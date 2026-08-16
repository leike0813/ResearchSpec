## Context

`plugin-ecology-biodiversity` proved projection and LLM execution. The next production risk is deterministic validation: plugin packages may contain scripts, and those scripts must run only through the declared validator runner, never during installation or status.

## Goals / Non-Goals

**Goals:**

- Author one script-validated plugin capability from an existing reviewed FinRobot Skill.
- Reuse `knowledge_refs` for package-local tools so projection copies them into Agent tool trees.
- Verify that a failed script validator blocks node completion and writes no node state.

**Non-Goals:**

- Converting all six FinRobot Skills at once.
- Executing FinRobot scripts during plugin install, update, status, or check.
- Adding new capability manifest schema fields.

## Decisions

### Mixed execution package

`plugin-financial-statement-analysis` declares `execution_type: mixed`. The Agent executes the semantic analysis and uses the packaged statement tools; the ResearchSpec CLI executes only the declared deterministic `statement-brief-validator` during `advance`.

### Tools are knowledge refs

The reviewed `statements.py` and `financial_support.py` files are copied into the extension package and recorded as `knowledge_refs` with content hashes and Apache-2.0 licensing. This makes them part of the validated package closure and projected to configured Agent tools without introducing a new package asset field.

### Validator is evidence-bound

`statement-brief-validator` reads the generated submission JSON, resolves the `research_brief` output path, and requires a non-empty JSON object with `scope`, `source_ledger`, `normalized_statements`, `metrics`, and `conclusions`. Missing or invalid evidence returns nonzero, and the existing runner maps that to a failed `advance`.

## Risks

- The output JSON contract is intentionally minimal. Later converters can replace it with the full schema-backed statement analysis contract when plugin schemas are formalized.
- The validator script is package-local and uses absolute output paths in the CLI test; relative boundary paths are already validated by the graph node output contract before validators run.
