# Education Agent Skills Extension Anchor Analysis — snapshot-32fce5c

- upstream: https://github.com/GarethManning/education-agent-skills
- revision: `32fce5c0d097ec675cf81c750a65a379e4d87e3c`
- upstream content files: 238
- upstream tree SHA-256: `dd7610d44632d22eb5e73100f68e1aba4d15387dbd5dfac756b3a029c6b1f0e4`
- immutable audit SHA-256: `e9326c43078db4c6bce4387c5a41a5bef775ad4d1691095c2020ef9cb9926857`
- advisory vendor bundle SHA-256: `7b3aec60c65fe4ada423c22f5b5c55654969f2bc788db26809ea7056e4336fbc`

## Upstream Inventory

| top-level area | files |
|---|---|
| .agents | 1 |
| .claude-plugin | 2 |
| .codex-plugin | 1 |
| .github | 1 |
| .gitignore | 1 |
| AGENTS.md | 1 |
| AUDIT.md | 1 |
| CHANGELOG.md | 1 |
| CLAUDE.md | 1 |
| CONTRIBUTING.md | 1 |
| README.md | 1 |
| STATE.md | 1 |
| assets | 1 |
| docs | 16 |
| llms.txt | 1 |
| mcp-server | 34 |
| package-lock.json | 1 |
| package.json | 1 |
| playwright.config.ts | 1 |
| registry.json | 1 |
| scripts | 3 |
| skills | 165 |
| tests | 1 |

