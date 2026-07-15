# Scientific Agent Skills v2.53.0 Ingest 结论报告

## 1. 范围与事实来源

本报告记录 Scientific Agent Skills `v2.53.0` 在 ResearchSpec 中的最终 ingest 结论。上游固定 revision 为 `9c9bd2e92af12311ecd0c1a643e0931643f9ea04`。审计覆盖 147 个上游 Skill，其中 139 个为业务候选项，8 个为审计硬排除项。报告反映完成 40 项 finding-level 人工安全复核后的生产状态。

本报告是可读结论，不是配置事实源。机器事实分别由以下文件维护：

- 准入、许可证、内容、重叠与最终 disposition：`src/vendor-converters/scientific-agent-skills/admission-decisions.json`
- 40 项人工安全复核、逐 finding 结论与适配：`src/vendor-converters/scientific-agent-skills/security-review-decisions.json`
- 不可变上游审计：`audits/scientific-agent-skills/v2.53.0/skill-audit.json`
- source-neutral domain membership：`src/plugins/domain-catalog.json`
- 依赖关系决策：`src/vendor-converters/scientific-agent-skills/dependency-decisions.json`
- 资源复制例外：`src/vendor-converters/scientific-agent-skills/resource-decisions.json`

## 2. 最终结论

| 结论 | 数量 |
| --- | ---: |
| 接纳并生成 | 49 |
| 排除 | 98 |
| 合计 | 147 |

接纳的 49 个 Skill 均使用 `scientific-agent-skills-<upstream-id>` 全局 ID，具有已记录的 Skill 内容许可证，通过内容与安全审查，不与固定 ARSU surface 或 ToolUniverse 形成语义重叠，并至少属于一个既有 domain。它们直接进入 19 个 ANZSRC Group domain 和 5 个工具域。两个 vendor 合计激活 48 个非空 domain。

40 项人工安全复核得到 39 项 `clear-with-adaptation` 和 1 项 `fail`。其中 16 项在解决安全阻塞且复核其他 admission 条件后新增准入；23 项虽完成安全适配，仍因 ToolUniverse/ARSU 重叠或 domain fit 等独立条件排除；`dhdna-profiler` 同时保留人工安全失败与 domain fit 阻塞。

资源策略共记录 28 项排除；转换器只执行已批准的 entry/compatibility/fixed-configuration/非必要资源裁剪，不维护可执行脚本补丁。依赖策略没有安装时硬依赖边，3 条关系仅作 advisory。ResearchSpec 不执行脚本、不安装依赖、不处理凭据，也不授予 workflow authority。

## 3. 接纳结果：按 domain

同一 Skill 可以属于多个 domain；membership 是人工审校结果，不由 ANZSRC Field 自动推导。

