## Why

The plugin extension runtime now projects and starts LLM plugin capabilities, but no plugin capability exercises a deterministic script validator. The existing FinRobot raw Skills already contain reviewed Python entrypoints and support libraries; migrating one of them into a mixed-execution extension proves that plugin capabilities can use the same validator runner contract as bundled core capabilities.

## What Changes

- Add `plugin-financial-statement-analysis`, a vendor-derived mixed capability package derived from the reviewed FinRobot `financial-research-statement-analysis` raw Skill.
- Package `tools/statements.py` and `tools/financial_support.py` as hash-bound knowledge refs.
- Add a deterministic `statement-brief-validator` script validator that rejects missing or incomplete `research_brief` JSON outputs.
- Add a one-node `plugin-financial-statement-analysis` graph profile.
- Assign the capability and profile to `accounting-auditing-and-accountability` and `banking-finance-and-investment`.
- Add end-to-end coverage showing failed advance leaves the node eligible and a valid brief advances to complete.

## Impact

- No public CLI command changes.
- Selecting either finance-related domain now projects the new extension alongside the existing raw FinRobot Skills.
- The extension capability package remains static and never executes during install or check.

## Capabilities

### Modified Capabilities

- `capability-graph-engine`: plugin script validators now have a reviewed mixed-execution pilot.

### New Capabilities

None.
