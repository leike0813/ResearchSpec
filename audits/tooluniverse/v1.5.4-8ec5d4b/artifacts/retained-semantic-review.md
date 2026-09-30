# ToolUniverse 保留能力语义审阅（v1.5.4-8ec5d4b retained set）

本文件是 ToolUniverse 上游增量吸纳（v1.3.1 → v1.5.4）的只读 sidecar 审阅记录。
主线程/其他 agent 处理 33 个直接变化能力与间接适配；本文件只审 `upstream-delta.json`
`raw_skill_changes` 中判定为 `unchanged` 且 `baseline_disposition != exclude` 的 97 个已准入能力，
属**转换生成前**的保留性复核。这批能力中若干被引用的工具（如 FAERS、Reactome、EBI eQTL 等）
在本轮目录变化中受影响，会经间接适配进入实际 changed subset；最终实际 changed subset 由
`05-semantic-review.md` 补充记录。本文件不预先断言最终 changed subset，也不替代实际的 adapter 任务。

- 审阅对象：现有生成物 `skills/plugins/vendors/tooluniverse/<raw-skill>/SKILL.md`
  （generated vendor bundle）与
  `skills/plugins/extensions/capabilities/plugin-tooluniverse-<x>/SKILL.md`
  （extension）。
- 源状态：`vendor/tooluniverse` 子模块位于 `v1.5.4` / `8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06`，工作树干净。
  97 个 raw Skill 在本轮对上上游文件未变（`entry_changed=false`、`changed_published_sources=[]`），
  预期字节保持原状。
- 只读边界：未修改任何既有文件、converter、audit JSON 或 registry；未运行任何上游脚本或服务；
  辅助提取仅在 `/tmp` 临时工件中完成。

## 审阅方法

1. 机读不变量：对 97 个能力逐一比对 extension `SKILL.md` body 与 generated vendor body、
   raw 上游 body 与 generated vendor body、每个 reviewed 资源文件字节、每个 `knowledge_refs`
   的 `content_hash`、`provenance.upstream_sources`、profile 结构，以及 extension body 的
   流程权威模式扫描。
2. 语义审阅：真实阅读每个 raw Skill 的标题、KEY PRINCIPLES、When to Use、工具表、章节结构、
   输出契约与 honesty/limitations 段，逐项选出 2–3 个「业务上必须保留」的语义点（避开通用
   ResearchSpec boundary 之类的框架性文字），给出 vendor 原文片段与行号，以及 extension 对应行。
3. 机器提取只用于定位行与片段；判定来自原文阅读，不以脚本开头行代替语义结论。

## 覆盖与不变量结论

| 检查 | 结果 |
| --- | --- |
| retained 能力数 | 97（对应 97 个 extension capability + 97 个 graph profile） |
| extension body 保留 generated vendor body | 97/97 一致（extension = vendor body 前缀 + 固定 node-contract 追加段） |
| generated vendor body 保留 raw 上游 body | 94/97 逐字节一致（前置 `ResearchSpec boundary` 单行）；3 个阶段式下移，见下 |
| reviewed 资源逐字节复制 | 230/230 byte-identical（54 个能力带资源） |
| `knowledge_refs` 绑定 | 230/230 `content_hash` 与源文件一致，无孤儿 ref |
| `provenance.upstream_sources` | 97/97 含 SKILL.md + 全部资源，hash 与源文件一致 |
| graph profile | 97/97 存在，`kind: capability`，`gates/decisions` 为空，单一 research 节点 |
| 流程权威泄漏（next-node/next-phase/agent-team） | 0 命中；唯一 `orchestration` 命中为 fastq-qc 的业务脚本小节，非 agent 编排 |
| 97 个能力 adapter 产出（生成前时点） | 未定。本文件是生成前复核；部分能力的被引用工具受本轮目录变化影响（如 FAERS、Reactome、EBI eQTL 等），经间接适配后可能进入实际 changed subset |

### 预期异常（3 项，非缺陷）

`tooluniverse-residue-functional-mechanism-interpretation`、`tooluniverse-rnaseq-deseq2`、
`tooluniverse-variant-analysis` 的 raw 正文超过 480 行阈值，converter 按既有规则把尾部
`## ` 段下移到 `references/upstream-details.md`（knowledge ref）。核验：
`extension SKILL.md body + references/upstream-details.md` 与 `boundary + raw body` 去空行后内容相等，
仅在拼接缝丢失 1 个空行；无内容丢失。三者生成物均保留该知识 ref 与其 `content_hash`。

### 间接适配信号（属于主线程范围，本文件仅登记）

`upstream-delta.json` 的 `tool_catalog_delta.production_reference_impacts` 中，有 1373 条引用落在
本 97 集内（83 个能力）：1370 条 `parameter-schema-changed`、3 条 `removed`。
`removed` 3 条全部属于 `tooluniverse-epigenomics-chromatin`（`eQTL_list_datasets`、`eQTL_get_associations`，
默认配置停用），与 `semantic_review.indirect_reviews` 中唯一一条 `gap` 判定一致。
其余 82 个能力的 impact 均为被引用工具的参数/schema 描述变化；raw SKILL 与资源字节未变，
是否发生语义漂移由直接变化集合的适配统一处理，此处只登记计数与类别。
另有 14 个 retained 能力无任何 tool-ref impact：
`data-integration-analysis`、`expression-data-retrieval`、`fastq-qc`、`gwas-finemapping`、
`gwas-snp-interpretation`、`image-analysis`、`immune-repertoire-analysis`、`kegg-disease-drug`、
`mendelian-randomization`、`meta-analysis`、`natural-product-dereplication`、`pharmacokinetics`、
`phewas`、`proteomics-data-retrieval`。

## 审阅限制

- 这是生成前的保留性复核，不是生成后验收：它确认现有 generated vendor bundle 与
  extension 在 raw 上游未变的 97 个能力上的一致性，不判定本轮转换将要写入的最终字节。
- 最终实际 changed subset 由直接变化集合、间接适配以及新增 Skill 决策共同决定，并在
  `05-semantic-review.md` 与 `semantic_review` 中记录；本文件不重复该任务，也不覆盖其结论。
- 97 个能力的 shared body 当前与 raw 上游一致，但其中若被引用工具发生契约变化（本轮
  `parameter-schema-changed` 1370 条、`removed` 3 条），仍需间接适配；本文件只登记信号，
  不做适配实现。
- 判定的行号相对当前 generated vendor `SKILL.md` 与 extension `SKILL.md`；生成后行号可能位移。
- 未执行任何上游脚本或服务，未打开生成的 validator/python 资源；资源一致性以字节与 hash 校验为准。

## 覆盖清单（97/97）

行偏移列为 extension 行 = vendor 行 + 偏移。`res` 为 reviewed 资源/知识 ref 数；`profile` 为 graph profile 检查；
`tool-ref` 为本能力在 `production_reference_impacts` 中的条目数。