| 类型 | Domain | Scientific Agent Skills |
| --- | --- | --- |
| ANZSRC Group | `bioinformatics-and-computational-biology`（Bioinformatics and computational biology） | `pacsomatic` |
| ANZSRC Group | `oncology-and-carcinogenesis`（Oncology and carcinogenesis） | `pacsomatic` |
| ANZSRC Group | `design`（Design） | `infographics`、`latex-posters`、`pptx-posters`、`scientific-schematics`、`scientific-slides`、`venue-templates` |
| ANZSRC Group | `macromolecular-and-materials-chemistry`（Macromolecular and materials chemistry） | `pymatgen` |
| ANZSRC Group | `geoinformatics`（Geoinformatics） | `geomaster` |
| ANZSRC Group | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics） | `ginkgo-cloud-lab`、`opentrons-integration`、`pylabrobot` |
| ANZSRC Group | `fluid-mechanics-and-thermal-engineering`（Fluid mechanics and thermal engineering） | `fluidsim` |
| ANZSRC Group | `geomatic-engineering`（Geomatic engineering） | `geopandas` |
| ANZSRC Group | `artificial-intelligence`（Artificial intelligence） | `liteparse` |
| ANZSRC Group | `data-management-and-data-science`（Data management and data science） | `benchling-integration`、`networkx`、`parallel-web` |
| ANZSRC Group | `distributed-computing-and-systems-software`（Distributed computing and systems software） | `modal` |
| ANZSRC Group | `human-centred-computing`（Human-centred computing） | `matplotlib`、`scientific-visualization`、`seaborn` |
| ANZSRC Group | `library-and-information-studies`（Library and information studies） | `labarchive-integration`、`open-notebook`、`protocolsio-integration`、`pyzotero` |
| ANZSRC Group | `machine-learning`（Machine learning） | `aeon`、`pufferlib`、`pytorch-lightning`、`scikit-learn`、`shap`、`stable-baselines3`、`timesfm-forecasting`、`torch-geometric`、`transformers`、`umap-learn` |
| ANZSRC Group | `theory-of-computation`（Theory of computation） | `matlab`、`sympy` |
| ANZSRC Group | `applied-mathematics`（Applied mathematics） | `simpy` |
| ANZSRC Group | `numerical-and-computational-mathematics`（Numerical and computational mathematics） | `pymoo` |
| ANZSRC Group | `astronomical-sciences`（Astronomical sciences） | `astropy` |
| ANZSRC Group | `quantum-physics`（Quantum physics） | `cirq`、`pennylane`、`qiskit`、`qutip` |
| 工具域 | `experimental-design-and-data-analysis`（Experimental design and data analysis） | `seaborn`、`umap-learn` |
| 工具域 | `computational-modeling-and-simulation`（Computational modeling and simulation） | `cirq`、`fluidsim`、`matlab`、`networkx`、`pennylane`、`pylabrobot`、`pymatgen`、`pymoo`、`qiskit`、`qutip`、`simpy`、`sympy` |
| 工具域 | `scientific-visualization-and-communication`（Scientific visualization and communication） | `generate-image`、`infographics`、`latex-posters`、`markdown-mermaid-writing`、`matplotlib`、`pptx-posters`、`scientific-schematics`、`scientific-slides`、`scientific-visualization`、`seaborn`、`umap-learn`、`venue-templates` |
| 工具域 | `laboratory-automation-and-informatics`（Laboratory automation and informatics） | `benchling-integration`、`ginkgo-cloud-lab`、`labarchive-integration`、`open-notebook`、`opentrons-integration`、`protocolsio-integration`、`pylabrobot` |
| 工具域 | `research-computing-infrastructure`（Research computing infrastructure） | `liteparse`、`markitdown`、`modal`、`open-notebook`、`optimize-for-gpu`、`pacsomatic`、`parallel-web`、`pytorch-lightning`、`transformers` |

## 4. 接纳结果：逐 Skill

