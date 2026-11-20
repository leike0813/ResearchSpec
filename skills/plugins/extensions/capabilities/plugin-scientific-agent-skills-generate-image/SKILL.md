---
name: plugin-scientific-agent-skills-generate-image
description: "Prepares and reviews image briefs for scientific communication, including composition, source material, accessibility, output format, and factual verification."
metadata:
  capability_id: plugin-scientific-agent-skills-generate-image
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
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
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- No packaged knowledge files; all execution rules are in this SKILL.

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