| # | raw Skill → extension capability | 偏移 | res | profile | tool-ref |
| ---: | --- | ---: | ---: | --- | ---: |
| 1 | tooluniverse-acmg-variant-classification → plugin-tooluniverse-acmg-variant-classification | −6 | 0 | OK | 8 |
| 2 | tooluniverse-adverse-outcome-pathway → plugin-tooluniverse-adverse-outcome-pathway | −6 | 0 | OK | 6 |
| 3 | tooluniverse-aging-senescence → plugin-tooluniverse-aging-senescence | −7 | 0 | OK | 8 |
| 4 | tooluniverse-cancer-classification → plugin-tooluniverse-cancer-classification | −5 | 0 | OK | 7 |
| 5 | tooluniverse-cancer-genomics-tcga → plugin-tooluniverse-cancer-genomics-tcga | −6 | 0 | OK | 6 |
| 6 | tooluniverse-cancer-variant-interpretation → plugin-tooluniverse-cancer-variant-interpretation | −7 | 7 | OK | 30 |
| 7 | tooluniverse-chemical-compound-retrieval → plugin-tooluniverse-chemical-compound-retrieval | −7 | 2 | OK | 9 |
| 8 | tooluniverse-chemical-safety → plugin-tooluniverse-chemical-safety | −6 | 4 | OK | 15 |
| 9 | tooluniverse-chemical-sourcing → plugin-tooluniverse-chemical-sourcing | −6 | 0 | OK | 8 |
| 10 | tooluniverse-clinical-data-integration → plugin-tooluniverse-clinical-data-integration | −5 | 0 | OK | 9 |
| 11 | tooluniverse-clinical-guidelines → plugin-tooluniverse-clinical-guidelines | −6 | 1 | OK | 13 |
| 12 | tooluniverse-clinical-risk-scoring → plugin-tooluniverse-clinical-risk-scoring | −4 | 0 | OK | 8 |
| 13 | tooluniverse-clinical-trial-design → plugin-tooluniverse-clinical-trial-design | −7 | 8 | OK | 86 |
| 14 | tooluniverse-clinical-trial-matching → plugin-tooluniverse-clinical-trial-matching | −9 | 7 | OK | 28 |
| 15 | tooluniverse-computational-biophysics → plugin-tooluniverse-computational-biophysics | −6 | 9 | OK | 7 |
| 16 | tooluniverse-crispr-screen-analysis → plugin-tooluniverse-crispr-screen-analysis | −6 | 8 | OK | 12 |
| 17 | tooluniverse-data-integration-analysis → plugin-tooluniverse-data-integration-analysis | −5 | 0 | OK | 0 |
| 18 | tooluniverse-data-wrangling → plugin-tooluniverse-data-wrangling | −6 | 1 | OK | 4 |
| 19 | tooluniverse-diagnostic-test-evaluation → plugin-tooluniverse-diagnostic-test-evaluation | −7 | 1 | OK | 7 |
| 20 | tooluniverse-disease-research → plugin-tooluniverse-disease-research | −5 | 5 | OK | 70 |
| 21 | tooluniverse-dose-response → plugin-tooluniverse-dose-response | −8 | 1 | OK | 4 |
| 22 | tooluniverse-drug-drug-interaction → plugin-tooluniverse-drug-drug-interaction | −5 | 5 | OK | 18 |
| 23 | tooluniverse-drug-mechanism-research → plugin-tooluniverse-drug-mechanism-research | −5 | 0 | OK | 2 |
| 24 | tooluniverse-drug-repurposing → plugin-tooluniverse-drug-repurposing | −6 | 5 | OK | 148 |
| 25 | tooluniverse-drug-synergy → plugin-tooluniverse-drug-synergy | −8 | 1 | OK | 6 |
| 26 | tooluniverse-drug-target-validation → plugin-tooluniverse-drug-target-validation | −5 | 4 | OK | 33 |
| 27 | tooluniverse-electron-microscopy → plugin-tooluniverse-electron-microscopy | −5 | 0 | OK | 6 |
| 28 | tooluniverse-enzyme-kinetics → plugin-tooluniverse-enzyme-kinetics | −8 | 1 | OK | 3 |
| 29 | tooluniverse-epigenomics-chromatin → plugin-tooluniverse-epigenomics-chromatin | −5 | 0 | OK | 23 |
| 30 | tooluniverse-expression-data-retrieval → plugin-tooluniverse-expression-data-retrieval | −5 | 2 | OK | 0 |
| 31 | tooluniverse-fastq-qc → plugin-tooluniverse-fastq-qc | −4 | 4 | OK | 0 |
| 32 | tooluniverse-functional-genomics-screens → plugin-tooluniverse-functional-genomics-screens | −5 | 0 | OK | 5 |
| 33 | tooluniverse-gene-disease-association → plugin-tooluniverse-gene-disease-association | −5 | 0 | OK | 19 |
| 34 | tooluniverse-gene-regulatory-networks → plugin-tooluniverse-gene-regulatory-networks | −5 | 0 | OK | 4 |
| 35 | tooluniverse-gpcr-structural-pharmacology → plugin-tooluniverse-gpcr-structural-pharmacology | −6 | 0 | OK | 46 |
| 36 | tooluniverse-gwas-drug-discovery → plugin-tooluniverse-gwas-drug-discovery | −6 | 6 | OK | 6 |
| 37 | tooluniverse-gwas-finemapping → plugin-tooluniverse-gwas-finemapping | −5 | 1 | OK | 0 |
| 38 | tooluniverse-gwas-snp-interpretation → plugin-tooluniverse-gwas-snp-interpretation | −6 | 2 | OK | 0 |
| 39 | tooluniverse-gwas-study-explorer → plugin-tooluniverse-gwas-study-explorer | −5 | 1 | OK | 1 |
| 40 | tooluniverse-gwas-trait-to-gene → plugin-tooluniverse-gwas-trait-to-gene | −5 | 1 | OK | 4 |
| 41 | tooluniverse-hla-immunogenomics → plugin-tooluniverse-hla-immunogenomics | −5 | 0 | OK | 3 |
| 42 | tooluniverse-image-analysis → plugin-tooluniverse-image-analysis | −6 | 9 | OK | 0 |
| 43 | tooluniverse-immune-repertoire-analysis → plugin-tooluniverse-immune-repertoire-analysis | −6 | 2 | OK | 0 |
| 44 | tooluniverse-immunology → plugin-tooluniverse-immunology | −6 | 0 | OK | 32 |
| 45 | tooluniverse-immunotherapy-response-prediction → plugin-tooluniverse-immunotherapy-response-prediction | −5 | 5 | OK | 7 |
| 46 | tooluniverse-infectious-disease → plugin-tooluniverse-infectious-disease | −5 | 5 | OK | 39 |
| 47 | tooluniverse-inorganic-physical-chemistry → plugin-tooluniverse-inorganic-physical-chemistry | −5 | 1 | OK | 4 |
| 48 | tooluniverse-kegg-disease-drug → plugin-tooluniverse-kegg-disease-drug | −7 | 0 | OK | 0 |
| 49 | tooluniverse-lipidomics → plugin-tooluniverse-lipidomics | −5 | 0 | OK | 6 |
| 50 | tooluniverse-mendelian-randomization → plugin-tooluniverse-mendelian-randomization | −3 | 0 | OK | 0 |
| 51 | tooluniverse-meta-analysis → plugin-tooluniverse-meta-analysis | −9 | 1 | OK | 0 |
| 52 | tooluniverse-metabolomics → plugin-tooluniverse-metabolomics | −5 | 11 | OK | 17 |
| 53 | tooluniverse-metabolomics-analysis → plugin-tooluniverse-metabolomics-analysis | −5 | 2 | OK | 3 |
| 54 | tooluniverse-metabolomics-pathway → plugin-tooluniverse-metabolomics-pathway | −5 | 0 | OK | 25 |
| 55 | tooluniverse-metagenomics-analysis → plugin-tooluniverse-metagenomics-analysis | −5 | 0 | OK | 5 |
| 56 | tooluniverse-microbial-genome-characterization → plugin-tooluniverse-microbial-genome-characterization | −14 | 0 | OK | 16 |
| 57 | tooluniverse-microbiome-research → plugin-tooluniverse-microbiome-research | −6 | 0 | OK | 13 |
| 58 | tooluniverse-model-organism-genetics → plugin-tooluniverse-model-organism-genetics | −5 | 0 | OK | 7 |
| 59 | tooluniverse-multi-omics-integration → plugin-tooluniverse-multi-omics-integration | −5 | 1 | OK | 2 |
| 60 | tooluniverse-natural-product-dereplication → plugin-tooluniverse-natural-product-dereplication | −12 | 0 | OK | 0 |
| 61 | tooluniverse-network-pharmacology → plugin-tooluniverse-network-pharmacology | −5 | 7 | OK | 67 |
| 62 | tooluniverse-noncoding-rna → plugin-tooluniverse-noncoding-rna | −5 | 0 | OK | 7 |
| 63 | tooluniverse-organic-chemistry → plugin-tooluniverse-organic-chemistry | −6 | 7 | OK | 9 |
| 64 | tooluniverse-pathway-disease-genetics → plugin-tooluniverse-pathway-disease-genetics | −6 | 0 | OK | 11 |
| 65 | tooluniverse-peptide-target-deorphanization → plugin-tooluniverse-peptide-target-deorphanization | −11 | 3 | OK | 41 |
| 66 | tooluniverse-pharmacogenomics → plugin-tooluniverse-pharmacogenomics | −5 | 0 | OK | 24 |
| 67 | tooluniverse-pharmacokinetics → plugin-tooluniverse-pharmacokinetics | −7 | 1 | OK | 0 |
| 68 | tooluniverse-pharmacovigilance → plugin-tooluniverse-pharmacovigilance | −5 | 6 | OK | 51 |
| 69 | tooluniverse-phewas → plugin-tooluniverse-phewas | −3 | 0 | OK | 0 |
| 70 | tooluniverse-polygenic-risk-score → plugin-tooluniverse-polygenic-risk-score | −5 | 2 | OK | 4 |
| 71 | tooluniverse-population-genetics → plugin-tooluniverse-population-genetics | −5 | 1 | OK | 17 |
| 72 | tooluniverse-population-genetics-1000genomes → plugin-tooluniverse-population-genetics-1000genomes | −5 | 0 | OK | 2 |
| 73 | tooluniverse-precision-medicine-stratification → plugin-tooluniverse-precision-medicine-stratification | −5 | 5 | OK | 21 |
| 74 | tooluniverse-primer-design → plugin-tooluniverse-primer-design | −7 | 1 | OK | 2 |
| 75 | tooluniverse-protein-lof-mechanism → plugin-tooluniverse-protein-lof-mechanism | −7 | 0 | OK | 4 |
| 76 | tooluniverse-protein-modification-analysis → plugin-tooluniverse-protein-modification-analysis | −5 | 0 | OK | 20 |
| 77 | tooluniverse-protein-sae-variant-interpretation → plugin-tooluniverse-protein-sae-variant-interpretation | −8 | 0 | OK | 2 |
| 78 | tooluniverse-protein-structural-annotation-pdb → plugin-tooluniverse-protein-structural-annotation-pdb | −7 | 0 | OK | 8 |
| 79 | tooluniverse-protein-structure-retrieval → plugin-tooluniverse-protein-structure-retrieval | −6 | 2 | OK | 10 |
| 80 | tooluniverse-protein-therapeutic-design → plugin-tooluniverse-protein-therapeutic-design | −5 | 5 | OK | 4 |
| 81 | tooluniverse-proteomics-analysis → plugin-tooluniverse-proteomics-analysis | −5 | 3 | OK | 1 |
| 82 | tooluniverse-proteomics-data-retrieval → plugin-tooluniverse-proteomics-data-retrieval | −5 | 0 | OK | 0 |
| 83 | tooluniverse-residue-functional-mechanism-interpretation → plugin-tooluniverse-residue-functional-mechanism-interpretation | −9 | 1 | OK | 3 |
| 84 | tooluniverse-rnaseq-deseq2 → plugin-tooluniverse-rnaseq-deseq2 | −8 | 20 | OK | 8 |
| 85 | tooluniverse-sequence-retrieval → plugin-tooluniverse-sequence-retrieval | −5 | 2 | OK | 25 |
| 86 | tooluniverse-single-cell → plugin-tooluniverse-single-cell | −9 | 13 | OK | 22 |
| 87 | tooluniverse-small-molecule-discovery → plugin-tooluniverse-small-molecule-discovery | −5 | 0 | OK | 46 |
| 88 | tooluniverse-spatial-omics-analysis → plugin-tooluniverse-spatial-omics-analysis | −7 | 4 | OK | 33 |
| 89 | tooluniverse-stem-cell-organoid → plugin-tooluniverse-stem-cell-organoid | −5 | 0 | OK | 13 |
| 90 | tooluniverse-structural-variant-analysis → plugin-tooluniverse-structural-variant-analysis | −7 | 4 | OK | 19 |
| 91 | tooluniverse-systems-biology → plugin-tooluniverse-systems-biology | −5 | 5 | OK | 3 |
| 92 | tooluniverse-toxicology → plugin-tooluniverse-toxicology | −6 | 0 | OK | 15 |
| 93 | tooluniverse-vaccine-design → plugin-tooluniverse-vaccine-design | −7 | 1 | OK | 5 |
| 94 | tooluniverse-variant-analysis → plugin-tooluniverse-variant-analysis | −5 | 13 | OK | 15 |
| 95 | tooluniverse-variant-functional-annotation → plugin-tooluniverse-variant-functional-annotation | −6 | 0 | OK | 3 |
| 96 | tooluniverse-variant-predictor-dms-validation → plugin-tooluniverse-variant-predictor-dms-validation | −7 | 0 | OK | 1 |
| 97 | tooluniverse-variant-to-mechanism → plugin-tooluniverse-variant-to-mechanism | −6 | 0 | OK | 9 |

## 逐能力语义审阅

每项给出 vendor `SKILL.md` 原文片段与行号，以及 extension `SKILL.md` 对应行（ext = vendor + 偏移）。
资源项另列 knowledge ref。判定：全部为 `preserved`（正文原样保留）；标注「间接」者属于 tool-ref 影响，需主线程适配。

### 1. tooluniverse-acmg-variant-classification
`plugin-tooluniverse-acmg-variant-classification` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | ACMG 判级的组合规则（不能凭单一证据下结论） | :25 | :19 | "The classification is the COMBINATION of all activated criteria, not any single criterion." |
| 2 | 证据含糊时保持标准未满足的保守纪律 | :31 | :25 | "Always apply criteria conservatively. When evidence is ambiguous, leave the criterion unmet." |
| 3 | 28 条标准合成到 5 档判级的算法 | :194 | :188 | "**Pathogenic**: (1) PVS1 + ≥1 Strong; (2) PVS1 + ≥2 Moderate; ..."（Classification Algorithm） |

判定：preserved。

### 2. tooluniverse-adverse-outcome-pathway
`plugin-tooluniverse-adverse-outcome-pathway` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | AOP 发现路径（AOPWiki） | :68 | :62 | "## Phase 2: AOP Discovery" |
| 2 | 危害量化路径（PubChemTox） | :90 | :84 | "## Phase 3: Hazard Quantification (PubChemTox)" |
| 3 | 急性毒性与 GHS 分级解释 | :161 | :155 | "LD50 values indicate acute toxicity (lower = more toxic). GHS categories: Cat 1 (..." |

判定：preserved。

### 3. tooluniverse-aging-senescence
`plugin-tooluniverse-aging-senescence` · 偏移 −7 · shared body 一致 · resources 0 · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 衰老标志物分类阶段 | :73 | :66 | "## Phase 1: Hallmarks Classification" |
| 2 | 证据分级（人类遗传 vs 模式生物寿命数据） | :32 | :25 | "T1 is human genetic evidence (GWAS, centenarian studies). T2 is model organism lifespan dat..." |
| 3 | FOXO3 长寿研究的靶向基因分型局限 | :87 | :80 | "many FOXO3 longevity studies (Willcox 2008, Flachsbart 2009) used targeted genotyping rather than GWAS" |