| 上游 Skill | 生成 ID | Domain | 人工安全与资源适配 |
| --- | --- | --- | --- |
| `aeon` | `scientific-agent-skills-aeon` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `astropy` | `scientific-agent-skills-astropy` | `astronomical-sciences`（Astronomical sciences） | 既有 admission 安全审查通过 |
| `benchling-integration` | `scientific-agent-skills-benchling-integration` | `data-management-and-data-science`（Data management and data science）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `cirq` | `scientific-agent-skills-cirq` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `fluidsim` | `scientific-agent-skills-fluidsim` | `fluid-mechanics-and-thermal-engineering`（Fluid mechanics and thermal engineering）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | `clear-with-adaptation` |
| `generate-image` | `scientific-agent-skills-generate-image` | `scientific-visualization-and-communication`（Scientific visualization and communication） | 既有 admission 安全审查通过 |
| `geomaster` | `scientific-agent-skills-geomaster` | `geoinformatics`（Geoinformatics） | `clear-with-adaptation` |
| `geopandas` | `scientific-agent-skills-geopandas` | `geomatic-engineering`（Geomatic engineering） | 既有 admission 安全审查通过 |
| `ginkgo-cloud-lab` | `scientific-agent-skills-ginkgo-cloud-lab` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `infographics` | `scientific-agent-skills-infographics` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 2 项资源 |
| `labarchive-integration` | `scientific-agent-skills-labarchive-integration` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `latex-posters` | `scientific-agent-skills-latex-posters` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 2 项资源 |
| `liteparse` | `scientific-agent-skills-liteparse` | `artificial-intelligence`（Artificial intelligence）；<br>`research-computing-infrastructure`（Research computing infrastructure） | 既有 admission 安全审查通过 |
| `markdown-mermaid-writing` | `scientific-agent-skills-markdown-mermaid-writing` | `scientific-visualization-and-communication`（Scientific visualization and communication） | 既有 admission 安全审查通过 |
| `markitdown` | `scientific-agent-skills-markitdown` | `research-computing-infrastructure`（Research computing infrastructure） | `clear-with-adaptation`；排除 3 项资源 |
| `matlab` | `scientific-agent-skills-matlab` | `theory-of-computation`（Theory of computation）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `matplotlib` | `scientific-agent-skills-matplotlib` | `human-centred-computing`（Human-centred computing）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | 既有 admission 安全审查通过 |
| `modal` | `scientific-agent-skills-modal` | `distributed-computing-and-systems-software`（Distributed computing and systems software）；<br>`research-computing-infrastructure`（Research computing infrastructure） | `clear-with-adaptation`；排除 1 项资源 |
| `networkx` | `scientific-agent-skills-networkx` | `data-management-and-data-science`（Data management and data science）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `open-notebook` | `scientific-agent-skills-open-notebook` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics）；<br>`research-computing-infrastructure`（Research computing infrastructure） | 既有 admission 安全审查通过；排除 1 项资源 |
| `opentrons-integration` | `scientific-agent-skills-opentrons-integration` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `optimize-for-gpu` | `scientific-agent-skills-optimize-for-gpu` | `research-computing-infrastructure`（Research computing infrastructure） | 既有 admission 安全审查通过 |
| `pacsomatic` | `scientific-agent-skills-pacsomatic` | `bioinformatics-and-computational-biology`（Bioinformatics and computational biology）；<br>`oncology-and-carcinogenesis`（Oncology and carcinogenesis）；<br>`research-computing-infrastructure`（Research computing infrastructure） | `clear-with-adaptation`；排除 2 项资源 |
| `parallel-web` | `scientific-agent-skills-parallel-web` | `data-management-and-data-science`（Data management and data science）；<br>`research-computing-infrastructure`（Research computing infrastructure） | `clear-with-adaptation`；排除 4 项资源 |
| `pennylane` | `scientific-agent-skills-pennylane` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `pptx-posters` | `scientific-agent-skills-pptx-posters` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 2 项资源 |
| `protocolsio-integration` | `scientific-agent-skills-protocolsio-integration` | `library-and-information-studies`（Library and information studies）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `pufferlib` | `scientific-agent-skills-pufferlib` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `pylabrobot` | `scientific-agent-skills-pylabrobot` | `control-engineering-mechatronics-and-robotics`（Control engineering, mechatronics and robotics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation）；<br>`laboratory-automation-and-informatics`（Laboratory automation and informatics） | 既有 admission 安全审查通过 |
| `pymatgen` | `scientific-agent-skills-pymatgen` | `macromolecular-and-materials-chemistry`（Macromolecular and materials chemistry）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `pymoo` | `scientific-agent-skills-pymoo` | `numerical-and-computational-mathematics`（Numerical and computational mathematics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `pytorch-lightning` | `scientific-agent-skills-pytorch-lightning` | `machine-learning`（Machine learning）；<br>`research-computing-infrastructure`（Research computing infrastructure） | 既有 admission 安全审查通过 |
| `pyzotero` | `scientific-agent-skills-pyzotero` | `library-and-information-studies`（Library and information studies） | 既有 admission 安全审查通过 |
| `qiskit` | `scientific-agent-skills-qiskit` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `qutip` | `scientific-agent-skills-qutip` | `quantum-physics`（Quantum physics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | `clear-with-adaptation` |
| `scientific-schematics` | `scientific-agent-skills-scientific-schematics` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 5 项资源 |
| `scientific-slides` | `scientific-agent-skills-scientific-slides` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 4 项资源 |
| `scientific-visualization` | `scientific-agent-skills-scientific-visualization` | `human-centred-computing`（Human-centred computing）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | 既有 admission 安全审查通过 |
| `scikit-learn` | `scientific-agent-skills-scikit-learn` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `seaborn` | `scientific-agent-skills-seaborn` | `human-centred-computing`（Human-centred computing）；<br>`experimental-design-and-data-analysis`（Experimental design and data analysis）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation` |
| `shap` | `scientific-agent-skills-shap` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `simpy` | `scientific-agent-skills-simpy` | `applied-mathematics`（Applied mathematics）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `stable-baselines3` | `scientific-agent-skills-stable-baselines3` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `sympy` | `scientific-agent-skills-sympy` | `theory-of-computation`（Theory of computation）；<br>`computational-modeling-and-simulation`（Computational modeling and simulation） | 既有 admission 安全审查通过 |
| `timesfm-forecasting` | `scientific-agent-skills-timesfm-forecasting` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `torch-geometric` | `scientific-agent-skills-torch-geometric` | `machine-learning`（Machine learning） | 既有 admission 安全审查通过 |
| `transformers` | `scientific-agent-skills-transformers` | `machine-learning`（Machine learning）；<br>`research-computing-infrastructure`（Research computing infrastructure） | `clear-with-adaptation` |
| `umap-learn` | `scientific-agent-skills-umap-learn` | `machine-learning`（Machine learning）；<br>`experimental-design-and-data-analysis`（Experimental design and data analysis）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation` |
| `venue-templates` | `scientific-agent-skills-venue-templates` | `design`（Design）；<br>`scientific-visualization-and-communication`（Scientific visualization and communication） | `clear-with-adaptation`；排除 2 项资源 |

