## Why

ResearchSpec now defaults new workspaces to the adaptive case runtime and
exposes bounded action descriptors, risk-tiered execution, Doctor recovery,
runtime migration, seventeen commands, and seven fixed Zotero Adapter Skills.
The main specs, generated ARSU and Companion guidance, canonical usage model,
and runtime documentation still contain strict-only or pre-v2 instructions, so
an Agent can follow shipped guidance and request actions that do not exist in
the default workspace.

## What Changes

- Converge the main specs on the implemented adaptive-default, strict-compatible
  runtime and the `direct | human_confirmed | plan_bound` action-v2 policy.
- Generate one dual-runtime ARSU contract preflight that selects adaptive or
  strict instructions from runtime status and action descriptors.
- Update the four Companion Skills to consume descriptor-owned selectors,
  semantic input, confirmation policy, and next selectors.
- Regenerate all four converter-owned ARSU Skill trees and their manifests and
  reports from the updated converter source.
- Rewrite the canonical usage model and runtime documentation as shared,
  adaptive-default, and strict-compatibility views; correct command, Skill,
  selector, patch, recovery, migration, pipeline, and Material Passport facts.
- Update and re-render the runtime diagrams so generic diagrams describe the
  default runtime and strict graphs are explicitly labeled as compatibility
  projections.
- Extend behavior and traceability checks without locking natural-language
  prose or introducing new runtime dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-interface`: Make action-v2 semantic input, bounded descriptors, execution
  policy, next selectors, and compact transaction results the authoritative
  public protocol.
- `arsu-run-usage`: Distinguish adaptive and strict producer loops and remove
  unconditional full-status and external plan-replay requirements.
- `artifact-submit`: Define automatic and manual submission through their
  descriptor-owned direct and human-confirmed policies.
- `subflow-instance-control-plane`: Distinguish confirmed external Start from
  direct delegated child Start.
- `gate-transition-control-plane`: Keep formal Gates and accepted high-impact
  applications plan-bound while allowing eligible mechanical transitions to be
  direct.
- `case-obligation-control-plane`: Define adaptive attempt, evidence, local
  recovery, completion, and resolution actions through descriptors.
- `runtime-recovery`: Require evidence-first repair, orphan-receipt diagnosis,
  exact retry, and bounded Doctor guidance.
- `literature-system-adapters`: Expose compact static adapter health and
  selector-directed diagnostics without live probing.
- `agent-surface-model`: Use the current four ARSU, four Companion, and seven
  Zotero Adapter Skill surface while keeping wrappers limited to command tools.
- `agent-tool-delivery`: Project all fifteen fixed Skills and only eight
  wrappers through the existing delivery ownership model.
- `arsu-converter`: Generate adaptive and strict preflight instructions from one
  converter-owned source and current action-descriptor semantics.
- `companion-skills`: Make Navigate, Propose, Decide, and Verify dispatch through
  the current runtime mode and action execution policy.
- `arsu-user-model-acceptance`: Trace and exercise adaptive, strict, action-v2,
  recovery, migration, adapter, and generated-guidance journeys.
- `mvp-release-readiness`: Use the current seventeen-command and fifteen-Skill
  fixed surface and verify the converged guidance and documentation through
  stable structured release checks.

## Impact

The change updates OpenSpec main and delta specs, ARSU converter contract
guidance, Companion workflow guidance, generated ARSU files and hashes, focused
tests, the canonical user usage model, all runtime documentation, and affected
diagram sources and SVGs. It does not add a public command, Skill, dependency,
runtime state schema, route, workflow authority, or adaptive Material Passport
capability, and it preserves Schema `0.2` strict workspace behavior.
