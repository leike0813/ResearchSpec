# Scientific Agent Skills Extension Anchor Analysis — v2.70.0

- upstream: https://github.com/K-Dense-AI/scientific-agent-skills.git
- revision: `d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b`
- upstream content files: 2500
- upstream tree SHA-256: `e6a82e79c2417c8eedecb7ac1458b521d8d3d2f3a0e770560871de22158389df`
- immutable audit SHA-256: `ad494b000d44a088d4ea59d2f1580523f3b76628effe39d3fc6c7bb95a14f2ef`
- advisory vendor bundle SHA-256: `cb04f6f48ea2d010e56e978203cb822f54a2f5be1dec75e72b4464f1ddc8af23`

## Incremental Source Review

- Source: v2.53.0 -> v2.70.0; 1849 changed paths.
- Added upstream Skills: 21; removed: `iso-13485-certification`.
- Added capabilities: `plugin-scientific-agent-skills-analytical-method-validation` `plugin-scientific-agent-skills-datalad` `plugin-scientific-agent-skills-genomic-coordinates` `plugin-scientific-agent-skills-lab-hardware-cad` `plugin-scientific-agent-skills-ontology-term-resolution` `plugin-scientific-agent-skills-relsa-severity-assessment` `plugin-scientific-agent-skills-uncertainty-and-units`.
- Existing affected capabilities: 49; all are listed below.
- Full source diff, additions and exclusion decisions: `audits/scientific-agent-skills/v2.70.0/artifacts/incremental-review.json`, SHA-256 `3dbe8ab4609c7645fe5b568854e28d1a347d2ee85cadf0953fb450878f76a9dc`.

## Upstream Inventory

| top-level area | files |
|---|---|
| .github | 10 |
| .gitignore | 1 |
| AGENTS.md | 1 |
| CITATION.cff | 1 |
| CLAUDE.md | 1 |
| CODE_OF_CONDUCT.md | 1 |
| CONTRIBUTING.md | 1 |
| LICENSE.md | 1 |
| README.md | 1 |
| SECURITY.md | 1 |
| docs | 174 |
| plugin.json | 1 |
| pyproject.toml | 1 |
| scan_pr_skills.py | 1 |
| scan_skills.py | 1 |
| scripts | 1 |
| skills | 2078 |
| tests | 224 |