| extension | files |
|---|---|
| (none) | 3 |
| .html | 2 |
| .json | 12 |
| .md | 190 |
| .py | 3 |
| .svg | 2 |
| .ts | 23 |
| .txt | 2 |
| .yml | 1 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `education-agent-skills-academic-language-sentence-frame-generator` | `plugin-education-agent-skills-academic-language-sentence-frame-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-adaptive-hint-sequence-designer` | `plugin-education-agent-skills-adaptive-hint-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-agency-circles-for-systems-action` | `plugin-education-agent-skills-agency-circles-for-systems-action` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-agency-scaffold-generator` | `plugin-education-agent-skills-agency-scaffold-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-claim-checker` | `plugin-education-agent-skills-ai-claim-checker` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-expertise-interrogation-designer` | `plugin-education-agent-skills-ai-expertise-interrogation-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-facilitated-collaborative-learning-designer` | `plugin-education-agent-skills-ai-facilitated-collaborative-learning-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-feedback-design-principles` | `plugin-education-agent-skills-ai-feedback-design-principles` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-hallucination-fact-check-protocol` | `plugin-education-agent-skills-ai-hallucination-fact-check-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-learning-boundary-mapper` | `plugin-education-agent-skills-ai-learning-boundary-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-output-critical-audit-designer` | `plugin-education-agent-skills-ai-output-critical-audit-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ai-socratic-dialogue-designer` | `plugin-education-agent-skills-ai-socratic-dialogue-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-argument-structure-scaffold-generator` | `plugin-education-agent-skills-argument-structure-scaffold-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-aspirational-systems-iceberg` | `plugin-education-agent-skills-aspirational-systems-iceberg` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-assessment-validity-checker` | `plugin-education-agent-skills-assessment-validity-checker` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-awe-wonder-experience-designer` | `plugin-education-agent-skills-awe-wonder-experience-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-backwards-design-unit-planner` | `plugin-education-agent-skills-backwards-design-unit-planner` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-belonging-classroom-culture-designer` | `plugin-education-agent-skills-belonging-classroom-culture-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-biophilic-learning-environment-designer` | `plugin-education-agent-skills-biophilic-learning-environment-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-checking-for-understanding-protocol-designer` | `plugin-education-agent-skills-checking-for-understanding-protocol-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-cognitive-load-analyser` | `plugin-education-agent-skills-cognitive-load-analyser` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-cognitive-tutoring-architecture-designer` | `plugin-education-agent-skills-cognitive-tutoring-architecture-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-competency-unpacker` | `plugin-education-agent-skills-competency-unpacker` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-confidence-calibration-check` | `plugin-education-agent-skills-confidence-calibration-check` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-coverage-audit` | `plugin-education-agent-skills-coverage-audit` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-cpa-sequence-designer` | `plugin-education-agent-skills-cpa-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-criterion-referenced-rubric-generator` | `plugin-education-agent-skills-criterion-referenced-rubric-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-critical-thinking-task-designer` | `plugin-education-agent-skills-critical-thinking-task-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-cross-cultural-task-validity-checker` | `plugin-education-agent-skills-cross-cultural-task-validity-checker` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-culturally-responsive-teaching-designer` | `plugin-education-agent-skills-culturally-responsive-teaching-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-curriculum-crosswalk` | `plugin-education-agent-skills-curriculum-crosswalk` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-curriculum-knowledge-architecture-designer` | `plugin-education-agent-skills-curriculum-knowledge-architecture-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-dialogic-teaching-move-generator` | `plugin-education-agent-skills-dialogic-teaching-move-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-differentiation-adapter` | `plugin-education-agent-skills-differentiation-adapter` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-digital-worked-example-sequence` | `plugin-education-agent-skills-digital-worked-example-sequence` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-disciplinary-ai-literacy-sequence-designer` | `plugin-education-agent-skills-disciplinary-ai-literacy-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-disciplinary-writing-scaffold` | `plugin-education-agent-skills-disciplinary-writing-scaffold` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-discipline-specific-critical-thinking-task-designer` | `plugin-education-agent-skills-discipline-specific-critical-thinking-task-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-discussion-protocol-selector` | `plugin-education-agent-skills-discussion-protocol-selector` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-dual-coding-designer` | `plugin-education-agent-skills-dual-coding-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ecological-inquiry-anchor-designer` | `plugin-education-agent-skills-ecological-inquiry-anchor-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-elaborative-interrogation-generator` | `plugin-education-agent-skills-elaborative-interrogation-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-emergent-project-design-scaffold` | `plugin-education-agent-skills-emergent-project-design-scaffold` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-erroneous-example-designer` | `plugin-education-agent-skills-erroneous-example-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-error-analysis-protocol` | `plugin-education-agent-skills-error-analysis-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-experiential-learning-cycle-designer` | `plugin-education-agent-skills-experiential-learning-cycle-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-explain-first-interrogator` | `plugin-education-agent-skills-explain-first-interrogator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-explicit-instruction-sequence-builder` | `plugin-education-agent-skills-explicit-instruction-sequence-builder` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-fading-manager` | `plugin-education-agent-skills-fading-manager` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-feedback-quality-analyser` | `plugin-education-agent-skills-feedback-quality-analyser` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-flow-state-condition-designer` | `plugin-education-agent-skills-flow-state-condition-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-formative-assessment-loop-designer` | `plugin-education-agent-skills-formative-assessment-loop-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-formative-assessment-technique-selector` | `plugin-education-agent-skills-formative-assessment-technique-selector` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-gap-analysis-from-student-work` | `plugin-education-agent-skills-gap-analysis-from-student-work` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-goal-setting-protocol-designer` | `plugin-education-agent-skills-goal-setting-protocol-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-hexagon-complexity-mapper` | `plugin-education-agent-skills-hexagon-complexity-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-hinge-question-designer` | `plugin-education-agent-skills-hinge-question-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-implementation-intention-designer` | `plugin-education-agent-skills-implementation-intention-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-individual-spacing-algorithm-explainer` | `plugin-education-agent-skills-individual-spacing-algorithm-explainer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-instructional-coaching-conversation-guide` | `plugin-education-agent-skills-instructional-coaching-conversation-guide` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-intelligent-tutoring-dialogue-designer` | `plugin-education-agent-skills-intelligent-tutoring-dialogue-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-interdisciplinary-real-world-connection-mapper` | `plugin-education-agent-skills-interdisciplinary-real-world-connection-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-interleaving-unit-planner` | `plugin-education-agent-skills-interleaving-unit-planner` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-kud-chart-author` | `plugin-education-agent-skills-kud-chart-author` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-kud-knowledge-type-mapper` | `plugin-education-agent-skills-kud-knowledge-type-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ladder-of-inference-reflection` | `plugin-education-agent-skills-ladder-of-inference-reflection` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-language-demand-analyser` | `plugin-education-agent-skills-language-demand-analyser` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-learning-analytics-interpretation-guide` | `plugin-education-agent-skills-learning-analytics-interpretation-guide` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-learning-progression-builder` | `plugin-education-agent-skills-learning-progression-builder` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-lesson-observation-protocol-designer` | `plugin-education-agent-skills-lesson-observation-protocol-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-lesson-opening-designer` | `plugin-education-agent-skills-lesson-opening-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-lesson-study-cycle-designer` | `plugin-education-agent-skills-lesson-study-cycle-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-leverage-and-response-design` | `plugin-education-agent-skills-leverage-and-response-design` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-media-literacy-deconstruction-protocol` | `plugin-education-agent-skills-media-literacy-deconstruction-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-mental-model-mapper` | `plugin-education-agent-skills-mental-model-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-metacognitive-monitoring-ai-contexts` | `plugin-education-agent-skills-metacognitive-monitoring-ai-contexts` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-metacognitive-prompt-library` | `plugin-education-agent-skills-metacognitive-prompt-library` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-mixed-age-learning-task-designer` | `plugin-education-agent-skills-mixed-age-learning-task-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-motivation-diagnostic-task-redesign` | `plugin-education-agent-skills-motivation-diagnostic-task-redesign` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-outdoor-learning-sequence-designer` | `plugin-education-agent-skills-outdoor-learning-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-panel-review` | `plugin-education-agent-skills-panel-review` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-pedagogical-content-knowledge-developer` | `plugin-education-agent-skills-pedagogical-content-knowledge-developer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-perma-based-lesson-designer` | `plugin-education-agent-skills-perma-based-lesson-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-perspective-taking-designer` | `plugin-education-agent-skills-perspective-taking-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-phenomenon-based-unit-anchor` | `plugin-education-agent-skills-phenomenon-based-unit-anchor` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-place-based-inquiry-anchor` | `plugin-education-agent-skills-place-based-inquiry-anchor` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-practice-problem-sequence-designer` | `plugin-education-agent-skills-practice-problem-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-prepared-environment-designer` | `plugin-education-agent-skills-prepared-environment-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-productive-failure-desirable-difficulty-designer` | `plugin-education-agent-skills-productive-failure-desirable-difficulty-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-productive-failure-protocol` | `plugin-education-agent-skills-productive-failure-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-professional-development-session-designer` | `plugin-education-agent-skills-professional-development-session-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-progressive-hint-ladder` | `plugin-education-agent-skills-progressive-hint-ladder` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-project-brief-designer` | `plugin-education-agent-skills-project-brief-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-prompt-literacy-sequence-designer` | `plugin-education-agent-skills-prompt-literacy-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-reading-comprehension-strategy-selector` | `plugin-education-agent-skills-reading-comprehension-strategy-selector` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-reflective-practice-prompt-generator` | `plugin-education-agent-skills-reflective-practice-prompt-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-reggio-documentation-protocol` | `plugin-education-agent-skills-reggio-documentation-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-restorative-practice-protocol-designer` | `plugin-education-agent-skills-restorative-practice-protocol-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-retrieval-practice-generator` | `plugin-education-agent-skills-retrieval-practice-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-retrieve-first-gate` | `plugin-education-agent-skills-retrieve-first-gate` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ruler-emotional-literacy-sequence` | `plugin-education-agent-skills-ruler-emotional-literacy-sequence` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-scaffolded-task-modifier` | `plugin-education-agent-skills-scaffolded-task-modifier` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-scope-and-sequence-designer` | `plugin-education-agent-skills-scope-and-sequence-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-self-efficacy-builder-sequence` | `plugin-education-agent-skills-self-efficacy-builder-sequence` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-self-explanation-prompt-designer` | `plugin-education-agent-skills-self-explanation-prompt-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-self-regulation-scaffold-generator` | `plugin-education-agent-skills-self-regulation-scaffold-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-service-learning-project-designer` | `plugin-education-agent-skills-service-learning-project-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-sheltered-instruction-lesson-modifier` | `plugin-education-agent-skills-sheltered-instruction-lesson-modifier` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-socratic-questioning-sequence-generator` | `plugin-education-agent-skills-socratic-questioning-sequence-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-source-credibility-evaluation-protocol` | `plugin-education-agent-skills-source-credibility-evaluation-protocol` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-spaced-practice-scheduler` | `plugin-education-agent-skills-spaced-practice-scheduler` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-srl-session-wrapper` | `plugin-education-agent-skills-srl-session-wrapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-stuck-and-error-diagnosis-coach` | `plugin-education-agent-skills-stuck-and-error-diagnosis-coach` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-study-strategy-selector` | `plugin-education-agent-skills-study-strategy-selector` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-systems-awareness-iceberg` | `plugin-education-agent-skills-systems-awareness-iceberg` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-systems-wellbeing-impact-mapper` | `plugin-education-agent-skills-systems-wellbeing-impact-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-teach-back-evaluator` | `plugin-education-agent-skills-teach-back-evaluator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-teacher-inquiry-cycle-designer` | `plugin-education-agent-skills-teacher-inquiry-cycle-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-technological-pedagogical-content-knowledge-developer` | `plugin-education-agent-skills-technological-pedagogical-content-knowledge-developer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-text-complexity-analyser` | `plugin-education-agent-skills-text-complexity-analyser` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-think-aloud-script-generator` | `plugin-education-agent-skills-think-aloud-script-generator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-three-part-lesson-designer` | `plugin-education-agent-skills-three-part-lesson-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-transfer-bridge` | `plugin-education-agent-skills-transfer-bridge` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-trauma-informed-practice-designer` | `plugin-education-agent-skills-trauma-informed-practice-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-ubuntu-collective-knowledge-task-designer` | `plugin-education-agent-skills-ubuntu-collective-knowledge-task-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-udl-barrier-anticipator` | `plugin-education-agent-skills-udl-barrier-anticipator` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-udl-lesson-auditor` | `plugin-education-agent-skills-udl-lesson-auditor` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-udl-options-designer` | `plugin-education-agent-skills-udl-options-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-unassisted-evidence-checkpoint` | `plugin-education-agent-skills-unassisted-evidence-checkpoint` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-uninterrupted-work-cycle-designer` | `plugin-education-agent-skills-uninterrupted-work-cycle-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-variation-theory-task-designer` | `plugin-education-agent-skills-variation-theory-task-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-vocabulary-tiering-tool` | `plugin-education-agent-skills-vocabulary-tiering-tool` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-weekly-agency-review` | `plugin-education-agent-skills-weekly-agency-review` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-wellbeing-learning-connection-mapper` | `plugin-education-agent-skills-wellbeing-learning-connection-mapper` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-worked-example-fading-designer` | `plugin-education-agent-skills-worked-example-fading-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `education-agent-skills-worked-example-to-problem-solving-transition-designer` | `plugin-education-agent-skills-worked-example-to-problem-solving-transition-designer` | llm | education-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |

## Decisions

- [x] 上游身份固定为 `snapshot-32fce5c` @ `32fce5c0d097ec675cf81c750a65a379e4d87e3c`。
- [x] 136 个 reviewed vendor-bundle Skills 一对一映射为 136 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 136 个静态 llm capability 使用统一 evidence-bound brief validator；reviewed 树不含脚本或 references。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