判定：preserved。

### 4. tooluniverse-cancer-classification
`plugin-tooluniverse-cancer-classification` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 下游使用前必须校验 OncoTree 编码 | :80 | :75 | "Always validate via `OncoTree_get_type` before using in downstream tools." |
| 2 | 肿瘤分类决定治疗，查证不臆测 | :150 | :145 | "**LOOK UP DON'T GUESS** -- tumor classification determines treatment. Always verify codes and biomarker interpretation v..." |
| 3 | 分期与分级是不同概念 | :169 | :164 | "Staging vs Grading -- Different Concepts" |

判定：preserved。

### 5. tooluniverse-cancer-genomics-tcga
`plugin-tooluniverse-cancer-genomics-tcga` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 驱动基因的突变频率判据 | :283 | :277 | "A gene mutated in >10% of a TCGA cohort is likely a driver candidate (e.g., TP53 in 36% of all T..." |
| 2 | OncoKB 变异解释阶段的收尾 | :189 | :183 | "## Phase 6: Variant Interpretation (OncoKB)" |
| 3 | 能力范围边界（NOT for） | :40 | :34 | "## NOT for (use other skills instead)" |

判定：preserved。

### 6. tooluniverse-cancer-variant-interpretation
`plugin-tooluniverse-cancer-variant-interpretation` · 偏移 −7 · shared body 一致 · resources 7（全部 byte-identical，7 个 knowledge ref） · profile OK · tool-ref 30（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 报告先行的工作方式 | :26 | :19 | "**Report-first approach** - Create report file FIRST, then populate progressively" |
| 2 | 耐药机制必须核查 | :31 | :24 | "**Resistance-aware** - Always check for known resistance mechanisms" |
| 3 | 工具参数校验前置阶段 | :67 | :60 | "## Phase 0: Tool Parameter Verification (CRITICAL)" |
| 资源 | `ANALYSIS_DETAILS.md`、`EXAMPLES.md`、`INPUT_PARSING.md`、`QUICK_START.md`、`REPORT_TEMPLATE.md`、`SCORING_TABLES.md`、`TOOLS_REFERENCE.md` | — | knowledge_refs | 7 项 `content_hash` 与源文件一致 |

判定：preserved。

### 7. tooluniverse-chemical-compound-retrieval
`plugin-tooluniverse-chemical-compound-retrieval` · 偏移 −7 · shared body 一致 · resources 2 · profile OK · tool-ref 9（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 身份消歧必须先行 | :45 | :38 | "## Phase 1: Disambiguation" |
| 2 | 不得凭记忆断言 CID/ChEMBL ID/分子属性 | :26 | :19 | "**LOOK UP DON'T GUESS**: Never assume a CID, ChEMBL ID, or molecular property value." |
| 3 | SMILES 核验步骤 | :101 | :94 | "## SMILES Verification" |
| 资源 | `CHECKLIST.md`、`examples.md` | — | knowledge_refs | 2 项一致 |

判定：preserved。

### 8. tooluniverse-chemical-safety
`plugin-tooluniverse-chemical-safety` · 偏移 −6 · shared body 一致 · resources 4 · profile OK · tool-ref 15（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 证据分级为强制要求 | :65 | :59 | "## Evidence Grading System (MANDATORY)" |
| 2 | 8 阶段研究策略（含 ADMET 与毒理基因组） | :78 | :72 | "## Core Strategy: 8 Research Phases" |
| 3 | 保守风险评估 | :51 | :45 | "**Conservative risk assessment** - When evidence is ambiguous, flag as \"requires further investigation\""（KEY PRINCIPLES 块） |
| 资源 | `evidence-grading.md`、`phase-details.md`、`phase-procedures-detailed.md`、`report-templates.md` | — | knowledge_refs | 4 项一致 |

判定：preserved。

### 9. tooluniverse-chemical-sourcing
`plugin-tooluniverse-chemical-sourcing` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | PubChem 采购需用 ConnectivitySMILES 而非 CanonicalSMILES | :116 | :110 | "**Important**: PubChem `ConnectivitySMILES` (not `CanonicalSMILES`) is the correct property name." |
| 2 | 名称歧义先解析到 SMILES | :246 | :240 | "**Name ambiguity**: Multiple compounds share a name (e.g., \"aspirin\" vs \"acetylsalicylic acid\"). Always resolve to SMI..." |
| 3 | 供应商检索与比价阶段 | :118/:156 | :112/:150 | "## Phase 1: Vendor Search" / "## Phase 2: Price & Availability Comparison" |

判定：preserved。

### 10. tooluniverse-clinical-data-integration
`plugin-tooluniverse-clinical-data-integration` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 9（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | FAERS 信号需标签/文献佐证才可采信 | :26 | :21 | "**Signals need context** -- a FAERS signal without label or literature corroboration is hypothesis-generating, not confirmatory" |
| 2 | 不成比例性不等于因果 | :27 | :22 | "**Disproportionality is not causation** -- PRR/ROR measure reporting patterns, not causal relationships" |
| 3 | FAERS 工具参数名易错点 | :172 | :167 | "`FAERS_count_reactions_by_drug_event` uses `medicinalproduct` param, not `drug_name`" |

判定：preserved。

### 11. tooluniverse-clinical-guidelines
`plugin-tooluniverse-clinical-guidelines` · 偏移 −6 · shared body 一致 · resources 1 · profile OK · tool-ref 13（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 指南时效性必须核查 | :32 | :26 | "**Always check publication date.** A 2015 guideline may be superseded by a 2024 update." |
| 2 | 至少检索 3 个来源 | :50 | :44 | "Always query a minimum of 3 databases to catch guidelines that one source may miss. Prioritize: **NICE > GIN > TRIP > So..." |
| 3 | 诊断测试选择的常见陷阱 | :86 | :80 | "1. **Ordering a test that is positive in BOTH conditions on the differential**" |
| 资源 | `TOOLS_REFERENCE.md` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 12. tooluniverse-clinical-risk-scoring
`plugin-tooluniverse-clinical-risk-scoring` · 偏移 −4 · shared body 一致 · resources 0 · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 场景到评分表的映射 | :25 | :21 | "Step 1 — Map the scenario to the score(s)" |
| 2 | 逐评分表的确定性计算与解释 | :67 | :63 | "Step 4 — Interpret (per-score tables)" |
| 3 | 仅作决策支持、不替代临床判断 | :187 | :183 | "**Decision-support only.** These scores inform, but do not replace, clinical judgment and the full clinical picture." |

判定：preserved。

### 13. tooluniverse-clinical-trial-design
`plugin-tooluniverse-clinical-trial-design` · 偏移 −7 · shared body 一致 · resources 8 · profile OK · tool-ref 86（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 报告先行（强制） | :43 | :36 | "### 1. Report-First Approach (MANDATORY)" |
| 2 | 可行性评分 0-100 | :59 | :52 | "3. Feasibility Score (0-100)" |
| 3 | 14 段报告模板 | :120 | :113 | "Create `[INDICATION]_trial_feasibility_report.md` with all 14 sections. See `REPORT_TEMPLATE.md` for full temp..." |
| 资源 | `BEST_PRACTICES.md`、`EXAMPLES.md`、`QUICK_START.md`、`REPORT_TEMPLATE.md`、`STUDY_DESIGN_PROCEDURES.md`、`WORKFLOW_DETAILS.md`、`python_implementation.py`、`trial_pipeline.py` | — | knowledge_refs | 8 项一致 |

判定：preserved。

### 14. tooluniverse-clinical-trial-matching
`plugin-tooluniverse-clinical-trial-matching` · 偏移 −9 · shared body 一致 · resources 7 · profile OK · tool-ref 28（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 以分子标志物优先匹配试验 | :28 | :19 | "**Molecular-first matching** - Prioritize trials targeting patient's specific biomarkers"（KEY PRINCIPLES 块） |
| 2 | 必需输入契约 | :74 | :65 | "## Required Input" |
| 3 | 单个工具失败不阻断整体分析 | :252 | :243 | "Never let one failure block the entire analysis" |
| 资源 | `EXAMPLES.md`、`MATCHING_ALGORITHMS.md`、`QUICK_START.md`、`REPORT_TEMPLATE.md`、`SCORING_CRITERIA.md`、`TOOLS_REFERENCE.md`、`TRIAL_SEARCH_PATTERNS.md` | — | knowledge_refs | 7 项一致 |

判定：preserved。

### 15. tooluniverse-computational-biophysics
`plugin-tooluniverse-computational-biophysics` · 偏移 −6 · shared body 一致 · resources 9 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 数值题必须写并运行代码 | :90 | :84 | "**CRITICAL: When a problem gives you numbers and asks for a numerical answer, WRITE AND RUN Python code using the Bash t..." |
| 2 | 选择题先用 Python 算出精确答案再匹配 | :163 | :157 | "6. **Quantitative MC**: Calculate the exact answer FIRST using Python, THEN match to the closest option." |
| 3 | 按物理过程分类的推理模式 | :37 | :31 | "2. Reasoning Patterns by Problem Type" |
| 资源 | `scripts/burn_fluids.py`、`scripts/env_risk_assessment.py`、`scripts/enzyme_kinetics.py`、`scripts/epidemiology.py`、`scripts/fluid_calculations.py`、`scripts/herd_immunity.py`、`scripts/iv_drip_rate.py`、`scripts/mc_analyzer.py`、`scripts/radioactive_decay.py` | — | knowledge_refs | 9 项一致 |

判定：preserved。

### 16. tooluniverse-crispr-screen-analysis
`plugin-tooluniverse-crispr-screen-analysis` · 偏移 −6 · shared body 一致 · resources 8 · profile OK · tool-ref 12（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先查已有结果再重算 | :23 | :17 | "## RULE ZERO — Check for pre-computed results FIRST" |
| 2 | 命中是统计发现而非生物学结论 | :173 | :167 | "Screen hits are statistical findings, not direct readouts of biological relevance." |
| 3 | DepMap/核心必需基因集必须查证 | :175 | :169 | "LOOK UP DON'T GUESS: DepMap dependency scores, known core essential gene sets (Hart et al., Blomen et al.)..." |
| 资源 | `ANALYSIS_DETAILS.md`、`EXAMPLES.md`、`FALLBACK_PATCH.md`、`QUICK_START.md`、`USE_CASES.md`、`scripts/CEGv2_core_essential.txt`、`scripts/NEGv1_nonessential.txt`、`scripts/reference_gene_sets.py` | — | knowledge_refs | 8 项一致 |

判定：preserved。

### 17. tooluniverse-data-integration-analysis
`plugin-tooluniverse-data-integration-analysis` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 不止于显著性，追问机制与语境 | :60 | :55 | "**Key principle**: Do not stop at \"gene X is significant.\" Ask: significant in what context? Through what mechanism?" |
| 2 | 因果推理步骤 | :85 | :80 | "## Step 3: Causal Reasoning" |
| 3 | 证据汇总表结构 | :120 | :115 | "## Evidence Summary Table" |

判定：preserved；无 tool-ref 影响。

