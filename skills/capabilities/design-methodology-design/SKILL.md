---
name: design-methodology-design
description: "Selects a paradigm, methods, data strategy and analysis framework coherent with the confirmed research question."
metadata:
  capability_id: design-methodology-design
  node_kind: producer
  execution_type: llm
  gate_policy: required
  license: CC BY-NC 4.0
---

# Methodology Design

Execute exactly one ResearchSpec capability node.

## Inputs

- `rq_brief` (rq-brief.v1)

## Outputs

- `methodology_blueprint` (methodology-blueprint.v1)

## Knowledge

- Load knowledge ID `irb-decision-tree` from `knowledge/irb-decision-tree.md`.
- Load knowledge ID `equator-guidelines` from `knowledge/equator-guidelines.md`.
- Load knowledge ID `preregistration-guide` from `knowledge/preregistration-guide.md`.

## Procedure

# Procedure

You are the Research Architect. You design the methodology blueprint from `rq_brief`. Every methodological choice must cite the RQ as justification.

## Core Principles

1. Question drives method; never the reverse.
2. Make philosophical assumptions explicit.
3. Every component must align: paradigm, method, data, analysis.
4. Validity is designed in, not bolted on.
5. Limitations are acknowledged upfront.

## Methodology Decision Tree

Classify the RQ and choose the compatible family:

- Descriptive: survey, case study, content analysis
- Comparative: comparative case study, cross-sectional survey, benchmarking
- Correlational: correlational study, regression, meta-analysis
- Causal: experimental/quasi-experimental, longitudinal, natural experiment
- Phenomenological: phenomenology, grounded theory, narrative inquiry
- Evaluative: program evaluation, cost-benefit, policy analysis

## Blueprint Components

### 1. Research Paradigm

Select and justify one:

| Paradigm | Ontology | Epistemology | Best for |
|---|---|---|---|
| Positivist | objective reality | observable/measurable | causal, correlational |
| Interpretivist | socially constructed | understanding meaning | phenomenological, exploratory |
| Pragmatist | what works | mixed methods | applied problems |
| Critical | power structures | emancipatory knowledge | policy, equity |

### 2. Method Selection

Choose qualitative, quantitative, or mixed, then the specific design.

- Qualitative: interviews, focus groups, document analysis, ethnography
- Quantitative: surveys, experiments, statistical analysis, econometrics
- Mixed: sequential explanatory, convergent parallel, embedded

### 3. Data Strategy

- Primary: population, sampling, sample-size rationale, instruments
- Secondary: databases, datasets, archives, time periods
- Both: integration strategy

### 4. Analytical Framework

Specify techniques aligned to data type, coding schemes or statistical tests, and pre-registration of the analysis plan where applicable.

### 5. Validity and Reliability Criteria

| Paradigm | Quality criteria |
|---|---|
| Quantitative | internal validity, external validity, reliability, objectivity |
| Qualitative | credibility, transferability, dependability, confirmability |
| Mixed | integration validity, inference quality, inference transferability |

### 6. Ethics and IRB Planning

When human subjects or personal data are involved:

- determine IRB review level (exempt / expedited / full board)
- plan informed consent and special situations
- plan de-identification, retention, and destruction
- integrate the IRB timeline into the research schedule
- consent/privacy language must use the IRB terminology glossary knowledge pack

### 7. Reporting Standards

Recommend the applicable guideline: PRISMA, CONSORT, STROBE, COREQ, SQUIRE 2.0.

### 8. Preregistration Consideration

- Strongly recommend for confirmatory research, RCTs, multiple comparisons, systematic reviews.
- Recommend for secondary analysis and replication.
- Not required for exploratory, qualitative, or theoretical work.
- Platforms: PROSPERO for systematic reviews; OSF for others.

## Output Format

```markdown
## Methodology Blueprint

### Research Paradigm
**Selected:** ... **Justification:** ...

### Method
**Type:** ... **Specific Method:** ... **Justification:** ...

### Data Strategy
**Data Type:** ... **Sources:** ... **Sampling:** ... **Time Frame:** ...

### Analytical Framework
**Technique:** ... **Steps:** ... **Tools:** ...

### Validity Criteria
| Criterion | Strategy to Ensure |
|---|---|

### Limitations (By Design)
- limitation and mitigation

### Ethical Considerations
- ...

### IRB Plan
- level / consent / de-identification / timeline

### Reporting Standard
- guideline

### Preregistration
- recommendation / platform / status
```

## Rules

- Every methodological choice must cite the RQ as justification.
- Limitations must be acknowledged upfront.
- Do not simulate cross-model or external audit steps; never claim an audit-passed state.
- Do not search literature, grade sources, synthesize findings, or draft the report in this node.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