| extension | files |
|---|---|
| (none) | 3 |
| .bed | 6 |
| .bib | 1 |
| .bst | 3 |
| .cff | 1 |
| .csv | 43 |
| .fa | 1 |
| .fai | 1 |
| .gif | 2 |
| .gtf | 3 |
| .html | 1 |
| .js | 2 |
| .json | 97 |
| .kreport | 2 |
| .md | 1276 |
| .mplstyle | 3 |
| .png | 170 |
| .py | 694 |
| .sh | 3 |
| .sizes | 2 |
| .step | 4 |
| .sty | 1 |
| .tex | 16 |
| .toml | 2 |
| .tsv | 4 |
| .txt | 8 |
| .vcf | 6 |
| .xml | 13 |
| .xsd | 117 |
| .yaml | 5 |
| .yml | 10 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `scientific-agent-skills-aeon` | `plugin-scientific-agent-skills-aeon` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-analytical-method-validation` | `plugin-scientific-agent-skills-analytical-method-validation` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-astropy` | `plugin-scientific-agent-skills-astropy` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-benchling-integration` | `plugin-scientific-agent-skills-benchling-integration` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-cirq` | `plugin-scientific-agent-skills-cirq` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-datalad` | `plugin-scientific-agent-skills-datalad` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-fluidsim` | `plugin-scientific-agent-skills-fluidsim` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-generate-image` | `plugin-scientific-agent-skills-generate-image` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-genomic-coordinates` | `plugin-scientific-agent-skills-genomic-coordinates` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geomaster` | `plugin-scientific-agent-skills-geomaster` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geopandas` | `plugin-scientific-agent-skills-geopandas` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-ginkgo-cloud-lab` | `plugin-scientific-agent-skills-ginkgo-cloud-lab` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-infographics` | `plugin-scientific-agent-skills-infographics` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-lab-hardware-cad` | `plugin-scientific-agent-skills-lab-hardware-cad` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-labarchive-integration` | `plugin-scientific-agent-skills-labarchive-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-latex-posters` | `plugin-scientific-agent-skills-latex-posters` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-liteparse` | `plugin-scientific-agent-skills-liteparse` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markdown-mermaid-writing` | `plugin-scientific-agent-skills-markdown-mermaid-writing` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markitdown` | `plugin-scientific-agent-skills-markitdown` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matlab` | `plugin-scientific-agent-skills-matlab` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matplotlib` | `plugin-scientific-agent-skills-matplotlib` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-modal` | `plugin-scientific-agent-skills-modal` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-networkx` | `plugin-scientific-agent-skills-networkx` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-ontology-term-resolution` | `plugin-scientific-agent-skills-ontology-term-resolution` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-open-notebook` | `plugin-scientific-agent-skills-open-notebook` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-opentrons-integration` | `plugin-scientific-agent-skills-opentrons-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-optimize-for-gpu` | `plugin-scientific-agent-skills-optimize-for-gpu` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pacsomatic` | `plugin-scientific-agent-skills-pacsomatic` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-parallel-web` | `plugin-scientific-agent-skills-parallel-web` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pennylane` | `plugin-scientific-agent-skills-pennylane` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pptx-posters` | `plugin-scientific-agent-skills-pptx-posters` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-protocolsio-integration` | `plugin-scientific-agent-skills-protocolsio-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pufferlib` | `plugin-scientific-agent-skills-pufferlib` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pylabrobot` | `plugin-scientific-agent-skills-pylabrobot` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymatgen` | `plugin-scientific-agent-skills-pymatgen` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymoo` | `plugin-scientific-agent-skills-pymoo` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pytorch-lightning` | `plugin-scientific-agent-skills-pytorch-lightning` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pyzotero` | `plugin-scientific-agent-skills-pyzotero` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qiskit` | `plugin-scientific-agent-skills-qiskit` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qutip` | `plugin-scientific-agent-skills-qutip` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-relsa-severity-assessment` | `plugin-scientific-agent-skills-relsa-severity-assessment` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-schematics` | `plugin-scientific-agent-skills-scientific-schematics` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-slides` | `plugin-scientific-agent-skills-scientific-slides` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-visualization` | `plugin-scientific-agent-skills-scientific-visualization` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scikit-learn` | `plugin-scientific-agent-skills-scikit-learn` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-seaborn` | `plugin-scientific-agent-skills-seaborn` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-shap` | `plugin-scientific-agent-skills-shap` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-simpy` | `plugin-scientific-agent-skills-simpy` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-stable-baselines3` | `plugin-scientific-agent-skills-stable-baselines3` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-sympy` | `plugin-scientific-agent-skills-sympy` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-timesfm-forecasting` | `plugin-scientific-agent-skills-timesfm-forecasting` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-torch-geometric` | `plugin-scientific-agent-skills-torch-geometric` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-transformers` | `plugin-scientific-agent-skills-transformers` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-umap-learn` | `plugin-scientific-agent-skills-umap-learn` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-uncertainty-and-units` | `plugin-scientific-agent-skills-uncertainty-and-units` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-venue-templates` | `plugin-scientific-agent-skills-venue-templates` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |

## Decisions

- [x] 上游身份固定为 `v2.70.0` @ `d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b`。
- [x] 56 个 reviewed vendor-bundle Skills 一对一映射为 56 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 56 个 capability 使用统一 evidence-bound brief validator；632 个 reviewed 资源按原相对路径逐字节打包为 knowledge refs（含二进制示例资产）。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
