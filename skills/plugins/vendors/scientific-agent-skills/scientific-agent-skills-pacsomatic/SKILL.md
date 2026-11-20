---
name: scientific-agent-skills-pacsomatic
description: Prepares an advisory input and output verification brief for a
  user-provisioned local matched-sample analysis workflow.
license: MIT
compatibility: Requires the packages, services, hardware, and local runtimes
  described by this Skill. Do not clone repositories, create environments,
  submit jobs, or expose raw module-load and extra-argument channels.
  ResearchSpec installs files only and never executes scripts, installs
  dependencies, or configures credentials.
metadata:
  vendor: scientific-agent-skills
  vendor-release: v2.72.0
  upstream-skill-id: pacsomatic
  researchspec-role: semantic-helper
---

> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Retain inputs, configuration, and interpretation guidance; use only a user-provided local pipeline pinned to an immutable revision and show plans for confirmation.
> - Do not clone repositories, create environments, submit jobs, or expose raw module-load and extra-argument channels.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/pacsomatic/scripts/run_pacsomatic.py`, `skills/pacsomatic/references/agent-playbook.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

# Matched-Sample Analysis Planning

Confirm the authorized local workflow version, intended analysis, sample pairing and output location. Review the user's metadata for stable identifiers, consistent pairing and gaps that could invalidate interpretation. Record data handling permissions and the limits of the review.

Prepare a non-executing plan with inputs, expected evidence and validation checks. Ask the operator to resolve ambiguous sample records. Interpret only outputs the user has supplied and annotate missing provenance or quality-control evidence.

The user-controlled environment owns dependency provisioning, execution and scheduler submission. Review sensitive data only within the user's approved boundaries.
