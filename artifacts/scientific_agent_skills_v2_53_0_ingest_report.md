# Scientific Agent Skills v2.53.0 Ingest 结论报告

## 1. 报告范围与事实来源

本报告记录 Scientific Agent Skills `v2.53.0` 在 ResearchSpec 中的正式 ingest 结论。上游固定 revision 为 `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`。审计范围为 147 个上游 Skill，其中 139 个为业务候选项，8 个为审计阶段已经确定的硬排除项。

本报告是结论快照，不是新的配置事实源。机器可执行结论分别由以下文件维护：

- 准入、排除、许可证、安全、内容和重叠结论：`src/vendor-converters/scientific-agent-skills/admission-decisions.json`
- 上游 Skill 结构、资源、安全发现和 ANZSRC Field 证据：`audits/scientific-agent-skills/v2.53.0/skill-audit.json`
- 用户可见的直接 domain membership：`src/plugins/domain-catalog.json`
- 依赖关系决策：`src/vendor-converters/scientific-agent-skills/dependency-decisions.json`
- 资源复制例外：`src/vendor-converters/scientific-agent-skills/resource-decisions.json`

## 2. 总体结论

| 结论 | 数量 |
| --- | ---: |
| 接纳并生成 | 33 |
| 排除 | 114 |
| 合计 | 147 |

接纳的 33 个 Skill 均使用 `scientific-agent-skills-<upstream-id>` 全局 ID，通过 Skill 内容许可证、静态安全和内容边界审查，不与固定 ARSU surface 或 ToolUniverse 形成语义重叠，并至少属于一个现有 domain。它们直接进入 13 个 ANZSRC Group domain 和 4 个工具 domain。

本 vendor 没有产生安装时硬依赖边：审计中所有具有 `required` 关系的源 Skill 最终都被排除。`related` 和 `routing` 关系只保留为审计证据，不扩大安装闭包。ResearchSpec 只分发经审查的静态资源，不执行上游脚本、不安装依赖、不配置凭据，也不授予 workflow authority。

## 3. 接纳结果：按 domain 查看

同一个 Skill 可以同时属于学科 domain 和工具 domain，因此下表中的 Skill 出现次数大于 33。domain membership 是人工审校结果，不由 ANZSRC Field 自动推导。

| 类型 | Domain | 接纳的 Scientific Agent Skills |
| --- | --- | --- |
| ANZSRC Group | `applied-mathematics` — Applied mathematics | `simpy` |
| ANZSRC Group | `artificial-intelligence` — Artificial intelligence | `liteparse` |
| ANZSRC Group | `astronomical-sciences` — Astronomical sciences | `astropy` |
| ANZSRC Group | `control-engineering-mechatronics-and-robotics` — Control engineering, mechatronics and robotics | `ginkgo-cloud-lab`、`opentrons-integration`、`pylabrobot` |
| ANZSRC Group | `data-management-and-data-science` — Data management and data science | `benchling-integration`、`networkx` |
| ANZSRC Group | `geomatic-engineering` — Geomatic engineering | `geopandas` |
| ANZSRC Group | `human-centred-computing` — Human-centred computing | `matplotlib`、`scientific-visualization` |
| ANZSRC Group | `library-and-information-studies` — Library and information studies | `labarchive-integration`、`open-notebook`、`protocolsio-integration`、`pyzotero` |
| ANZSRC Group | `machine-learning` — Machine learning | `aeon`、`pufferlib`、`pytorch-lightning`、`scikit-learn`、`shap`、`stable-baselines3`、`timesfm-forecasting`、`torch-geometric` |
| ANZSRC Group | `macromolecular-and-materials-chemistry` — Macromolecular and materials chemistry | `pymatgen` |
| ANZSRC Group | `numerical-and-computational-mathematics` — Numerical and computational mathematics | `pymoo` |
| ANZSRC Group | `quantum-physics` — Quantum physics | `cirq`、`pennylane`、`qiskit` |
| ANZSRC Group | `theory-of-computation` — Theory of computation | `matlab`、`sympy` |
| 工具域 | `computational-modeling-and-simulation` — Computational modeling and simulation | `cirq`、`matlab`、`networkx`、`pennylane`、`pylabrobot`、`pymatgen`、`pymoo`、`qiskit`、`simpy`、`sympy` |
| 工具域 | `laboratory-automation-and-informatics` — Laboratory automation and informatics | `benchling-integration`、`ginkgo-cloud-lab`、`labarchive-integration`、`open-notebook`、`opentrons-integration`、`protocolsio-integration`、`pylabrobot` |
| 工具域 | `research-computing-infrastructure` — Research computing infrastructure | `liteparse`、`open-notebook`、`optimize-for-gpu`、`pytorch-lightning` |
| 工具域 | `scientific-visualization-and-communication` — Scientific visualization and communication | `generate-image`、`markdown-mermaid-writing`、`matplotlib`、`scientific-visualization` |