## 5. 排除原因统计

以下按原因计数；同一 Skill 可命中多个原因。人工安全放行不会抹除独立 admission blocker。

| 原因代码 | 数量 | 含义 |
| --- | ---: | --- |
| `tooluniverse-semantic-overlap` | 76 | 该能力由既定质量优先的 ToolUniverse Skill 提供 |
| `arsu-surface-overlap` | 10 | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供 |
| `no-domain-fit` | 9 | 无法合理归入固定 ANZSRC Group 或五个工具域 |
| `outside-plugin-authority` | 4 | 涉及 runtime、自维护、调度、状态、worktree、合并或 Gate 等核心权限 |
| `redistribution-prohibited` | 4 | 适用内容条款不允许 ResearchSpec 提取、派生或再分发 |
| `static-security-review-failed` | 1 | finding-level 人工复核确认风险无法在允许的声明式适配边界内解决 |
| `upstream-security-review-required` | 1 | 上游材料仍明确要求额外处置 |

## 6. 逐项排除清单

| 上游 Skill | 排除原因 | 具体结论 |
| --- | --- | --- |
| `adaptyv` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-protein-therapeutic-design` |
| `anndata` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-single-cell` |
| `arbor` | `outside-plugin-authority`（超出 plugin 权限边界） | 涉及 runtime、自维护、调度、状态、worktree、合并或 Gate 等核心权限 |
| `arboreto` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-gene-regulatory-networks` |
| `autoskill` | `outside-plugin-authority`（超出 plugin 权限边界）；<br>`upstream-security-review-required`（上游要求进一步安全审查） | 涉及 runtime、自维护、调度、状态、worktree、合并或 Gate 等核心权限；<br>上游材料仍明确要求额外处置 |
| `bgpt-paper-search` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-literature-deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `bids` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-neuroscience`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `biopython` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-sequence-analysis` |
| `bioservices` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-dataset-discovery` |
| `bulk-rnaseq` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-rnaseq-deseq2` |
| `cellxgene-census` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-single-cell`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `citation-management` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>ARSU/Companion 覆盖：`deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `clinical-decision-support` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-guidelines`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `clinical-reports` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-data-integration`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `cobrapy` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-systems-biology` |
| `consciousness-council` | `no-domain-fit`（无合适 domain） | 无法合理归入固定 ANZSRC Group 或五个工具域；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `dask` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-wrangling` |
| `database-lookup` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-dataset-discovery`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `datamol` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `deepchem` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `deeptools` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-epigenomics-chromatin` |
| `depmap` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-cell-line-profiling` |
| `dhdna-profiler` | `no-domain-fit`（无合适 domain）；<br>`static-security-review-failed`（人工安全审查未通过） | 无法合理归入固定 ANZSRC Group 或五个工具域；<br>finding-level 人工复核确认风险无法在允许的声明式适配边界内解决；<br>人工 finding-level 结论确认失败 |
| `diffdock` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `dnanexus-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-sequence-analysis` |
| `docx` | `redistribution-prohibited`（禁止再分发） | 适用内容条款不允许 ResearchSpec 提取、派生或再分发 |
| `esm` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-protein-structure-prediction` |
| `etetoolkit` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-phylogenetics` |
| `exa-search` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-literature-deep-research` |
| `experimental-design` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-trial-design` |
| `exploratory-data-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-wrangling` |
| `flowio` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-immunology`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `geniml` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-epigenomics` |
| `get-available-resources` | `outside-plugin-authority`（超出 plugin 权限边界） | 涉及 runtime、自维护、调度、状态、worktree、合并或 Gate 等核心权限 |
| `gget` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-sequence-retrieval` |
| `glycoengineering` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-protein-modification-analysis` |
| `gtars` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-regulatory-genomics` |
| `histolab` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-image-analysis`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `hugging-science` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-dataset-discovery` |
| `hypogenic` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-multi-omics-integration` |
| `hypothesis-generation` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适 domain） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>无法合理归入固定 ANZSRC Group 或五个工具域；<br>ARSU/Companion 覆盖：`deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `imaging-data-commons` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-image-analysis` |
| `iso-13485-certification` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-drug-regulatory` |
| `lamindb` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-integration-analysis` |
| `latchbio-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-multi-omics-integration` |
| `literature-review` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适 domain） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>无法合理归入固定 ANZSRC Group 或五个工具域；<br>ARSU/Companion 覆盖：`deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `market-research-reports` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-literature-deep-research` |
| `matchms` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-metabolomics-analysis` |
| `medchem` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `molecular-dynamics` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-computational-biophysics` |
| `molfeat` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `neurokit2` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-neuroscience` |
| `neuropixels-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-neuroscience` |
| `nextflow` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-multi-omics-integration` |
| `omero-integration` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-image-analysis` |
| `paper-lookup` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>ARSU/Companion 覆盖：`deep-research` |
| `paperzilla` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-literature-deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `pathml` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-image-analysis`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `pathway-enrichment` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-gene-enrichment` |
| `pdf` | `redistribution-prohibited`（禁止再分发） | 适用内容条款不允许 ResearchSpec 提取、派生或再分发 |
| `peer-review` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适 domain） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>无法合理归入固定 ANZSRC Group 或五个工具域；<br>ARSU/Companion 覆盖：`academic-paper-reviewer`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `phylogenetics` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-phylogenetics` |
| `pi-agent` | `outside-plugin-authority`（超出 plugin 权限边界） | 涉及 runtime、自维护、调度、状态、worktree、合并或 Gate 等核心权限 |
| `polars` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-wrangling` |
| `polars-bio` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-wrangling` |
| `pptx` | `redistribution-prohibited`（禁止再分发） | 适用内容条款不允许 ResearchSpec 提取、派生或再分发 |
| `primekg` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-network-pharmacology`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `pydeseq2` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-rnaseq-deseq2` |
| `pydicom` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-image-analysis` |
| `pyhealth` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-risk-scoring` |
| `pymc` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-statistical-modeling` |
| `pyopenms` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-proteomics-analysis` |
| `pysam` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-variant-analysis` |
| `pytdc` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `rdkit` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `research-grants` | `no-domain-fit`（无合适 domain） | 无法合理归入固定 ANZSRC Group 或五个工具域 |
| `research-lookup` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>ARSU/Companion 覆盖：`deep-research`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `rowan` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-computational-biophysics` |
| `scanpy` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-single-cell` |
| `scholar-evaluation` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>ARSU/Companion 覆盖：`researchspec-verify`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `scientific-brainstorming` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适 domain） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>无法合理归入固定 ANZSRC Group 或五个工具域；<br>ARSU/Companion 覆盖：`deep-research` |
| `scientific-critical-thinking` | `arsu-surface-overlap`（与固定 ARSU surface 重叠）；<br>`no-domain-fit`（无合适 domain） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>无法合理归入固定 ANZSRC Group 或五个工具域；<br>ARSU/Companion 覆盖：`deep-research` |
| `scientific-writing` | `arsu-surface-overlap`（与固定 ARSU surface 重叠） | 该能力属于固定 ARSU/Companion surface，不由可选 domain plugin 重复提供；<br>ARSU/Companion 覆盖：`academic-paper`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `scikit-bio` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-sequence-analysis` |
| `scikit-survival` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-risk-scoring` |
| `scvelo` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-single-cell` |
| `scvi-tools` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-single-cell` |
| `statistical-analysis` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-statistical-modeling` |
| `statistical-power` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-statistical-modeling` |
| `statsmodels` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-statistical-modeling` |
| `tiledbvcf` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-variant-analysis`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `torchdrug` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-small-molecule-discovery` |
| `treatment-plans` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-clinical-guidelines`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `usfiscaldata` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-dataset-discovery`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |
| `vaex` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-wrangling` |
| `what-if-oracle` | `no-domain-fit`（无合适 domain） | 无法合理归入固定 ANZSRC Group 或五个工具域 |
| `xlsx` | `redistribution-prohibited`（禁止再分发） | 适用内容条款不允许 ResearchSpec 提取、派生或再分发 |
| `zarr-python` | `tooluniverse-semantic-overlap`（与 ToolUniverse 语义重叠） | 该能力由既定质量优先的 ToolUniverse Skill 提供；<br>ToolUniverse 覆盖：`tooluniverse-data-integration-analysis`；<br>人工安全结论已放行，但不覆盖上述独立阻塞 |

## 7. 40 项人工安全复核的生产影响

完整逐 finding 证据、误报判定、残余风险和适配说明见 `artifacts/scientific_agent_skills_v2_53_0_manual_security_review.md`。

| Skill | 维护者决定 | 批准的适配 | 最终生产影响 |
| --- | --- | --- | --- |
| `fluidsim` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 新增准入：`scientific-agent-skills-fluidsim` |
| `geomaster` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 新增准入：`scientific-agent-skills-geomaster` |
| `infographics` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 2 项资源 | 新增准入：`scientific-agent-skills-infographics` |
| `latex-posters` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 2 项资源 | 新增准入：`scientific-agent-skills-latex-posters` |
| `markitdown` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 3 项资源 | 新增准入：`scientific-agent-skills-markitdown` |
| `modal` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 1 项资源 | 新增准入：`scientific-agent-skills-modal` |
| `pacsomatic` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 2 项资源 | 新增准入：`scientific-agent-skills-pacsomatic` |
| `parallel-web` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 4 项资源 | 新增准入：`scientific-agent-skills-parallel-web` |
| `pptx-posters` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`；排除 2 项资源 | 新增准入：`scientific-agent-skills-pptx-posters` |
| `qutip` | `clear-with-adaptation` | 类型：`compatibility-guidance`、`generated-entry-guidance` | 新增准入：`scientific-agent-skills-qutip` |
| `scientific-schematics` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 5 项资源 | 新增准入：`scientific-agent-skills-scientific-schematics` |
| `scientific-slides` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 4 项资源 | 新增准入：`scientific-agent-skills-scientific-slides` |
| `seaborn` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 新增准入：`scientific-agent-skills-seaborn` |
| `transformers` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 新增准入：`scientific-agent-skills-transformers` |
| `umap-learn` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 新增准入：`scientific-agent-skills-umap-learn` |
| `venue-templates` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance`；排除 2 项资源 | 新增准入：`scientific-agent-skills-venue-templates` |
| `bgpt-paper-search` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `bids` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `cellxgene-census` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `citation-management` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap` |
| `clinical-decision-support` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `clinical-reports` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `consciousness-council` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`no-domain-fit` |
| `database-lookup` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `dhdna-profiler` | `fail` | 无 | 保持排除：`no-domain-fit`、`static-security-review-failed` |
| `flowio` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `histolab` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `hypothesis-generation` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap`、`no-domain-fit` |
| `literature-review` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap`、`no-domain-fit` |
| `paperzilla` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `pathml` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `peer-review` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap`、`no-domain-fit` |
| `primekg` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `research-lookup` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap` |
| `scholar-evaluation` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap` |
| `scientific-writing` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`arsu-surface-overlap` |
| `tiledbvcf` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `treatment-plans` | `clear-with-adaptation` | 类型：`resource-exclusion`、`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `usfiscaldata` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |
| `zarr-python` | `clear-with-adaptation` | 类型：`generated-entry-guidance`、`compatibility-guidance` | 保持排除：`tooluniverse-semantic-overlap` |

