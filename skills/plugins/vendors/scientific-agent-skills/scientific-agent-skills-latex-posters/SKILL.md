---
name: scientific-agent-skills-latex-posters
description: Plans and verifies LaTeX research posters with editable templates,
  source-checked figures, user-provisioned local PDF tools, and a final
  publication review.
license: MIT
compatibility: Requires the packages, services, hardware, and local runtimes
  described by this Skill. Declare LaTeX and local PDF inspection tools as
  user-provisioned dependencies and require consent before any target-Agent
  external model use. ResearchSpec installs files only and never executes
  scripts, installs dependencies, or configures credentials.
metadata:
  vendor: scientific-agent-skills
  vendor-release: v2.72.0
  upstream-skill-id: latex-posters
  researchspec-role: semantic-helper
---

> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Keep templates, poster-design guidance, and local PDF review; describe optional visual generation only through the target Agent's configured generic image capability with no provider names or secret handling.
> - Declare LaTeX and local PDF inspection tools as user-provisioned dependencies and require consent before any target-Agent external model use.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/latex-posters/scripts/generate_schematic.py`, `skills/latex-posters/scripts/generate_schematic_ai.py`, `skills/latex-posters/references/ai_graphics_for_posters.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/review_poster.sh`. The target Agent must inspect requirements and side effects before execution.

# LaTeX Research Posters

Confirm the venue's size, orientation, typography, print and submission requirements. Choose the provided template type that fits the available local TeX environment and the expected reading order. Plan a clear title, short evidence-led story, figures with readable labels, and consistent citations.

Compare the supplied Beamer, baposter and TikZ templates against the venue dimensions, desired layout and available TeX packages. Resolve layout and package compatibility before placing final figures.

Use source-backed figures and review the poster at its intended size. Optional illustration uses the target Agent's configured capability with separate approval for sharing and costs.

Compile in the user's local environment, resolve figure, font and bibliography errors, and compile again when cross-references change. Review the expected page dimensions, font embedding and image resolution with `references/compilation_and_quality_control.md` and the local `scripts/review_poster.sh` helper.

Inspect the rendered poster for overflow, typography, contrast, scientific accuracy and print requirements. Apply `assets/poster_quality_checklist.md`, then deliver the editable project, final PDF and review notes.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