## 4. 接纳结果：按 Skill 查看全部 domain

| 上游 Skill | 生成后的全局 Skill ID | 所属 domain |
| --- | --- | --- |
| `aeon` | `scientific-agent-skills-aeon` | `machine-learning`（Machine learning） |
| `astropy` | `scientific-agent-skills-astropy` | `astronomical-sciences`（Astronomical sciences） |
| `benchling-integration` | `scientific-agent-skills-benchling-integration` | `data-management-and-data-science`（Data management and data science）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `cirq` | `scientific-agent-skills-cirq` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `generate-image` | `scientific-agent-skills-generate-image` | `scientific-visualization-and-communication`（Scientific visualization and communication） |
| `geopandas` | `scientific-agent-skills-geopandas` | `geomatic-engineering`（Geomatic engineering） |
| `ginkgo-cloud-lab` | `scientific-agent-skills-ginkgo-cloud-lab` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `labarchive-integration` | `scientific-agent-skills-labarchive-integration` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `liteparse` | `scientific-agent-skills-liteparse` | `artificial-intelligence`（Artificial intelligence）；<br>`research-computing-infrastructure`（Research computing infrastructure） |
| `markdown-mermaid-writing` | `scientific-agent-skills-markdown-mermaid-writing` | `scientific-visualization-and-communication`（Scientific visualization and communication） |
| `matlab` | `scientific-agent-skills-matlab` | `theory-of-computation`（Theory of computation）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `matplotlib` | `scientific-agent-skills-matplotlib` | `human-centred-computing`（Human-centred computing）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） |
| `networkx` | `scientific-agent-skills-networkx` | `data-management-and-data-science`（Data management and data science）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `open-notebook` | `scientific-agent-skills-open-notebook` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics）；<br>`research-computing-infrastructure`（Research computing infrastructure） |
| `opentrons-integration` | `scientific-agent-skills-opentrons-integration` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `optimize-for-gpu` | `scientific-agent-skills-optimize-for-gpu` | `research-computing-infrastructure`（Research computing infrastructure） |
| `pennylane` | `scientific-agent-skills-pennylane` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `protocolsio-integration` | `scientific-agent-skills-protocolsio-integration` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `pufferlib` | `scientific-agent-skills-pufferlib` | `machine-learning`（Machine learning） |
| `pylabrobot` | `scientific-agent-skills-pylabrobot` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） |
| `pymatgen` | `scientific-agent-skills-pymatgen` | `macromolecular-and-materials-chemistry`（Macromolecular and materials chemistry）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `pymoo` | `scientific-agent-skills-pymoo` | `numerical-and-computational-mathematics`（Numerical and computational mathematics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `pytorch-lightning` | `scientific-agent-skills-pytorch-lightning` | `machine-learning`（Machine learning）；<br>`research-computing-infrastructure`（Research computing infrastructure） |
| `pyzotero` | `scientific-agent-skills-pyzotero` | `library-and-information-studies`（Library and information studies） |
| `qiskit` | `scientific-agent-skills-qiskit` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `scientific-visualization` | `scientific-agent-skills-scientific-visualization` | `human-centred-computing`（Human-centred computing）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） |
| `scikit-learn` | `scientific-agent-skills-scikit-learn` | `machine-learning`（Machine learning） |
| `shap` | `scientific-agent-skills-shap` | `machine-learning`（Machine learning） |
| `simpy` | `scientific-agent-skills-simpy` | `applied-mathematics`（Applied mathematics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `stable-baselines3` | `scientific-agent-skills-stable-baselines3` | `machine-learning`（Machine learning） |
| `sympy` | `scientific-agent-skills-sympy` | `theory-of-computation`（Theory of computation）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） |
| `timesfm-forecasting` | `scientific-agent-skills-timesfm-forecasting` | `machine-learning`（Machine learning） |
| `torch-geometric` | `scientific-agent-skills-torch-geometric` | `machine-learning`（Machine learning） |

## 5. 排除原因口径

以下统计按原因计数而不是按 Skill 去重。一个 Skill 可以同时命中多个排除原因，因此合计会超过 114。