## 8. 安全、运行时与维护边界

- 上游脚本在 npm 包中保持惰性。ResearchSpec 不执行脚本、不安装依赖、不配置凭据、不连接第三方服务，也不把人工静态复核解释为运行时安全认证。
- 涉及外部 LLM、图像模型或服务的可选步骤采用 provider-neutral 表述，只能使用目标 Agent 已配置且经用户同意的通用能力。ResearchSpec 与生成 Skill 不读取、保存、展示或转发密钥。
- 外部内容和模型输出始终作为不可信数据；联网、数据外传、付费计算、云存储、临床/敏感数据处理及破坏性写入仍由目标 Agent 执行确认和运行时控制。
- Skill 只辅助语义工作，不能修改 ResearchSpec state、route、work item、artifact registry、Gate、Decision、transition 或 receipt。
- 供应商更新必须重新固定 revision，并复核 admission、manual security、license、dependency、resource 和 domain SSOT 后再生成。

## 9. 结论

最终接纳 49 个、排除 98 个。新增准入集中在流体仿真、地理信息、科学视觉传播、分布式计算、量子计算与机器学习等既有 domain；重叠、权限、再分发和分类边界继续独立生效。该结果保持 vendor converter 隔离、source-neutral domain 安装、静态分发与 ResearchSpec 核心 workflow authority 边界。
