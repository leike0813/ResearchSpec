# Design

## Context

See proposal.md for motivation. Fixed capabilities already use schema-1 manifests and the runtime-derived Procedure catalog; preset graphs use schema 2. Handoff supports ordinary files and a directory form reserved for LaTeX. The shared authoring converter currently decodes package assets as UTF-8 and assigns one license to all resources.

## Goals / Non-Goals

**Goals:** Preserve all nine upstream businesses and their reviewed tools, make semantic stages reusable, and keep CLI-only formal state authority.

**Non-Goals:** New public commands, plugin/domain membership, a second host entry, service setup, dependency installation, a new generic runner, or legal submission and authorization.

## Decisions

1. Pin a third-party submodule at 5073d3d837a5d139ef2bc763c9dd46bb9605df84. Inventory every tracked file; classify production resources, excluded automation/examples and external data/models. Author provenance and adaptation decisions outside the vendor tree.
2. Generate 18 fixed stages: design-patent-intake, design-patent-invention-mining, discovery-patent-search, analysis-patent-reading, analysis-patent-prior-art, generation-patent-disclosure, check-patent-disclosure, generation-patent-application, check-patent-application, transform-patent-docket-revision, check-patent-docket, analysis-patent-claim-chart, design-patent-protection-layout, generation-patent-map, generation-patent-oa-response, check-patent-oa-response, discovery-patent-exam-policy, transform-patent-research-evidence. Native source root routing is replaced by Procedure discovery and graph-owned control.
3. Bind file roles consistently: intake produces patent_case; mining produces invention_brief/search_request; search produces search_results; reading consumes patent_corpus and produces patent_notes/claim_features; prior-art consumes case, invention brief and search results; disclosure/application producers return disclosure_bundle/application_bundle; checkers return their domain review report; a docket revision returns versioned disclosure/application bundles; chart consumes claim_features/comparison_materials; map consumes patent_notes; OA consumes office_action/application_bundle; the research bridge produces annotated_bibliography/synthesis_report. Input file roles allow handoff and node_output.
4. Use project-relative file indexes for case materials, corpora and deliverable bundles. Each index names ordinary files and evidence limits. Semantic revisions are versioned; indexes and notes never certify graph completion. Optional Obsidian is an explicitly selected external projection. Maps read an explicit frozen corpus and use loopback-only local presentation.
5. Keep one reviewed maintenance source for duplicated tools and generate independent package copies. Preserve business-specific variants where their semantics differ. Binary asset copying and per-asset licenses are small additions to shared authoring. Conditional references remain behind explicit read conditions.
6. Register five patent profiles (disclosure, application, docket, intelligence, OA) and two compositions (research-to-patent, patent-informed-paper). Docket uses the existing revision template and a human continue/complete Decision, with three rounds as the displayed task budget rather than a new engine maximum. Selected protection-layout work has its own human Gate before application. Navigate selects accepted previous-round versions through the CLI handoff before another revision. Research-to-patent reuses intake to merge actual technical materials and research outputs into a case index. Patent-informed-paper confirms source scope at its root Gate, then unlocks both source subgraphs for an all-join; both compositions preserve academic graded sources. Independent inputs remain unbound when optional.
7. Keep services and interpreters user-configured. Conversion, installation and static checks never execute vendor tools. Publish license-reviewed Mermaid/Three.js resources with notices; models and IPC data are external configured inputs. Product images and source workflow maintenance automation are audit-only.
8. Store dedicated maintenance state in audits/patent-disclosure-skill/catalog.json. Source extraction, production definitions, graph sources and the full generated-tree review are separately traceable; artifacts, records, baseline, check and diff reuse existing byte-level audit helpers.

## Risks / Trade-offs

- External tools can be absent: retain text/evidence drafts, record unavailable computation, and never claim that an unexecuted tool succeeded.
- Patent disclosure is not empirical proof: the research bridge labels source category and evidence limits, preserves academic sources, and does not promote draft claims into stable specs.
- Source helpers contain global paths, installers and autonomous orchestration: adaptations expose configured paths and local semantic tools; formal consent and transitions remain in Navigate/CLI.
- Resource copying can corrupt binaries or drop notices: copied-tree behavior tests and byte-level source/resource checks cover distribution.

## Delivery

Update source definitions and generated packages/profiles together, preserve existing profile identities and package bytes, validate both compositions and all tool boundaries, and retain this OpenSpec change until explicitly finalized. No commit or dependency installation is part of implementation.
