# Scientific Agent Skills Extension Anchor Analysis — v2.72.0

- upstream: https://github.com/K-Dense-AI/scientific-agent-skills.git
- revision: `526ebce143bc326f44471554e33d66a19c840360`
- upstream content files: 2780
- upstream tree SHA-256: `240f463d4ea372ec7c70e8a63195ded1e6aa662c366ddd95e38cbff717821567`
- immutable audit SHA-256: `8bfe85450fe5b224680da94e9fe9be68ababe402577f558112ba273c24524946`
- advisory vendor bundle SHA-256: `79f1bba9c2dfd3973532f7b9a5aa6a39d3a24fe89c6647f1f48c8a7734226d41`

## Incremental Source Review

- Source: v2.70.0 -> v2.72.0; 2626 changed paths.
- Added upstream Skills: 14; removed: `docx` `pdf` `pptx` `xlsx`.
- Added capabilities: `plugin-scientific-agent-skills-13c-metabolic-flux` `plugin-scientific-agent-skills-cantera` `plugin-scientific-agent-skills-cellprofiler` `plugin-scientific-agent-skills-flowkit` `plugin-scientific-agent-skills-marine-carbonate-chemistry` `plugin-scientific-agent-skills-nmrglue` `plugin-scientific-agent-skills-nwb-conversion` `plugin-scientific-agent-skills-pybamm` `plugin-scientific-agent-skills-pycalphad` `plugin-scientific-agent-skills-qiime2-amplicon` `plugin-scientific-agent-skills-relion` `plugin-scientific-agent-skills-tellurium`.
- Existing affected capabilities: 56; all are listed below.
- Full source diff, additions and exclusion decisions: `audits/scientific-agent-skills/v2.72.0/artifacts/incremental-review.json`, SHA-256 `d71c1ddddb1d767457e52966a1c2e53d150bc0be924ffffa3a4b6d7f4eb9ac3b`.

- Candidate inventory: `audits/scientific-agent-skills/v2.72.0/artifacts/source-inventory.json`, SHA-256 `35189d298fe527b633a90a0158ef092577a512dfd9590a6a993946e3b11faaf4`.

- Confirmed maintainer actions: `audits/scientific-agent-skills/v2.72.0/artifacts/maintainer-decisions.json`, SHA-256 `6335bd5103561aca70ede755eb629f00303ff9d3e4562e3fcb2ca98f59d79207`.

## Upstream Inventory

| top-level area | files |
|---|---|
| .github | 10 |
| .gitignore | 1 |
| AGENTS.md | 1 |
| CITATION.cff | 1 |
| CODE_OF_CONDUCT.md | 1 |
| CONTRIBUTING.md | 1 |
| LICENSE.md | 1 |
| README.md | 1 |
| SECURITY.md | 1 |
| docs | 362 |
| plugin.json | 1 |
| pyproject.toml | 1 |
| scan_pr_skills.py | 1 |
| scan_skills.py | 1 |
| scripts | 1 |
| skills | 2025 |
| tests | 370 |

