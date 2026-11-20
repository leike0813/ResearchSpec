---
name: scientific-agent-skills-ginkgo-cloud-lab
description: Compares research service categories and prepares an advisory
  checklist for quote assumptions, material permissions, evidence deliverables,
  and scientific acceptance.
license: MIT
compatibility: Requires the packages, services, hardware, and local runtimes
  described by this Skill. ResearchSpec installs files only and never executes
  scripts, installs dependencies, or configures credentials.
metadata:
  vendor: scientific-agent-skills
  vendor-release: v2.72.0
  upstream-skill-id: ginkgo-cloud-lab
  researchspec-role: semantic-helper
---

> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Project advisory comparison, quote assumptions, permissions and evidence expectations. Keep lab operation, ordering, account access and transfer of sample or design materials outside this procedure.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/ginkgo-cloud-lab/references/cell-free-protein-expression-hibit.md`, `skills/ginkgo-cloud-lab/references/cell-free-protein-expression-optimization.md`, `skills/ginkgo-cloud-lab/references/cell-free-protein-expression-validation.md`, `skills/ginkgo-cloud-lab/references/cfps-expression-purification-quantification.md`, `skills/ginkgo-cloud-lab/references/cfps-strep-purification-thermal-shift.md`, `skills/ginkgo-cloud-lab/references/cfps-strep-tag-purification-a280.md`, `skills/ginkgo-cloud-lab/references/echo-ms-cfps-detection.md`, `skills/ginkgo-cloud-lab/references/echo-ms-method-onboarding.md`, `skills/ginkgo-cloud-lab/references/ecoli-expression-purification-quantification.md`, `skills/ginkgo-cloud-lab/references/ecoli-minibinder-expression-histag-a280.md`, `skills/ginkgo-cloud-lab/references/ecoli-protein-expression-hibit.md`, `skills/ginkgo-cloud-lab/references/ecoli-protein-expression-histag-a280.md`, `skills/ginkgo-cloud-lab/references/fluorescent-pixel-art-generation.md`, `skills/ginkgo-cloud-lab/references/ivt-rna-synthesis-qpcr.md`, `skills/ginkgo-cloud-lab/references/minibinder-strep-tag-a280.md`, `skills/ginkgo-cloud-lab/references/pichia-protein-expression-labchip.md`, `skills/ginkgo-cloud-lab/references/plate-reader-assay-onboarding.md`, `skills/ginkgo-cloud-lab/references/spr-target-onboarding.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

# Cloud Laboratory Service Assessment

Use the user's supplied service information to compare scope, turnaround, quote assumptions and deliverables. Record which requirements are documented, which require clarification, and which figures are estimates. Compare what the service reports with the project's own acceptance criteria and highlight any measurement or quality-control gap.

Prepare an advisory brief with the goals, study context, evidence requested back and unresolved material, privacy or contract questions. Keep purchasing, submission of sample or design material, and service-account operations with the user-authorized service workflow. Do not produce laboratory execution instructions.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