### 18. tooluniverse-data-wrangling
`plugin-tooluniverse-data-wrangling` · 偏移 −6 · shared body 一致 · resources 1 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 工具 vs 代码的取舍判定 | :33 | :27 | "## Decision: Tool vs Code" |
| 2 | 跨格式原始数据获取手册 | :44 | :38 | "## Section A: Format Cookbook" |
| 3 | 受限/未覆盖数据源边界 | :316 | :310 | "## Section C: Restricted/Uncovered Data Sources" |
| 资源 | `references/specialized-domains.md` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 19. tooluniverse-diagnostic-test-evaluation
`plugin-tooluniverse-diagnostic-test-evaluation` · 偏移 −7 · shared body 一致 · resources 1 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | PPV/NPV 依赖患病率（反直觉陷阱） | :51 | :44 | "**The PPV/NPV trap.** Sensitivity and specificity are properties of the *test*; **PPV and NPV depend on the disease pr..." |
| 2 | 固定阈值 2×2 表指标 | :34 | :27 | "## Step 1 — Fixed-cutoff metrics from a 2×2 table" |
| 3 | 必须陈述的局限 | :94 | :87 | "## Gotchas (state these)" |
| 资源 | `scripts/roc_analysis.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 20. tooluniverse-disease-research
`plugin-tooluniverse-disease-research` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 70（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 报告先行的核心工作流 | :42 | :37 | "## Core Workflow: Report-First Approach" |
| 2 | 10 个研究维度 | :65 | :60 | "## 10 Research Dimensions" |
| 3 | 自由文本规范化到本体 ID | :82 | :77 | "## Normalizing free text to ontology IDs (Dimension 1)" |
| 资源 | `EXAMPLES.md`、`REPORT_TEMPLATE.md`、`RESEARCH_PROTOCOL.md`、`TOOLS_REFERENCE.md`、`tool_usage_details.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 21. tooluniverse-dose-response
`plugin-tooluniverse-dose-response` · 偏移 −8 · shared body 一致 · resources 1 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | IC50 必须声明浓度单位 | :83 | :75 | "**Units.** The IC50 is only as correct as the concentration unit you fed in — always state the unit." |
| 2 | 4PL 单调假设的适用边界 | :87 | :79 | "4PL assumes a monotonic sigmoid; it cannot describe biphasic, bell-shaped, or steep all-or-none responses." |
| 3 | 效价与效力是两回事 | :89 | :81 | "Potency (IC50/EC50) is not efficacy (Emax) — a more potent compound can be a weaker (partial) agonist; report both." |
| 资源 | `scripts/fit_dose_response.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 22. tooluniverse-drug-drug-interaction
`plugin-tooluniverse-drug-drug-interaction` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 18（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | A→B 与 B→A 双向分析 | :26 | :21 | "**Bidirectional analysis** - Always analyze A→B and B→A interactions (effects may differ)" |
| 2 | 反向方向必须核查 | :121 | :116 | "**Always check the reverse direction.** Analyze B→A as well as A→B." |
| 3 | 肇事药-受害药模型 | :108 | :103 | "## The Perpetrator-Victim Model" |
| 资源 | `EXAMPLES.md`、`ddi_pipeline.py`、`ddi_working_example.py`、`python_implementation.py`、`scripts/pharmacology_ref.py` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 23. tooluniverse-drug-mechanism-research
`plugin-tooluniverse-drug-mechanism-research` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 2（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 药物身份解析起步 | :51 | :46 | "## Step 1: Resolve the Drug" |
| 2 | 脱靶效应评估 | :95 | :90 | "## Step 3: Assess Off-Target Effects" |
| 3 | 药物基因组学检查 | :176 | :171 | "## Step 6: Check Pharmacogenomics" |

判定：preserved。

### 24. tooluniverse-drug-repurposing
`plugin-tooluniverse-drug-repurposing` · 偏移 −6 · shared body 一致 · resources 5 · profile OK · tool-ref 148（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先判定策略再选工具（证据权重不同） | :37 | :31 | "Identify which strategy applies FIRST, then cho..." |
| 2 | 再利用可行性评分 0-100 | :139 | :133 | "## Repurposing Viability Score (0-100)" |
| 3 | 英语优先查询 | :25 | :19 | "**IMPORTANT**: Always use English terms in tool calls. Respond in the user's language." |
| 资源 | `EXAMPLES.md`、`PROCEDURES.md`、`REFERENCE.md`、`REPORT_TEMPLATE.md`、`strategies_and_patterns.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 25. tooluniverse-drug-synergy
`plugin-tooluniverse-drug-synergy` · 偏移 −8 · shared body 一致 · resources 1 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 按数据选择协同模型 | :29 | :21 | "## Step 0 — Pick the model by the data you have" |
| 2 | 协同具剂量依赖性 | :77 | :69 | "Synergy is often **dose-dependent** — a combination can be synergistic at one ratio and antagonistic at another" |
| 3 | 协同分数不等于总体效力 | :85 | :77 | "**A synergy score is not efficacy** — a strongly synergistic combination can still be weak overall" |
| 资源 | `scripts/synergy_reference.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 26. tooluniverse-drug-target-validation
`plugin-tooluniverse-drug-target-validation` · 偏移 −5 · shared body 一致 · resources 4 · profile OK · tool-ref 33（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 靶点消歧永远先行 | :103 | :98 | "## Phase 0: Target Disambiguation (ALWAYS FIRST)" |
| 2 | 分阶段打分（0-100 复合） | :83 | :78 | "## Scoring Overview" |
| 3 | 分阶段门控（未过 Phase 1 不得进入 Phase 3） | :33 | :28 | "Do not proceed to Phase 3 (Chemical Matter) before completing Phase 1 (Disease Association)." |
| 资源 | `QUICK_START.md`、`REPORT_TEMPLATE.md`、`SCORING_CRITERIA.md`、`TOOL_REFERENCE.md` | — | knowledge_refs | 4 项一致 |

判定：preserved。

### 27. tooluniverse-electron-microscopy
`plugin-tooluniverse-electron-microscopy` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | EMDB 图谱与图像检索 | :106 | :101 | "## Phase 1: Map & Image Search (EMDB)" |
| 2 | EMPIAR 原始数据获取 | :161 | :156 | "## Phase 3: Raw Data Access (EMPIAR)" |
| 3 | 交叉引用与语境整合 | :208 | :203 | "## Phase 5: Cross-Reference & Context" |

判定：preserved。

### 28. tooluniverse-enzyme-kinetics
`plugin-tooluniverse-enzyme-kinetics` · 偏移 −8 · shared body 一致 · resources 1 · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | Michaelis-Menten 拟合 | :47 | :39 | "## Step 2 — Fit Michaelis-Menten" |
| 2 | 抑制机制判断 | :71 | :63 | "## Step 4 — Inhibition mechanism" |
| 3 | Lineweaver-Burk 不得用于最终数值 | :96 | :88 | "**Lineweaver-Burk for final numbers** is the classic error — it's for a quick plot, not the reported Km/Vmax." |
| 资源 | `scripts/fit_michaelis_menten.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 29. tooluniverse-epigenomics-chromatin
`plugin-tooluniverse-epigenomics-chromatin` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 23（含 3 条 `removed`，间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 组蛋白修饰的推理规则 | :49 | :44 | "## Reasoning: Histone Marks" |
| 2 | eQTL 解释推理 | :66 | :61 | "## Reasoning: eQTL Interpretation" |
| 3 | 双价启动子逻辑 | :60 | :55 | "**Bivalent promoter logic**: If you observe H3K4me3 + H3K27me3 together at the same locus, the promoter is bivalent" |

判定：preserved（正文），但**间接适配未决**：`eQTL_list_datasets` / `eQTL_get_associations` 在目标默认配置被停用（`semantic_review.indirect_reviews` 判 `gap`，3 条 `removed` impact 落在 generated vendor `SKILL.md:175` 与 `:247`）。raw 字节未变，需主线程在受审适配中更新该路径与 fallback，本文件不修改。

### 30. tooluniverse-expression-data-retrieval
`plugin-tooluniverse-expression-data-retrieval` · 偏移 −5 · shared body 一致 · resources 2 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 不得假设数据集/登录号存在 | :26 | :21 | "**LOOK UP DON'T GUESS**: Never assume which datasets exist or their accessions. Always search to confirm." |
| 2 | 检索失败的回退链 | :79 | :74 | "## Fallback Chains" |
| 3 | 数据质量分层 | :106 | :101 | "## Data Quality Tiers" |
| 资源 | `CHECKLIST.md`、`examples.md` | — | knowledge_refs | 2 项一致 |

判定：preserved；无 tool-ref 影响。

### 31. tooluniverse-fastq-qc
`plugin-tooluniverse-fastq-qc` · 偏移 −4 · shared body 一致 · resources 4 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 绝不自动修剪（QC-only 为默认） | :32 | :28 | "2. **Never auto-trim.** Trimming is a *decision*. QC-only is the default." |
| 2 | 绝不覆盖原始 FASTQ | :35 | :31 | "3. **Never overwrite raw FASTQs.** All outputs go to a separate `--workdir`." |
| 3 | 内置 QC 编排脚本的使用边界 | :107 | :103 | "## Bundled orchestration script"（业务脚本小节，非 agent 编排） |
| 资源 | `references/fastqc_interpretation.md`、`references/tools_and_install.md`、`references/trimming_decisions.md`、`scripts/run_fastq_qc.py` | — | knowledge_refs | 4 项一致 |

判定：preserved；无 tool-ref 影响。

### 32. tooluniverse-functional-genomics-screens
`plugin-tooluniverse-functional-genomics-screens` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 5（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 命中验证阶段 | :55 | :50 | "## Phase 1: Hit Validation" |
| 2 | DepMap 缺项回退 | :110 | :105 | "**Gene not in DepMap**: Fall back to gnomAD + UniProt" |
| 3 | STRING 关联不等同因果 | :119 | :114 | "STRING interactions are associations, not causal" |

判定：preserved。

### 33. tooluniverse-gene-disease-association
`plugin-tooluniverse-gene-disease-association` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 19（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 基因/疾病 ID 解析阶段 | :73 | :68 | "## Phase 1: Gene/Disease Identification & ID Resolution" |
| 2 | 孟德尔疾病证据阶段 | :138 | :133 | "## Phase 5: Mendelian Disease Evidence" |
| 3 | OMIM 需用基因 MIM 号 | :215 | :210 | "**OMIM returns no gene map**: Use the gene MIM number, not the phenotype MIM number." |

判定：preserved。

### 34. tooluniverse-gene-regulatory-networks
`plugin-tooluniverse-gene-regulatory-networks` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | TF motif 查询（JASPAR） | :48 | :43 | "## Phase 1: TF Motif Lookup (JASPAR)" |
| 2 | TF 靶基因（Enrichr） | :76 | :71 | "## Phase 2: TF Target Genes (Enrichr)" |
| 3 | 调控元件语境 | :107 | :102 | "## Phase 3: Regulatory Element Context" |

判定：preserved。

### 35. tooluniverse-gpcr-structural-pharmacology
`plugin-tooluniverse-gpcr-structural-pharmacology` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 46（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 受体优先（先解析 GPCRdb entry name） | :29 | :23 | "1. **Receptor-first** — Identify GPCR entry name before any GPCRdb queries" |
| 2 | GPCRdb entry name 格式（关键） | :68 | :62 | "## GPCRdb Entry Name Format" |
| 3 | 配体格局阶段 | :128 | :122 | "## Phase 2: Ligand Landscape" |

判定：preserved。

