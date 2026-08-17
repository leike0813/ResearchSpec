# Scientific Agent Skills Extension Anchor Analysis — v2.53.0

- upstream: https://github.com/K-Dense-AI/scientific-agent-skills.git
- revision: `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`
- upstream content files: 1483
- upstream tree SHA-256: `473fc1ce60c03142871b8f065e847ffd2bdd201ad9da3bdc77451b33873d9014`
- immutable audit SHA-256: `9148800006cc3585f7fc9a4533bdfca64e9306bae2bcb9cd6525f3c0d88fe161`
- advisory vendor bundle SHA-256: `1b90eaa3f91a25c4d8decbc67854012e96d5a252b98a936e3960b5f04d27e157`

## Upstream Inventory

| top-level area | files |
|---|---|
| .github | 3 |
| .gitignore | 1 |
| CONTRIBUTING.md | 1 |
| LICENSE.md | 1 |
| README.md | 1 |
| SECURITY.md | 1 |
| docs | 4 |
| pyproject.toml | 1 |
| scan_pr_skills.py | 1 |
| scan_skills.py | 1 |
| skills | 1468 |

| extension | files |
|---|---|
| (none) | 3 |
| .bib | 1 |
| .bst | 3 |
| .csv | 4 |
| .gif | 2 |
| .html | 2 |
| .json | 8 |
| .md | 985 |
| .mplstyle | 3 |
| .png | 3 |
| .py | 296 |
| .sh | 3 |
| .sty | 4 |
| .tex | 30 |
| .toml | 1 |
| .txt | 4 |
| .xml | 5 |
| .xsd | 117 |
| .yaml | 5 |
| .yml | 4 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `scientific-agent-skills-aeon` | `plugin-scientific-agent-skills-aeon` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-astropy` | `plugin-scientific-agent-skills-astropy` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-benchling-integration` | `plugin-scientific-agent-skills-benchling-integration` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-cirq` | `plugin-scientific-agent-skills-cirq` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-fluidsim` | `plugin-scientific-agent-skills-fluidsim` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-generate-image` | `plugin-scientific-agent-skills-generate-image` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geomaster` | `plugin-scientific-agent-skills-geomaster` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geopandas` | `plugin-scientific-agent-skills-geopandas` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-ginkgo-cloud-lab` | `plugin-scientific-agent-skills-ginkgo-cloud-lab` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-infographics` | `plugin-scientific-agent-skills-infographics` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-labarchive-integration` | `plugin-scientific-agent-skills-labarchive-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-latex-posters` | `plugin-scientific-agent-skills-latex-posters` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-liteparse` | `plugin-scientific-agent-skills-liteparse` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markdown-mermaid-writing` | `plugin-scientific-agent-skills-markdown-mermaid-writing` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markitdown` | `plugin-scientific-agent-skills-markitdown` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matlab` | `plugin-scientific-agent-skills-matlab` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matplotlib` | `plugin-scientific-agent-skills-matplotlib` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-modal` | `plugin-scientific-agent-skills-modal` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-networkx` | `plugin-scientific-agent-skills-networkx` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-open-notebook` | `plugin-scientific-agent-skills-open-notebook` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-opentrons-integration` | `plugin-scientific-agent-skills-opentrons-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-optimize-for-gpu` | `plugin-scientific-agent-skills-optimize-for-gpu` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pacsomatic` | `plugin-scientific-agent-skills-pacsomatic` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-parallel-web` | `plugin-scientific-agent-skills-parallel-web` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pennylane` | `plugin-scientific-agent-skills-pennylane` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pptx-posters` | `plugin-scientific-agent-skills-pptx-posters` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-protocolsio-integration` | `plugin-scientific-agent-skills-protocolsio-integration` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pufferlib` | `plugin-scientific-agent-skills-pufferlib` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pylabrobot` | `plugin-scientific-agent-skills-pylabrobot` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymatgen` | `plugin-scientific-agent-skills-pymatgen` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymoo` | `plugin-scientific-agent-skills-pymoo` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pytorch-lightning` | `plugin-scientific-agent-skills-pytorch-lightning` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pyzotero` | `plugin-scientific-agent-skills-pyzotero` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qiskit` | `plugin-scientific-agent-skills-qiskit` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qutip` | `plugin-scientific-agent-skills-qutip` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-schematics` | `plugin-scientific-agent-skills-scientific-schematics` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-slides` | `plugin-scientific-agent-skills-scientific-slides` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scientific-visualization` | `plugin-scientific-agent-skills-scientific-visualization` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-scikit-learn` | `plugin-scientific-agent-skills-scikit-learn` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-seaborn` | `plugin-scientific-agent-skills-seaborn` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-shap` | `plugin-scientific-agent-skills-shap` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-simpy` | `plugin-scientific-agent-skills-simpy` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-stable-baselines3` | `plugin-scientific-agent-skills-stable-baselines3` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-sympy` | `plugin-scientific-agent-skills-sympy` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-timesfm-forecasting` | `plugin-scientific-agent-skills-timesfm-forecasting` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-torch-geometric` | `plugin-scientific-agent-skills-torch-geometric` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-transformers` | `plugin-scientific-agent-skills-transformers` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-umap-learn` | `plugin-scientific-agent-skills-umap-learn` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-venue-templates` | `plugin-scientific-agent-skills-venue-templates` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |

## Decisions

- [x] 上游身份固定为 `v2.53.0` @ `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`。
- [x] 49 个 reviewed vendor-bundle Skills 一对一映射为 49 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 49 个 capability 使用统一 evidence-bound brief validator；410 个 reviewed 资源按原相对路径逐字节打包为 knowledge refs（含二进制示例资产）。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
