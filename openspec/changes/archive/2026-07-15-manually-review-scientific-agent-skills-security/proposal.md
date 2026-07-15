## Why

Scientific Agent Skills v2.53.0 was ingested with 40 candidates excluded because the upstream static scanner reported Critical or High findings, but spot checks show that some findings cite files outside the actual Skill tree or classify intended credential use as exfiltration without verifying the concrete data flow. ResearchSpec needs an evidence-based manual review layer so upstream scanner output remains reproducible without becoming an unexamined production verdict.

## What Changes

- Manually review the complete local attack surface of all 40 Skills currently carrying `static-security-review-failed`, in eight user-reviewed batches of five.
- Record each upstream finding as confirmed, partially confirmed, false positive, or not applicable, with pinned source evidence, residual risk, proposed adaptation, independent admission blockers, and an explicit maintainer decision.
- Keep security resolution separate from final admission: clearing a finding does not override ToolUniverse or ARSU overlap, domain fit, authority, or license requirements.
- Allow only generated instruction/compatibility normalization, fixed configuration, and removal of non-essential resources as reviewed curation; do not maintain rewritten upstream business scripts.
- After all 40 decisions are complete, reconcile the Scientific Agent Skills admission policy, resource decisions, source-neutral domain catalog, generated vendor assets, registry, reports, and release expectations in one reviewed update.
- Preserve the pinned v2.53.0 source, immutable original audit, public CLI, registry schema, domain taxonomy, wrapper frontier, and non-executing vendor boundary.

## Capabilities

### New Capabilities

- `scientific-agent-skills-manual-security-review`: Defines complete finding-level manual review, evidence, maintainer decision, adaptation limits, and consistency with independent admission blockers for the 40 static-security failures.

### Modified Capabilities

- `scientific-agent-skills-vendor-conversion`: Requires the converter and production admission policy to consume completed manual security decisions, apply only approved curation, and regenerate any newly eligible Skills without weakening other admission gates.

## Impact

The change affects Scientific Agent Skills converter policy contracts, admission and resource decision data, optional generated vendor Skills, source-neutral domain membership, registry assembly, conversion and ingest reports, and associated converter, lifecycle, and release tests. It adds no dependency, remote security service, runtime script execution, public command, workspace migration, registry schema revision, or new domain.
