## Context

ARS v3.19.0 retains the academic value of independent review while expressing
parts of that workflow through provider-specific model names, credentials, and
direct model calls. ResearchSpec distributes agent-neutral Skills and must keep
all model execution under the target host's own user-approved subagent surface.
The release also makes panel synthesis depend on two deterministic Python
checkers and an existing sprint-contract schema.

## Goals / Non-Goals

**Goals:**

- Bind conversion to the exact v3.19.0 source tree and audit every runtime file.
- Make adaptation coverage complete, typed, deterministic, and fail-closed.
- Preserve independent-model review through host-native subagents after explicit
  per-instance user consent.
- Package only the reviewer checkers and schema reference needed by that flow.
- Keep conversion, validation, installation, and checking offline and inert.

**Non-Goals:**

- Adding provider credentials, endpoints, SDKs, HTTP calls, or model-selection
  configuration to ResearchSpec.
- Persisting alternate-model consent in stable specs, controls, handoffs, or
  another authority file.
- Installing Python packages, executing reviewer scripts during conversion, or
  absorbing unrelated upstream root scripts.

## Decisions

- Use one typed runtime-policy catalog as the classification SSOT for every
  v3.19.0 source file matching the policy keywords. Active instructions receive
  current-state replacements; schemas, templates, historical notes, and purely
  descriptive material are explicitly preserved. New unclassified matches fail
  before output is touched.
- Compile anchor and runtime-policy adaptations through one source-rewrite
  planner. Rewrites are ordered by original byte offsets, cannot overlap, and
  fail on missing or ambiguous source ranges.
- Default to the current session model. Economy or quality-boost paths may name
  only host-available models proposed by the Agent and confirmed by the user
  together with content category and cost. The main Agent freezes its judgment,
  sends minimized de-anchored material, and treats disagreement as a review
  trigger rather than a vote.
- If alternate-model dispatch fails or returns malformed evidence, disclose the
  failure and continue with a single-model result. Never average verdicts or let
  a subagent silently rewrite the main judgment.
- Package only `scripts/check_panel_synthesis.py` and
  `scripts/check_sprint_contract.py` under `academic-paper-reviewer/scripts/`.
  Rewrite the sprint checker to resolve the already packaged shared schema.
  Python 3.11+ and `jsonschema>=4.17` remain user-managed prerequisites; absence
  pauses the panel flow.
- Record catalog identity, rewrite before/after hashes, closure paths, and rules
  in converter-owned metadata. Generated audit reports may show upstream
  “Before” text but runtime-policy scans exclude those quoted audit sections.

## Risks / Trade-offs

- [Upstream prose can move without changing intent] → bind every rewrite to the
  immutable source manifest and fail before writing when a range is missing or
  ambiguous.
- [Broad keyword matching can include harmless historical material] → classify
  every match explicitly rather than deleting history or weakening coverage.
- [Panel validation may be unavailable locally] → pause with a precise
  prerequisite diagnostic; do not install dependencies or replace deterministic
  validation with Agent judgment.
- [Generated-tree changes are large] → regenerate only through the converter,
  verify manifest coverage and idempotence, and inspect the final diff.