### 36. tooluniverse-gwas-drug-discovery
`plugin-tooluniverse-gwas-drug-discovery` · 偏移 −6 · shared body 一致 · resources 6 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 因果式思考（遗传关联提供方向） | :43 | :37 | "GWAS-to-drug translation succeeds when you think causally." |
| 2 | 不得臆断变异指向的基因 | :45 | :39 | "**LOOK UP DON'T GUESS**: Do not assume which gene a GWAS variant implicates — use `OpenTargets_get_variant_credible_sets`" |
| 3 | 成药性评估阶段 | :64 | :58 | "## Step 2: Druggability Assessment" |
| 资源 | `EXAMPLES.md`、`PROCEDURES.md`、`QUICK_START.md`、`REFERENCE.md`、`REPORT_TEMPLATE.md`、`python_implementation.py` | — | knowledge_refs | 6 项一致 |

判定：preserved。

### 37. tooluniverse-gwas-finemapping
`plugin-tooluniverse-gwas-finemapping` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 精细定位推理框架（关键） | :63 | :58 | "## Fine-Mapping Reasoning Framework (CRITICAL)" |
| 2 | 不得把 lead SNP 当因果变异 | :65 | :60 | "**LOOK UP DON'T GUESS** -- never assume a lead SNP is the causal variant. Always check LD structure, credible sets" |
| 3 | 可信集分析阶段 | :83 | :78 | "## Step 3: Credible Set Analysis" |
| 资源 | `python_implementation.py` | — | knowledge_refs | 1 项一致 |

判定：preserved；无 tool-ref 影响。

### 38. tooluniverse-gwas-snp-interpretation
`plugin-tooluniverse-gwas-snp-interpretation` · 偏移 −6 · shared body 一致 · resources 2 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | GWAS 命中是区域而非单变异 | :23 | :17 | "**SNP interpretation**: a GWAS hit is a REGION, not a single causal variant." |
| 2 | 可信集（精细定位）输出段 | :135 | :129 | "## 3. Credible Sets (Fine-Mapping)" |
| 3 | 输出格式契约 | :102 | :96 | "## Output Format" |
| 资源 | `QUICK_START.md`、`python_implementation.py` | — | knowledge_refs | 2 项一致 |

判定：preserved；无 tool-ref 影响。

### 39. tooluniverse-gwas-study-explorer
`plugin-tooluniverse-gwas-study-explorer` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 1（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 元分析方法学 | :106 | :101 | "## Meta-Analysis Approach" |
| 2 | 必须报告 I² 异质性 | :234 | :229 | "Always report I² statistic" |
| 3 | 异质性来源说明 | :137 | :132 | "## Sources of Heterogeneity" |
| 资源 | `python_implementation.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 40. tooluniverse-gwas-trait-to-gene
`plugin-tooluniverse-gwas-trait-to-gene` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 关联不因果 | :188 | :183 | "**Association ≠ Causation**: GWAS identifies correlated variants, not necessarily causal genes" |
| 2 | 性状到基因的工作流 | :51 | :46 | "## Workflow" |
| 3 | 已失效工具的使用注记 | :215 | :210 | "## `gwas_get_associations_for_trait` -- BROKEN" |
| 资源 | `python_implementation.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 41. tooluniverse-hla-immunogenomics
`plugin-tooluniverse-hla-immunogenomics` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 等位基因结合属性不得臆断 | :28 | :23 | "**LOOK UP DON'T GUESS**: Never assume an allele's binding properties or population frequency — query IEDB for experiment..." |
| 2 | HLA 基因查询阶段 | :113 | :108 | "## Phase 1: HLA Gene Lookup" |
| 3 | MHC 结合与限制性 | :133 | :128 | "## Phase 2: MHC Binding & Restriction" |

判定：preserved。

### 42. tooluniverse-image-analysis
`plugin-tooluniverse-image-analysis` · 偏移 −6 · shared body 一致 · resources 9 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先查已有结果 | :23 | :17 | "## RULE ZERO — Check for pre-computed results FIRST" |
| 2 | 相对比例默认按百分比 | :34 | :28 | "## CRITICAL — \"Relative proportion of A to B\" defaults to PERCENTAGE" |
| 3 | 分组统计→检验→回归流程 | :125 | :119 | "## Phase 1-3: Grouped Stats → Statistical Testing → Regression" |
| 资源 | `references/cell_counting.md`、`references/fluorescence_analysis.md`、`references/image_processing.md`、`references/segmentation.md`、`references/statistical_analysis.md`、`references/troubleshooting.md`、`scripts/batch_process.py`、`scripts/measure_fluorescence.py`、`scripts/segment_cells.py` | — | knowledge_refs | 9 项一致 |

判定：preserved；无 tool-ref 影响。

### 43. tooluniverse-immune-repertoire-analysis
`plugin-tooluniverse-immune-repertoire-analysis` · 偏移 −6 · shared body 一致 · resources 2 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 克隆性反映免疫史的解释 | :27 | :21 | "Repertoire diversity reflects immune history. High clonality — a few clones dominating — indicates antigen-driven expans..." |
| 2 | 克隆型定义阶段 | :54 | :48 | "## Phase 1: Data Import & Clonotype Definition" |
| 3 | 多样性与克隆性分析 | :63 | :57 | "## Phase 2: Diversity & Clonality Analysis" |
| 资源 | `ANALYSIS_DETAILS.md`、`USE_CASES.md` | — | knowledge_refs | 2 项一致 |

判定：preserved；无 tool-ref 影响。

### 44. tooluniverse-immunology
`plugin-tooluniverse-immunology` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 32（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 结合亲和力不得估算 | :36 | :30 | "**Antibody Kd values**: Never estimate binding affinity; check SAbDab, IEDB, or published literature." |
| 2 | 抗体/结构工具域 | :63 | :57 | "## Antibody / Structural (SAbDab, TheraSAbDab)" |
| 3 | 参数易错点 | :148 | :142 | "## Parameter Gotchas" |

判定：preserved。

