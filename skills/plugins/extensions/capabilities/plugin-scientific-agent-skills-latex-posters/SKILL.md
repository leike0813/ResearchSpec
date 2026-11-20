---
name: plugin-scientific-agent-skills-latex-posters
description: "Plans and verifies LaTeX research posters with editable templates, source-checked figures, user-provisioned local PDF tools, and a final publication review."
metadata:
  capability_id: plugin-scientific-agent-skills-latex-posters
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
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
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `sas-assets-baposter-template.tex` from `assets/baposter_template.tex`.
- Load knowledge ID `sas-assets-beamerposter-template.tex` from `assets/beamerposter_template.tex`.
- Load knowledge ID `sas-assets-poster-quality-checklist.md` from `assets/poster_quality_checklist.md`.
- Load knowledge ID `sas-assets-tikzposter-template.tex` from `assets/tikzposter_template.tex`.
- Load knowledge ID `sas-references-readme.md` from `references/README.md`.
- Load knowledge ID `sas-references-compilation-and-quality-control.md` from `references/compilation_and_quality_control.md`.
- Load knowledge ID `sas-references-latex-poster-packages.md` from `references/latex_poster_packages.md`.
- Load knowledge ID `sas-references-latex-poster-reference.md` from `references/latex_poster_reference.md`.
- Load knowledge ID `sas-references-poster-content-guide.md` from `references/poster_content_guide.md`.
- Load knowledge ID `sas-references-poster-design-principles.md` from `references/poster_design_principles.md`.
- Load knowledge ID `sas-references-poster-layout-design.md` from `references/poster_layout_design.md`.
- Load knowledge ID `sas-references-poster-patterns-and-presentation.md` from `references/poster_patterns_and_presentation.md`.
- Load knowledge ID `sas-scripts-review-poster.sh` from `scripts/review_poster.sh`.

Follow the reviewed procedure and its resource guidance. ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_scientific_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