| 原因代码 | 数量 | 判定含义 |
| --- | ---: | --- |
| `tooluniverse-semantic-overlap` | 76 | 能力与已接纳的 ToolUniverse Skill 重叠；按既定质量优先级保留 ToolUniverse 实现。 |
| `static-security-review-failed` | 40 | 静态审查仍存在未解决的 Critical/High 行为，不能在保持原能力的同时安全准入。 |
| `arsu-surface-overlap` | 10 | 能力属于固定的四个 ARSU Skills 或其研究工作流职责，不应由可选 domain plugin 重复提供。 |
| `no-domain-fit` | 9 | 无法合理归入现有 ANZSRC Group 或固定工具域；本次 ingest 不为单个 Skill 创造新 domain。 |
| `outside-plugin-authority` | 4 | 拥有 Agent runtime、自维护、调度、状态、worktree、合并或 Gate 等 ResearchSpec 核心权限。 |
| `redistribution-prohibited` | 4 | 适用条款禁止提取、保留、派生或再分发其内容。 |
| `upstream-security-review-required` | 1 | 上游安全材料明确留下需进一步处置的高风险审查要求。 |

## 6. 逐项排除清单

| 上游 Skill | 排除原因 | 具体结论 |
| --- | --- | --- |
| `adaptyv` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-protein-therapeutic-design` |
| `anndata` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-single-cell` |
| `arbor` | `outside-plugin-authority`（超出 domain plugin 权限边界） | 该 Skill 拥有 Agent runtime、自维护、资源状态、子 Agent 调度、worktree、合并或 Gate 等核心权限，不属于领域能力 |
| `arboreto` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-gene-regulatory-networks` |
| `autoskill` | `outside-plugin-authority`（超出 domain plugin 权限边界）；<br>`upstream-security-review-required`（上游要求进一步安全审查） | 该 Skill 拥有 Agent runtime、自维护、资源状态、子 Agent 调度、worktree、合并或 Gate 等核心权限，不属于领域能力；<br>上游安全材料仍要求进一步审查（最高 critical，共 14 项发现） |
| `bgpt-paper-search` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-literature-deep-research` |
| `bids` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-neuroscience` |
| `biopython` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-sequence-analysis` |
| `bioservices` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-dataset-discovery` |
| `bulk-rnaseq` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-rnaseq-deseq2` |
| `cellxgene-census` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-single-cell` |
| `citation-management` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `clinical-decision-support` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-guidelines` |
| `clinical-reports` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-data-integration` |
| `cobrapy` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-systems-biology` |
| `consciousness-council` | `no-domain-fit`（无合适的既有 domain）；<br>`static-security-review-failed`（静态安全审查未通过） | 未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `dask` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-wrangling` |
| `database-lookup` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-dataset-discovery` |
| `datamol` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `deepchem` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `deeptools` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-epigenomics-chromatin` |
| `depmap` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-cell-line-profiling` |
| `dhdna-profiler` | `no-domain-fit`（无合适的既有 domain）；<br>`static-security-review-failed`（静态安全审查未通过） | 未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `diffdock` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `dnanexus-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-sequence-analysis` |
| `docx` | `redistribution-prohibited`（禁止提取或再分发） | 相邻条款禁止内容提取、保留、派生或再分发，不能随 ResearchSpec npm 包发布 |
| `esm` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-protein-structure-prediction` |
| `etetoolkit` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-phylogenetics` |
| `exa-search` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-literature-deep-research` |
| `experimental-design` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-trial-design` |
| `exploratory-data-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-wrangling` |
| `flowio` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-immunology` |
| `fluidsim` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `geniml` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-epigenomics` |
| `geomaster` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `get-available-resources` | `outside-plugin-authority`（超出 domain plugin 权限边界） | 该 Skill 拥有 Agent runtime、自维护、资源状态、子 Agent 调度、worktree、合并或 Gate 等核心权限，不属于领域能力 |
| `gget` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-sequence-retrieval` |
| `glycoengineering` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-protein-modification-analysis` |
| `gtars` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-regulatory-genomics` |
| `histolab` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-image-analysis` |
| `hugging-science` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-dataset-discovery` |
| `hypogenic` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-multi-omics-integration` |
| `hypothesis-generation` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适的既有 domain）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `imaging-data-commons` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-image-analysis` |
| `infographics` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `iso-13485-certification` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-drug-regulatory` |
| `lamindb` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-integration-analysis` |
| `latchbio-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-multi-omics-integration` |
| `latex-posters` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `literature-review` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适的既有 domain）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `market-research-reports` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-literature-deep-research` |
| `markitdown` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `matchms` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-metabolomics-analysis` |
| `medchem` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `modal` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `molecular-dynamics` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-computational-biophysics` |
| `molfeat` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `neurokit2` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-neuroscience` |
| `neuropixels-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-neuroscience` |
| `nextflow` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-multi-omics-integration` |
| `omero-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-image-analysis` |
| `pacsomatic` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `paper-lookup` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research` |
| `paperzilla` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-literature-deep-research` |
| `parallel-web` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `pathml` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-image-analysis` |
| `pathway-enrichment` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-gene-enrichment` |
| `pdf` | `redistribution-prohibited`（禁止提取或再分发） | 相邻条款禁止内容提取、保留、派生或再分发，不能随 ResearchSpec npm 包发布 |
| `peer-review` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适的既有 domain）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`academic-paper-reviewer`；<br>未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `phylogenetics` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-phylogenetics` |
| `pi-agent` | `outside-plugin-authority`（超出 domain plugin 权限边界） | 该 Skill 拥有 Agent runtime、自维护、资源状态、子 Agent 调度、worktree、合并或 Gate 等核心权限，不属于领域能力 |
| `polars` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-wrangling` |
| `polars-bio` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-wrangling` |
| `pptx` | `redistribution-prohibited`（禁止提取或再分发） | 相邻条款禁止内容提取、保留、派生或再分发，不能随 ResearchSpec npm 包发布 |
| `pptx-posters` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `primekg` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-network-pharmacology` |
| `pydeseq2` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-rnaseq-deseq2` |
| `pydicom` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-image-analysis` |
| `pyhealth` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-risk-scoring` |
| `pymc` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-statistical-modeling` |
| `pyopenms` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-proteomics-analysis` |
| `pysam` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-variant-analysis` |
| `pytdc` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `qutip` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `rdkit` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `research-grants` | `no-domain-fit`（无合适的既有 domain） | 未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain |
| `research-lookup` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `rowan` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-computational-biophysics` |
| `scanpy` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-single-cell` |
| `scholar-evaluation` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`researchspec-verify`；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `scientific-brainstorming` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适的既有 domain） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain |
| `scientific-critical-thinking` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适的既有 domain） | 与 ResearchSpec 固定 ARSU Skill 重叠：`deep-research`；<br>未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain |
| `scientific-schematics` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `scientific-slides` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `scientific-writing` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`static-security-review-failed`（静态安全审查未通过） | 与 ResearchSpec 固定 ARSU Skill 重叠：`academic-paper`；<br>静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `scikit-bio` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-sequence-analysis` |
| `scikit-survival` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-risk-scoring` |
| `scvelo` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-single-cell` |
| `scvi-tools` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-single-cell` |
| `seaborn` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `statistical-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-statistical-modeling` |
| `statistical-power` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-statistical-modeling` |
| `statsmodels` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-statistical-modeling` |
| `tiledbvcf` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-variant-analysis` |
| `torchdrug` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-small-molecule-discovery` |
| `transformers` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `treatment-plans` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-clinical-guidelines` |
| `umap-learn` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `usfiscaldata` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-dataset-discovery` |
| `vaex` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-wrangling` |
| `venue-templates` | `static-security-review-failed`（静态安全审查未通过） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入 |
| `what-if-oracle` | `no-domain-fit`（无合适的既有 domain） | 未找到符合固定 ANZSRC Group 或五个工具域粒度的合理安装归属，且本次 ingest 不新增 domain |
| `xlsx` | `redistribution-prohibited`（禁止提取或再分发） | 相邻条款禁止内容提取、保留、派生或再分发，不能随 ResearchSpec npm 包发布 |
| `zarr-python` | `static-security-review-failed`（静态安全审查未通过）；<br>`tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 静态源码审查保留了未解决的 Critical/High 风险；在不改变预期能力的情况下无法完成准入；<br>已由质量优先的 ToolUniverse 能力覆盖：`tooluniverse-data-integration-analysis` |