### 45. tooluniverse-immunotherapy-response-prediction
`plugin-tooluniverse-immunotherapy-response-prediction` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 不得臆断 FDA 批准状态 | :35 | :30 | "**LOOK UP DON'T GUESS**: Never assume FDA approval for a biomarker-ICI combination — always verify with `fda_pharmacogen..." |
| 2 | 耐药突变必须核查 | :43 | :38 | "6. **Resistance-aware** - Always check for known resistance mutations (STK11, PTEN, JAK1/2, B2M)" |
| 3 | 量化输出 ICI 响应评分 | :37 | :32 | "3. **Quantitative output** - ICI Response Score (0-100) with transparent component breakdown" |
| 资源 | `EXAMPLES.md`、`INPUT_REFERENCE.md`、`REPORT_TEMPLATE.md`、`SCORING_TABLES.md`、`TOOLS_REFERENCE.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 46. tooluniverse-infectious-disease
`plugin-tooluniverse-infectious-disease` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 39（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 报告先行（强制） | :61 | :56 | "### 1. Report-First Approach (MANDATORY)" |
| 2 | 聚焦保守且必需的靶蛋白 | :27 | :22 | "2. **Target essential proteins** - Focus on conserved, essential viral/bacterial proteins" |
| 3 | 病原材料学信息不得臆断 | :43 | :38 | "**LOOK UP DON'T GUESS**: Never assume a pathogen's taxonomy, genome size, or protein function." |
| 资源 | `CHECKLIST.md`、`EXAMPLES.md`、`TOOLS_REFERENCE.md`、`phase_details.md`、`report_template.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 47. tooluniverse-inorganic-physical-chemistry
`plugin-tooluniverse-inorganic-physical-chemistry` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 晶体结构问题的判据 | :24 | :19 | "## 1. Crystal Structure Questions" |
| 2 | 溶解度计算必须按盐式给出化学计量比 | :88 | :83 | "Always specify `--stoich a:b` matching the salt formula (e.g., 1:3 for Al(OH)3, 1:2 for CaF2, 1:1 for AgCl)" |
| 3 | 对称性与点群 | :51 | :46 | "## 4. Symmetry & Point Groups" |
| 资源 | `scripts/equilibrium_solver.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 48. tooluniverse-kegg-disease-drug
`plugin-tooluniverse-kegg-disease-drug` · 偏移 −7 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | KEGG ID 不得凭记忆 | :30 | :23 | "**LOOK UP DON'T GUESS**: Do not assume KEGG disease IDs, drug IDs, or gene IDs from memory — always search first" |
| 2 | KEGG 自有基因 ID 命名空间 | :187 | :180 | "**ID conversion caveat**: KEGG uses its own gene ID namespace (e.g., hsa:7157 for TP53)." |
| 3 | 输出报告结构 | :200 | :193 | "Markdown report with: 1. Disease summary (KEGG ID, name, associated genes/pathways)" |

判定：preserved；无 tool-ref 影响。

### 49. tooluniverse-lipidomics
`plugin-tooluniverse-lipidomics` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 6（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先按 LIPID MAPS 8 类分类 | :30 | :25 | "1. **LIPID MAPS classification first** — use the 8-category system"（KEY PRINCIPLES 块） |
| 2 | LIPID MAPS ID/精确质量/通路不得臆断 | :28 | :23 | "**LOOK UP DON'T GUESS**: Do not assume a lipid's LIPID MAPS ID, exact mass, or pathway membership" |
| 3 | 脂质-疾病语境 | :138 | :133 | "**Disease context**: Ceramide elevation → apoptosis, Alzheimer's, insulin resistance." |

判定：preserved。

### 50. tooluniverse-mendelian-randomization
`plugin-tooluniverse-mendelian-randomization` · 偏移 −3 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 工具变量三大假设 | :26 | :23 | "## The three instrumental-variable assumptions" |
| 2 | 性状标签精确且大小写敏感 | :60 | :57 | "EpiGraphDB matches GWAS trait labels **exactly and case-sensitively**." |
| 3 | 工具质量（MOE）解读 | :100 | :97 | "Instrument quality (`moescore`, \"Mixture of Experts\")" |

判定：preserved；无 tool-ref 影响。

### 51. tooluniverse-meta-analysis
`plugin-tooluniverse-meta-analysis` · 偏移 −9 · shared body 一致 · resources 1 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 固定效应 vs 随机效应选择 | :76 | :67 | "## Step 2 — Fixed vs random effects" |
| 2 | 异质性解释决定结论 | :98 | :89 | "## Step 4 — Interpret heterogeneity (decides the story)" |
| 3 | 必须陈述的局限 | :121 | :112 | "## Honest limitations" |
| 资源 | `scripts/meta_analysis.py` | — | knowledge_refs | 1 项一致 |

判定：preserved；无 tool-ref 影响。

### 52. tooluniverse-metabolomics
`plugin-tooluniverse-metabolomics` · 偏移 −5 · shared body 一致 · resources 11 · profile OK · tool-ref 17（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 结构化报告产出 | :152 | :147 | "All analyses generate a structured markdown report with:" |
| 2 | 访问字段前先判响应类型 | :189 | :184 | "Always check response type with `isinstance()` before accessing fields." |
| 3 | 代谢物鉴定使用模式 | :79 | :74 | "## Pattern 1: Metabolite Identification" |
| 资源 | `QUICK_START.md`、`diabetes_analysis.py`、`example1_metabolites.md`、`example2_study.md`、`example3_search.md`、`python_implementation.py`、`scripts/metabolism_ref.py`、`test1_metabolites.md`、`test2_study.md`、`test3_search.md`、`test4_comprehensive.md` | — | knowledge_refs | 11 项一致 |

判定：preserved。

### 53. tooluniverse-metabolomics-analysis
`plugin-tooluniverse-metabolomics-analysis` · 偏移 −5 · shared body 一致 · resources 2 · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | QC 阈值按本工作流固定值，不得猜测 | :33 | :28 | "- CV thresholds and QC criteria: apply the values defined in this workflow (CV < 30%, blank ratio > 3x); do not override with guesses." |
| 2 | 代谢物身份必须查库确认 | :30 | :25 | "- Metabolite identities: use `Metabolite_search` and `Metabolite_get_info` to confirm names, CIDs, and HMDB IDs; never assume identity from..." |
| 3 | 差异分析阶段 | :145 | :140 | "## Phase 5: Differential Analysis" |
| 资源 | `code_examples.md`、`report_template.md` | — | knowledge_refs | 2 项一致 |

判定：preserved。

### 54. tooluniverse-metabolomics-pathway
`plugin-tooluniverse-metabolomics-pathway` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 25（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | ID 交叉引用 | :63 | :58 | "## ID Cross-Referencing" |
| 2 | 通路映射需数据库特定 ID | :26 | :21 | "Metabolite-to-pathway mapping requires correct, database-specific identifiers." |
| 3 | 代谢物识别与解析阶段 | :49 | :44 | "## Phase 0: Metabolite Identification & Resolution" |

判定：preserved。

### 55. tooluniverse-metagenomics-analysis
`plugin-tooluniverse-metagenomics-analysis` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 5（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | GTDB 与 NCBI 命名差异须标注 | :72 | :67 | "**Phase 2**: GTDB uses its own naming (e.g., `s__Bacteroides_A fragilis` vs NCBI `Bacteroides fragilis`). Always note di..." |
| 2 | 分类单元缺失时的回退 | :105 | :100 | "**Taxon not in GTDB**: Try partial search or fall back to MGnify (NCBI taxonomy)" |
| 3 | 能力边界：不做序列分析 | :115 | :110 | "**No sequence analysis**: Queries databases, not raw FASTQ/FASTA" |

判定：preserved。

### 56. tooluniverse-microbial-genome-characterization
`plugin-tooluniverse-microbial-genome-characterization` · 偏移 −14 · shared body 一致 · resources 0 · profile OK · tool-ref 16（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 组装统计必须调工具、不得凭记忆 | :34 | :20 | "When uncertain about an accession, assembly level, replicon count, or N50, CALL the tool. Never report assembly statisti..." |
| 2 | `get_taxonomy` 参数是 `tax_id` 而非 `taxon` | :73 | :59 | "> Param note: `get_taxonomy` requires `tax_id` (NOT `taxon`)." |
| 3 | `number_of_chromosomes` 语义（计组装分子） | :182 | :168 | "- **`number_of_chromosomes` counts assembled molecules**, not strictly chromosomes" |

判定：preserved。

### 57. tooluniverse-microbiome-research
`plugin-tooluniverse-microbiome-research` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 13（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先判数据类型再选工具 | :226 | :220 | "Before calling any tool, determine which data type the user has via `MGnify_get_study_detail`" |
| 2 | 样本内多样性的 Shannon 判读 | :254 | :248 | "**Alpha diversity (within-sample)**: Shannon index measures richness and evenness." |
| 3 | 按环境的发现工作流 | :98 | :92 | "## Workflow 1: Study Discovery by Environment" |

判定：preserved。

### 58. tooluniverse-model-organism-genetics
`plugin-tooluniverse-model-organism-genetics` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 保守不等于功能保守的推论边界 | :36 | :31 | "Sequence conservation across species implies functional conservation — but not always." |
| 2 | 跨物种综合阶段（关键） | :171 | :166 | "### Phase 6: Cross-Species Synthesis (CRITICAL)" |
| 3 | 人类基因消歧永远先行 | :63 | :58 | "## Phase 0: Human Gene Disambiguation (ALWAYS FIRST)" |

判定：preserved。

### 59. tooluniverse-multi-omics-integration
`plugin-tooluniverse-multi-omics-integration` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 2（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 预期相关范围是经验值不是保证 | :32 | :27 | "Expected RNA-protein correlation ranges: compute Spearman r from the actual data; the typical range (0.4-0.6) is a guide, not a guarantee." |
| 2 | 通路富集必须在真实基因表上运行 | :33 | :28 | "Pathway enrichment results: run `ReactomeAnalysis_pathway_enrichment` or gseapy on the actual gene lists; never list enriched pathways fro..." |
| 3 | 样本匹配 | :101 | :96 | "## Sample Matching" |
| 资源 | `phase_details.md` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 60. tooluniverse-natural-product-dereplication
`plugin-tooluniverse-natural-product-dereplication` · 偏移 −12 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先取得 InChIKey 才可去重 | :69 | :57 | "## Phase 1 — Obtain an InChIKey" |
| 2 | 针对 NPAtlas 的去重复阶段 | :85 | :73 | "## Phase 2 — Dereplicate against NPAtlas" |
| 3 | 名称命中不等于结构匹配 | :170 | :158 | "- **Name search ≠ structure match.** NPAtlas/PubChem name searches return synonyms, analogs, and salts. Always confirm i..." |

判定：preserved；无 tool-ref 影响。

### 61. tooluniverse-network-pharmacology
`plugin-tooluniverse-network-pharmacology` · 偏移 −5 · shared body 一致 · resources 7 · profile OK · tool-ref 67（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 实体消歧先行且先建报告 | :105 | :100 | "## Phase 0: Entity Disambiguation and Report Setup" |
| 2 | 网络邻近性打分阈值 | :89 | :84 | "- **Network Proximity (35 pts)**: Z < -2, p < 0.01 earns full points." |
| 3 | 多药理学推理（起点） | :33 | :28 | "## Polypharmacology Reasoning (Start Here)" |
| 资源 | `ANALYSIS_PROCEDURES.md`、`QUICK_START.md`、`REPORT_TEMPLATE.md`、`SCORING_REFERENCE.md`、`TOOL_REFERENCE.md`、`USE_PATTERNS.md`、`scripts/network_proximity.py` | — | knowledge_refs | 7 项一致 |

判定：preserved。

### 62. tooluniverse-noncoding-rna
`plugin-tooluniverse-noncoding-rna` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 7（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 类别决定功能（miRNA vs lncRNA） | :24 | :19 | "1. **Class determines function** — miRNAs repress mRNA translation; lncRNAs have diverse mechanisms" |
| 2 | 先定类别再选证据源 | :34 | :29 | "For any ncRNA query: first identify the class from the name/sequence, then select the appropriate evidence source." |
| 3 | 能力边界与局限 | :199 | :194 | "## Limitations" |

判定：preserved。

### 63. tooluniverse-organic-chemistry
`plugin-tooluniverse-organic-chemistry` · 偏移 −6 · shared body 一致 · resources 7 · profile OK · tool-ref 9（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 反应产物预测从最活泼位点入手 | :31 | :25 | "## Step 1 — Find the most reactive sites" |
| 2 | E2 消除中碱体积决定区域选择性 | :53 | :47 | "For E2 eliminations: **base size determines regiochemistry**. Bulky bases (KOtBu, LDA, DBU) favor the Hofmann product" |
| 3 | 光谱解释策略 | :129 | :123 | "## 2. Spectroscopy Interpretation — A Problem-Solving Strategy" |
| 资源 | `scripts/chemistry_facts.py`、`scripts/crystal_validator.py`、`scripts/degrees_of_unsaturation.py`、`scripts/molecular_complexity.py`、`scripts/molecular_formula.py`、`scripts/smiles_verifier.py`、`scripts/stereochem_tracker.py` | — | knowledge_refs | 7 项一致 |

判定：preserved。

### 64. tooluniverse-pathway-disease-genetics
`plugin-tooluniverse-pathway-disease-genetics` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 11（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 非编码变异通常不作用于最近基因 | :46 | :40 | "Non-coding GWAS variants (the majority) rarely affect the nearest gene." |
| 2 | 从 GWAS 到因果基因 | :114 | :108 | "## Step 1: GWAS to Causal Gene" |
| 3 | 通路富集阶段 | :89 | :83 | "## Phase 3: Pathway Enrichment" |

判定：preserved。

### 65. tooluniverse-peptide-target-deorphanization
`plugin-tooluniverse-peptide-target-deorphanization` · 偏移 −11 · shared body 一致 · resources 3 · profile OK · tool-ref 41（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 靶点不得凭记忆断言 | :36 | :25 | "1. **Never assert a target from memory.** Every candidate must come from a tool result (homology hit, family enumeration..." |
| 2 | 跨物种结果必须核对 | :38 | :27 | "3. **Reconcile across species.** \"Binds in species A but not B\" is usually **interface sequence divergence**" |
| 3 | 输出为排序候选短名单 | :110 | :99 | "## Output format — ranked shortlist report (return inline, no e...)" |
| 资源 | `references/phases.md`、`scripts/cofold_screen.py`、`scripts/deorphanize_peptide.py` | — | knowledge_refs | 3 项一致 |

判定：preserved。

### 66. tooluniverse-pharmacogenomics
`plugin-tooluniverse-pharmacogenomics` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 24（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | CPIC 参数易错点（ID 或药名，混用会失败） | :222 | :217 | "- `CPIC_get_recommendations`: accepts `guideline_id` (integer) OR `drug`/`drug_name` (string). Never pass guideline_id a..." |
| 2 | 代谢者表型推理 | :156 | :151 | "## Metabolizer Status Reasoning" |
| 3 | FDA 生物标志物标签阶段 | :170 | :165 | "## Phase 4: FDA Biomarker Labeling" |

判定：preserved。

### 67. tooluniverse-pharmacokinetics
`plugin-tooluniverse-pharmacokinetics` · 偏移 −7 · shared body 一致 · resources 1 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 口服数据得到的 CL/Vd 是表观值 | :89 | :82 | "- **CL/Vd from oral data are apparent** (CL/F, Vd/F) — never present them as true clearance/volume without IV data." |
| 2 | 单位错误会静默缩放 CL/Vd | :90 | :83 | "- **Units** drive CL/Vd — a wrong conc unit silently scales them. Always check the returned `units` block." |
| 3 | 翻转动力学的识别 | :91 | :84 | "- **Flip-flop kinetics** (absorption slower than elimination) makes the \"terminal\" slope reflect absorption" |
| 资源 | `scripts/nca_from_csv.py` | — | knowledge_refs | 1 项一致 |

判定：preserved；无 tool-ref 影响。

### 68. tooluniverse-pharmacovigilance
`plugin-tooluniverse-pharmacovigilance` · 偏移 −5 · shared body 一致 · resources 6 · profile OK · tool-ref 51（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 信号量化用不成比例性（PRR/ROR） | :27 | :22 | "2. **Signal quantification** - Use disproportionality measures (PRR, ROR)"（KEY PRINCIPLES 块） |
| 2 | 时间线作为诊断工具 | :63 | :58 | "## Reasoning Strategy 2: Timeline as Diagnostic Tool" |
| 3 | 必须追问未暴露人群基线率 | :110 | :105 | "**How to apply this**: Always ask — what is the base rate of this event in the untreated population?" |
| 资源 | `CHECKLIST.md`、`EXAMPLES.md`、`REPORT_TEMPLATES.md`、`SIGNAL_ANALYSIS.md`、`SIGNAL_DETECTION.md`、`TOOLS_REFERENCE.md` | — | knowledge_refs | 6 项一致 |

判定：preserved。

### 69. tooluniverse-phewas
`plugin-tooluniverse-phewas` · 偏移 −3 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 跨生物样本库面板 | :24 | :21 | "## The biobank panel" |
| 2 | 变异工具须传全基因组显著阈值 | :45 | :42 | "Always pass `max_pval: 5e-8` (genome-wide significance) for the variant tools" |
| 3 | 复现判定与解释表 | :62 | :59 | "## Step 4 — Judge replication (see interpretation table)" |

判定：preserved；无 tool-ref 影响。

### 70. tooluniverse-polygenic-risk-score
`plugin-tooluniverse-polygenic-risk-score` · 偏移 −5 · shared body 一致 · resources 2 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | PRS 计算公式 | :52 | :47 | "## PRS Calculation Formula" |
| 2 | 效应量/等位频率不得臆断 | :28 | :23 | "**LOOK UP DON'T GUESS**: Do not assume effect sizes, allele frequencies, or which SNPs are genome-wide significant" |
| 3 | 群体分层 | :141 | :136 | "## Population Stratification" |
| 资源 | `check_data.py`、`python_implementation.py` | — | knowledge_refs | 2 项一致 |

判定：preserved。

### 71. tooluniverse-population-genetics
`plugin-tooluniverse-population-genetics` · 偏移 −5 · shared body 一致 · resources 1 · profile OK · tool-ref 17（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | gnomAD variant_id 格式（无 chr 前缀） | :60 | :55 | "1. **gnomAD variant_id**: Format is `\"CHR-POS-REF-ALT\"` (no \"chr\" prefix)." |
| 2 | 计算题的理论推理 | :79 | :74 | "## Theoretical Reasoning (CRITICAL for computation problems)" |
| 3 | 间接路径不可忽略 | :166 | :161 | "- **Never ignore indirect paths** — the total is rarely just the direct arrow" |
| 资源 | `scripts/popgen_calculator.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 72. tooluniverse-population-genetics-1000genomes
`plugin-tooluniverse-population-genetics-1000genomes` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 2（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 1000 Genomes 群体检索 | :44 | :39 | "## Phase 1: Search 1000 Genomes Populations" |
| 2 | 能力范围边界 | :36 | :31 | "## NOT for (use other skills instead)" |
| 3 | 常用群体编码 | :181 | :176 | "## Common Population Codes" |

判定：preserved。

### 73. tooluniverse-precision-medicine-stratification
`plugin-tooluniverse-precision-medicine-stratification` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 21（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 疾病特异流程（癌症/代谢/罕见病在第 3 阶段分叉） | :36 | :31 | "2. **Disease-specific logic** - Cancer vs metabolic vs rare disease pipelines diverge at Phase 3"（KEY PRINCIPLES 块） |
| 2 | 能力路由到相邻 Skill | :57 | :52 | "- Single variant interpretation -> `tooluniverse-variant-interpretation`" |
| 3 | OpenTargets 返回嵌套结构 | :109 | :104 | "- **OpenTargets**: Always nested `{data: {entity: {field: ...}}}` structure" |
| 资源 | `EXAMPLES.md`、`QUICK_START.md`、`REPORT_TEMPLATE.md`、`SCORING_REFERENCE.md`、`TOOLS_REFERENCE.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 74. tooluniverse-primer-design
`plugin-tooluniverse-primer-design` · 偏移 −7 · shared body 一致 · resources 1 · profile OK · tool-ref 2（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | Tm 依赖方法与条件，需声明参数集 | :57 | :50 | "**Tm depends on method + conditions.** SantaLucia NN (the design tool), NEB, and IDT use different parameter sets" |
| 2 | 特异性不在工具能力内 | :75 | :68 | "## Step 4 — Specificity (the tools do NOT do this)" |
| 3 | 引物设计规则 | :59 | :52 | "## Step 3 — Primer design rules (what \"good\" looks like)" |
| 资源 | `scripts/primer_qc.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 75. tooluniverse-protein-lof-mechanism
`plugin-tooluniverse-protein-lof-mechanism` · 偏移 −7 · shared body 一致 · resources 0 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | SAE 特征破坏是独有信号 | :145 | :138 | "## Step 4: SAE feature disruption (the unique signal)" |
| 2 | pLDDT 过低时信号不可靠 | :124 | :117 | "- **pLDDT < 50** → disordered; SAE / stability signals may not be reliable" |
| 3 | SAE 标签是推断而非人工审校 | :256 | :249 | "3. **SAE labels are inferred, not curated.**" |

判定：preserved。

### 76. tooluniverse-protein-modification-analysis
`plugin-tooluniverse-protein-modification-analysis` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 20（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | iPTMnet 是 SOAP 风格，须传 `operation` | :40 | :35 | "2. **iPTMnet is SOAP-style** -- every call requires `operation` parameter" |
| 2 | PTM 作用具上下文依赖性 | :36 | :31 | "PTMs are context-dependent: same phosphorylation site can activate or inhibit depending on kinase and effectors." |
| 3 | 消歧阶段 | :64 | :59 | "## Phase 0: Disambiguation" |

判定：preserved。

### 77. tooluniverse-protein-sae-variant-interpretation
`plugin-tooluniverse-protein-sae-variant-interpretation` · 偏移 −8 · shared body 一致 · resources 0 · profile OK · tool-ref 2（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 五步工作流契约 | :71 | :63 | "## Workflow (5 steps)" |
| 2 | 校验参考残基并构建突变序列 | :92 | :84 | "## Step 3: Validate the reference residue + build mutant sequen..." |
| 3 | 解释表 | :189 | :181 | "## Interpretation table" |

判定：preserved。

### 78. tooluniverse-protein-structural-annotation-pdb
`plugin-tooluniverse-protein-structural-annotation-pdb` · 偏移 −7 · shared body 一致 · resources 0 · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 连接前必须核对编号 | :106 | :99 | "## Step 3: Verify the numbering before joining" |
| 2 | 以标志残基复核 | :110 | :103 | "relative to the panel sequence. Always verify with a landmark:" |
| 3 | 不得静默重定基准 | :120 | :113 | "**Do not silently rebase" |

判定：preserved。

### 79. tooluniverse-protein-structure-retrieval
`plugin-tooluniverse-protein-structure-retrieval` · 偏移 −6 · shared body 一致 · resources 2 · profile OK · tool-ref 10（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 不得臆断 PDB ID/分辨率/可得性 | :27 | :21 | "**LOOK UP DON'T GUESS**: Never assume PDB IDs, resolution, or availability. Always query RCSB/PDBe and AlphaFold" |
| 2 | 结构质量分级 | :31 | :25 | "Not all structures are equal. X-ray <2 A is high-quality for drug design." |
| 3 | AlphaFold pLDDT 置信度 | :130 | :124 | "## AlphaFold Confidence (pLDDT)" |
| 资源 | `CHECKLIST.md`、`examples.md` | — | knowledge_refs | 2 项一致 |

判定：preserved。

### 80. tooluniverse-protein-therapeutic-design
`plugin-tooluniverse-protein-therapeutic-design` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 4（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 结构优先（先生成骨架再定序列） | :24 | :19 | "1. **Structure-first** - Generate backbone geometry before sequence" |
| 2 | 报告先行（强制） | :79 | :74 | "### Report-First Approach (MANDATORY)" |
| 3 | NVIDIA NIM 使用要求 | :108 | :103 | "## NVIDIA NIM Requirements" |
| 资源 | `CHECKLIST.md`、`DESIGN_PROCEDURES.md`、`EXAMPLES.md`、`TOOLS_REFERENCE.md`、`design_templates.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 81. tooluniverse-proteomics-analysis
`plugin-tooluniverse-proteomics-analysis` · 偏移 −5 · shared body 一致 · resources 3 · profile OK · tool-ref 1（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 生物学重复最少 3 例 | :100 | :95 | "- **Replicates**: n < 3 = unreliable fold changes ... Minimum n = 3 biological replicates" |
| 2 | FDR 校正强制，禁止只报未校正 p 值 | :101 | :96 | "- **FDR cutoff**: Benjamini-Hochberg correction mandatory. FDR < 0.05 standard ... Never report unadjusted p-values alone" |
| 3 | 单一肽段鉴定不作为差异蛋白 | :85 | :80 | "- Filter to proteins with 2+ unique peptides (single-peptide IDs are not reported as DE)" |
| 资源 | `CODE_REFERENCE.md`、`PHASE_DETAILS.md`、`REPORT_TEMPLATE.md` | — | knowledge_refs | 3 项一致 |