| extension | files |
|---|---|
| (none) | 5 |
| .ant | 1 |
| .bed | 7 |
| .bib | 1 |
| .bst | 3 |
| .cff | 1 |
| .cppipe | 1 |
| .csv | 42 |
| .fa | 1 |
| .fai | 1 |
| .fasta | 4 |
| .fastq | 1 |
| .fcs | 1 |
| .fid | 1 |
| .gif | 1 |
| .gtf | 3 |
| .gz | 20 |
| .js | 2 |
| .json | 113 |
| .kreport | 2 |
| .md | 1538 |
| .mplstyle | 3 |
| .nwk | 1 |
| .png | 177 |
| .py | 771 |
| .sh | 3 |
| .sizes | 2 |
| .step | 4 |
| .sty | 1 |
| .tdb | 1 |
| .tex | 16 |
| .toml | 3 |
| .tsv | 10 |
| .txt | 9 |
| .vcf | 6 |
| .wsp | 1 |
| .xml | 8 |
| .yaml | 5 |
| .yml | 10 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `scientific-agent-skills-13c-metabolic-flux` | `plugin-scientific-agent-skills-13c-metabolic-flux` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-aeon` | `plugin-scientific-agent-skills-aeon` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-analytical-method-validation` | `plugin-scientific-agent-skills-analytical-method-validation` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-astropy` | `plugin-scientific-agent-skills-astropy` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-benchling-integration` | `plugin-scientific-agent-skills-benchling-integration` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-cantera` | `plugin-scientific-agent-skills-cantera` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-cellprofiler` | `plugin-scientific-agent-skills-cellprofiler` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-cirq` | `plugin-scientific-agent-skills-cirq` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-datalad` | `plugin-scientific-agent-skills-datalad` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-flowkit` | `plugin-scientific-agent-skills-flowkit` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-fluidsim` | `plugin-scientific-agent-skills-fluidsim` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-generate-image` | `plugin-scientific-agent-skills-generate-image` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-genomic-coordinates` | `plugin-scientific-agent-skills-genomic-coordinates` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geomaster` | `plugin-scientific-agent-skills-geomaster` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-geopandas` | `plugin-scientific-agent-skills-geopandas` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-ginkgo-cloud-lab` | `plugin-scientific-agent-skills-ginkgo-cloud-lab` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-infographics` | `plugin-scientific-agent-skills-infographics` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-lab-hardware-cad` | `plugin-scientific-agent-skills-lab-hardware-cad` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-labarchive-integration` | `plugin-scientific-agent-skills-labarchive-integration` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-latex-posters` | `plugin-scientific-agent-skills-latex-posters` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-liteparse` | `plugin-scientific-agent-skills-liteparse` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-marine-carbonate-chemistry` | `plugin-scientific-agent-skills-marine-carbonate-chemistry` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markdown-mermaid-writing` | `plugin-scientific-agent-skills-markdown-mermaid-writing` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-markitdown` | `plugin-scientific-agent-skills-markitdown` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matlab` | `plugin-scientific-agent-skills-matlab` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-matplotlib` | `plugin-scientific-agent-skills-matplotlib` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-modal` | `plugin-scientific-agent-skills-modal` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-networkx` | `plugin-scientific-agent-skills-networkx` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-nmrglue` | `plugin-scientific-agent-skills-nmrglue` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-nwb-conversion` | `plugin-scientific-agent-skills-nwb-conversion` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
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
| `scientific-agent-skills-pybamm` | `plugin-scientific-agent-skills-pybamm` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pycalphad` | `plugin-scientific-agent-skills-pycalphad` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pylabrobot` | `plugin-scientific-agent-skills-pylabrobot` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymatgen` | `plugin-scientific-agent-skills-pymatgen` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pymoo` | `plugin-scientific-agent-skills-pymoo` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pytorch-lightning` | `plugin-scientific-agent-skills-pytorch-lightning` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-pyzotero` | `plugin-scientific-agent-skills-pyzotero` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qiime2-amplicon` | `plugin-scientific-agent-skills-qiime2-amplicon` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qiskit` | `plugin-scientific-agent-skills-qiskit` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-qutip` | `plugin-scientific-agent-skills-qutip` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-relion` | `plugin-scientific-agent-skills-relion` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
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
| `scientific-agent-skills-tellurium` | `plugin-scientific-agent-skills-tellurium` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-timesfm-forecasting` | `plugin-scientific-agent-skills-timesfm-forecasting` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-torch-geometric` | `plugin-scientific-agent-skills-torch-geometric` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-transformers` | `plugin-scientific-agent-skills-transformers` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-umap-learn` | `plugin-scientific-agent-skills-umap-learn` | llm | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-uncertainty-and-units` | `plugin-scientific-agent-skills-uncertainty-and-units` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `scientific-agent-skills-venue-templates` | `plugin-scientific-agent-skills-venue-templates` | mixed | scientific-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |

## Decisions

- [x] 上游身份固定为 `v2.72.0` @ `526ebce143bc326f44471554e33d66a19c840360`。
- [x] 68 个 reviewed vendor-bundle Skills 一对一映射为 68 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 68 个 capability 使用统一 evidence-bound brief validator；664 个 reviewed 资源按原相对路径逐字节打包为 knowledge refs（含二进制示例资产）。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