## 7. 资源、依赖与运行边界

- 接纳项默认复制固定 revision 下的完整 Skill 资源树，并在 vendor manifest 中记录路径和 SHA-256。
- 唯一显式资源排除是 `skills/open-notebook/scripts/test_open_notebook_skill.py`；它是测试资源，不影响接纳后 Skill 的完整业务能力。
- 接纳项携带 `LICENSE` 与 `NOTICE.md`，但其依赖包、服务、数据集、硬件和运行环境仍适用各自许可证与使用条款。
- 上游脚本在 npm 包中保持惰性。ResearchSpec 不执行脚本、不安装脚本依赖、不连接第三方服务，也不把静态安全审查解释为运行时安全认证。
- 用户仍然只按 domain 安装；vendor 名称不成为用户安装对象。Scientific Agent Skills 的来源信息只用于 provenance、审计和维护。

## 8. 结论

本次 ingest 采取逐项 allowlist，而不是依据上游分类、readiness 或安全标签批量接纳。最终保留的 33 个 Skill 为现有 domain 提供了量子计算、机器学习、实验室自动化、科研信息管理、科学可视化、计算建模等补充能力；其余 114 个因已有更优来源、职责重叠、权限越界、静态安全问题、再分发限制或缺乏合理 domain 归属而被明确排除。