判定：preserved。

### 82. tooluniverse-proteomics-data-retrieval
`plugin-tooluniverse-proteomics-data-retrieval` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 0

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | ProteomeXchange 为聚合入口 | :48 | :43 | "1. **ProteomeXchange is the aggregator** -- it indexes datasets from PRIDE, MassIVE, PeptideAtlas, jPOST, and iProX"（KEY PRINCIPLES 块） |
| 2 | 物种使用 NCBI 分类 ID | :48 | :43 | "4. **Species uses NCBI taxonomy IDs** -- human = 9606, mouse = 10090, rat = 10116"（KEY PRINCIPLES 块） |
| 3 | 仓库选择决策逻辑 | :96 | :91 | "## Decision Logic" |

判定：preserved；无 tool-ref 影响。

### 83. tooluniverse-residue-functional-mechanism-interpretation
`plugin-tooluniverse-residue-functional-mechanism-interpretation` · 偏移 −9 · shared body 一致 · resources 1（`references/upstream-details.md`，阶段下移） · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 用户指名位点时强制前提检查 | :98 | :89 | "### Step 0 (MANDATORY if user names specific positions): Premise check" |
| 2 | 从 DMS 矩阵检测热点 | :137 | :128 | "### Step 1 (Path B only): Detect hotspots from the DMS matrix" |
| 3 | 报告步骤 | :339 | :330 | "### Step 6: Report" |
| 资源 | `references/upstream-details.md`（承接 raw 正文尾部阶段，内容无丢失） | — | knowledge_refs | 1 项一致 |

判定：preserved（尾部阶段下移到 knowledge ref，内容完整）。

### 84. tooluniverse-rnaseq-deseq2
`plugin-tooluniverse-rnaseq-deseq2` · 偏移 −8 · shared body 一致 · resources 20（含 `references/upstream-details.md`，阶段下移） · profile OK · tool-ref 8（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 优先使用内置主脚本，再考虑自写代码 | :25 | :17 | "## PRIMARY SCRIPTS — use these FIRST before writing custom code" |
| 2 | 写代码前的强制事项 | :204 | :196 | "## CRITICAL — Read before writing any code" |
| 3 | 工作区隔离强制 | :245 | :237 | "## Workspace isolation (CRITICAL)" |
| 资源 | `references/` 11 文件 + `scripts/` 9 文件（含 `r_deseq2_wrapper.py`、`r_edger_limma_wrapper.py` 等） | — | knowledge_refs | 20 项一致 |

判定：preserved（`references/upstream-details.md` 承接 raw 尾部阶段，内容完整）。

