---
name: scientific-agent-skills-generate-image
description: Prepares and reviews image briefs for scientific communication,
  including composition, source material, accessibility, output format, and
  factual verification.
license: MIT
compatibility: Requires the packages, services, hardware, and local runtimes
  described by this Skill. ResearchSpec installs files only and never executes
  scripts, installs dependencies, or configures credentials.
metadata:
  vendor: scientific-agent-skills
  vendor-release: v2.72.0
  upstream-skill-id: generate-image
  researchspec-role: semantic-helper
---

> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Project an image brief, evidence verification and optional target-Agent generic generation with separate consent for destination, shared material and cost.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/generate-image/scripts/generate_image.py`, `skills/generate-image/references/models.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

# Image Brief and Review

Use this procedure to plan a conceptual illustration or revise an existing image. Agree on the audience, purpose, intended dimensions, style, and source materials. Record the required elements, any exact wording, and the parts that need editorial judgment. Preserve labels, units and quantities from the evidence.

Set the scene, focal point, layout, and accessibility requirements in an image brief. Use deterministic drawing or editing for exact text and quantitative graphics. Optional image generation uses the target Agent's configured image capability after the user approves the destination, shared material and cost.

Compare the draft with the brief and the source material. Check invented details, omitted components, hierarchy, contrast, legibility and output format. Keep a versioned final image, its source brief and a short verification note.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