### 85. tooluniverse-sequence-retrieval
`plugin-tooluniverse-sequence-retrieval` · 偏移 −5 · shared body 一致 · resources 2 · profile OK · tool-ref 25（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 不得臆断登录号或序列版本 | :26 | :21 | "**LOOK UP DON'T GUESS**: Never assume accession numbers or sequence versions. Always retrieve and verify from NCBI or EN..." |
| 2 | ENA 工具不接受 RefSeq 登录号 | :57 | :52 | "**CRITICAL**: Never try ENA tools with RefSeq accessions -- they return 404." |
| 3 | 登录号类型判定树 | :49 | :44 | "## Accession Type Decision Tree" |
| 资源 | `CHECKLIST.md`、`examples.md` | — | knowledge_refs | 2 项一致 |

判定：preserved。

### 86. tooluniverse-single-cell
`plugin-tooluniverse-single-cell` · 偏移 −9 · shared body 一致 · resources 13 · profile OK · tool-ref 22（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先查已有结果 | :26 | :17 | "## RULE ZERO — Check for pre-computed results FIRST" |
| 2 | QC 门控必在下游分析之前 | :150 | :141 | "## Quality Control and QC Gating (do this BEFORE downstream ana...)" |
| 3 | 阈值须分布感知（MAD）而非硬编码 | :191 | :182 | "## Choosing thresholds — distribution-aware (MAD), not hardcode..." |
| 资源 | `analysis_patterns.md`、`references/` 9 文件、`scripts/` 4 文件 | — | knowledge_refs | 13 项一致 |

判定：preserved。

### 87. tooluniverse-small-molecule-discovery
`plugin-tooluniverse-small-molecule-discovery` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 46（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先解析身份再研究 | :38 | :33 | "1. **Resolve identity first** - Always get CID and ChEMBL ID before research" |
| 2 | ChEMBL ID 必须用完整格式 | :362 | :357 | "- **ChEMBL IDs**: Always use full format `\"CHEMBL941\"`, never just `\"941\"`" |
| 3 | 商业可得性阶段 | :232 | :227 | "## Phase 6: Commercial Availability" |

判定：preserved。

### 88. tooluniverse-spatial-omics-analysis
`plugin-tooluniverse-spatial-omics-analysis` · 偏移 −7 · shared body 一致 · resources 4 · profile OK · tool-ref 33（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 逐空间域独立表征再比较 | :26 | :19 | "2. **Domain-by-domain analysis** - Characterize each spatial region independently before comparison"（KEY PRINCIPLES 块） |
| 2 | 空间多组学整合评分 0-100 | :79 | :72 | "## Spatial Omics Integration Score (0-100)" |
| 3 | 报告文件名契约 | :159 | :152 | "Create file: `{tissue}_{disease}_spatial_omics_report.md`" |
| 资源 | `phase-procedures.md`、`reference-data.md`、`report-template.md`、`tool-reference.md` | — | knowledge_refs | 4 项一致 |

判定：preserved。

### 89. tooluniverse-stem-cell-organoid
`plugin-tooluniverse-stem-cell-organoid` · 偏移 −5 · shared body 一致 · resources 0 · profile OK · tool-ref 13（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 标志物定义干细胞身份 | :30 | :25 | "1. **Marker-based identity** — stem cell identity is defined by marker expression profiles (OCT4, SOX2, NANOG" |
| 2 | 类器官不等于器官 | :30 | :25 | "3. **Organoid ≠ organ** — organoids recapitulate some but not all organ features"（KEY PRINCIPLES 块） |
| 3 | 标志物不得臆断 | :28 | :23 | "**LOOK UP DON'T GUESS**: Do not assume which markers define a target cell type" |

判定：preserved。

### 90. tooluniverse-structural-variant-analysis
`plugin-tooluniverse-structural-variant-analysis` · 偏移 −7 · shared body 一致 · resources 4 · profile OK · tool-ref 19（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | ACMG 式 SV 分类 | :31 | :24 | "2. **ACMG-style classification** - Pathogenic/Likely Pathogenic/VUS/Likely Benign/Benign"（KEY PRINCIPLES 块） |
| 2 | ClinGen HI/TS 剂量敏感性评分判读 | :161 | :154 | "ClinGen HI/TS score 3 = definitive; score 2 = likely; score 1 = little evide..." |
| 3 | 输出用模板文件 | :216 | :209 | "Create report using the template in `REPORT_TEMPLATE.md`." |
| 资源 | `ANALYSIS_PROCEDURES.md`、`CLASSIFICATION_GUIDE.md`、`EXAMPLES.md`、`REPORT_TEMPLATE.md` | — | knowledge_refs | 4 项一致 |

判定：preserved。

### 91. tooluniverse-systems-biology
`plugin-tooluniverse-systems-biology` · 偏移 −5 · shared body 一致 · resources 5 · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 富集与因果的区分 | :46 | :41 | "## Domain Reasoning: Enrichment vs Causation" |
| 2 | 通路归属不得臆断 | :50 | :45 | "LOOK UP DON'T GUESS: pathway membership, gene-to-pathway assignments, and enrichment statistics." |
| 3 | 渐进式报告产出 | :174 | :169 | "Create a markdown report progressively: header → Phase 1 enrichment results → Phase 2 protein mapping" |
| 资源 | `python_implementation.py`、`test1_genelist.md`、`test2_protein.md`、`test3_keyword.md`、`test4_combined.md` | — | knowledge_refs | 5 项一致 |

判定：preserved。

### 92. tooluniverse-toxicology
`plugin-tooluniverse-toxicology` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 15（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | AOP 优先思考（MIE→KE→AO） | :62 | :56 | "1. **AOP-first thinking** - Frame all toxicity in terms of MIE → Key Events → Adverse Outcome"（KEY PRINCIPLES 块） |
| 2 | 机制与信号须区分 | :62 | :56 | "4. **Distinguish mechanism from signal** - AOPWiki = mechanism; FAERS = real-world signal"（KEY PRINCIPLES 块） |
| 3 | 风险分层输出 | :255 | :249 | "Risk tier: CRITICAL / HIGH / MEDIUM / LOW / INSUFFICIENT DATA" |

判定：preserved。

### 93. tooluniverse-vaccine-design
`plugin-tooluniverse-vaccine-design` · 偏移 −7 · shared body 一致 · resources 1 · profile OK · tool-ref 5（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 表位驱动设计 | :32 | :25 | "1. **Epitope-driven** — vaccines work by presenting epitopes to T/B cells; start with epitope prediction"（KEY PRINCIPLES 块） |
| 2 | HLA 多样性下的群体覆盖 | :32 | :25 | "2. **Population coverage matters** — HLA diversity means no single epitope covers everyone; design for breadth"（KEY PRINCIPLES 块） |
| 3 | MHC 结合不得凭记忆预测 | :30 | :23 | "**LOOK UP DON'T GUESS**: Do not predict MHC binding or population coverage from memory" |
| 资源 | `scripts/population_coverage.py` | — | knowledge_refs | 1 项一致 |

判定：preserved。

### 94. tooluniverse-variant-analysis
`plugin-tooluniverse-variant-analysis` · 偏移 −5 · shared body 一致 · resources 13（含 `references/upstream-details.md`，阶段下移） · profile OK · tool-ref 15（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 先查已有结果 | :22 | :17 | "## RULE ZERO — Check for pre-computed results FIRST" |
| 2 | 工作区隔离强制 | :49 | :44 | "## Workspace isolation (CRITICAL)" |
| 3 | 倍性须匹配问题的流程而非物种 | :124 | :119 | "## Ploidy: match the question's pipeline, not the organism" |
| 资源 | `QUICK_START.md`、`python_implementation.py`、`references/` 5 文件（含 `upstream-details.md`）、`scripts/` 6 文件 | — | knowledge_refs | 13 项一致 |

判定：preserved（`references/upstream-details.md` 承接 raw 尾部阶段，内容完整）。

### 95. tooluniverse-variant-functional-annotation
`plugin-tooluniverse-variant-functional-annotation` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 3（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | ProtVar 优先的蛋白级注解 | :70 | :64 | "1. **ProtVar-first** — ProtVar provides the richest protein-level context; always start here" |
| 2 | 群体频率必须强制报告 | :74 | :68 | "3. **Population frequency mandatory** — Always report gnomAD AF and note ancestry-specific values" |
| 3 | gnomAD variant_id 格式 | :152 | :146 | "`gnomad_get_variant` takes `variant_id` in the format `chrom-pos-ref-alt` (hg38, no \"chr\" prefix)." |

判定：preserved。

### 96. tooluniverse-variant-predictor-dms-validation
`plugin-tooluniverse-variant-predictor-dms-validation` · 偏移 −7 · shared body 一致 · resources 0 · profile OK · tool-ref 1（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 以 DMS 效应矩阵为基准 | :76 | :69 | "Step 1: Retrieve DMS as an effect matrix" |
| 2 | MWU 前的强制 NaN 体检门 | :277 | :270 | "### Step 3.5 (MANDATORY): Pre-MWU sanity gate — catch silent NaN failures" |
| 3 | 稳健性扫描 | :365 | :358 | "Step 5: Robustness sweep" |

判定：preserved。

### 97. tooluniverse-variant-to-mechanism
`plugin-tooluniverse-variant-to-mechanism` · 偏移 −6 · shared body 一致 · resources 0 · profile OK · tool-ref 9（间接）

| # | 业务义务（必须保留） | vendor 行 | ext 行 | 原文片段（保留） |
| --- | --- | ---: | ---: | --- |
| 1 | 邻近性不可靠（因果基因可能隔 2-3 个基因） | :222 | :216 | "- **Proximity alone is unreliable.** Many GWAS loci have the causal gene 2-3 genes away from the lead SNP." |
| 2 | eQTL 与 L2G 冲突时并列两种机制 | :302 | :296 | "**Always consider alternative mechanisms.** If eQTL points to Gene A but L2G favors Gene B, present both models." |
| 3 | 变异表征阶段 | :77 | :71 | "## Phase 1: Variant Characterization" |

判定：preserved。

## 结论

declared-fit-with-notes

- 97/97 retained 能力通过 shared-body 一致性、reviewed 资源逐字节一致、`knowledge_refs` `content_hash` 绑定、`provenance` 完整性与 graph profile 结构检查；每个 raw Skill 的 2–3 项业务义务均以 vendor 原文片段与对应 extension 行保留，无 `removed` 或无证据 `gap`。
- notes 1：3 个能力的 raw 正文尾部阶段按既有 progressive-disclosure 规则下移到 `references/upstream-details.md`（`residue-functional-mechanism-interpretation`、`rnaseq-deseq2`、`variant-analysis`）。内容核验为完整，仅拼接缝 1 个空行差异；三者知识 ref 生效。
- notes 2：`tooluniverse-epigenomics-chromatin` 正文保留，但存在待决的间接退役缺口（EBI eQTL 接口被目标默认配置停用）。该缺口与 `upstream-delta.json` 的 `semantic_review.indirect_reviews` `gap` 一致，属主线程受审适配范围；本文件不改动。
- notes 3：83/97 个能力在 `production_reference_impacts` 中有被引用工具的 `parameter-schema-changed` 计数（共 1370 条）；raw 与资源字节未变，但是否发生语义漂移由直接变化集合与间接适配统一决定。FAERS、Reactome、EBI eQTL 等被引用工具的受影响能力会进入实际 changed subset，由 `05-semantic-review.md` 记录；本文件仅登记信号。
- 源状态确认：`vendor/tooluniverse` 在工作树干净状态下位于 `v1.5.4` / `8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06`；97 个 raw Skill 相对既有生成基线未变，保留字节符合预期。
