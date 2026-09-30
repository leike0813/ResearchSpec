# ToolUniverse v1.5.4 实际吸纳语义审阅

审阅启动：2026-09-30；验证收尾：2026-10-01。目标：`v1.5.4`，commit `8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06`，tree `c5e125db35e4667f5597871f964aae90eadc531f`。基线：`v1.3.1` / `9b7ff91ddb45b567cac2fa8ea31b82851e877617`。

这份记录审阅实际生成后的 vendor bundle 与 extension packages。上游预审独立保存在 [upstream-semantic-review.md](artifacts/upstream-semantic-review.md)，其中 `not-fit` 指生成前仍有适配缺口，不是本轮最终结论。全量上游库存、路径 diff、工具声明与实现差异以及引用证据见 [upstream-delta.json](artifacts/upstream-delta.json)；实际包树、承载位置和逐条判定见 [absorption-review.json](artifacts/absorption-review.json)。

## 范围与准入

| 项目 | 本轮结果 |
|---|---|
| 上游 Skill 库存 | 185，全量分类，无遗漏 |
| 生产准入 | 130，保持原准入集合 |
| 排除 | 55：原 20 项 + 新增 32 项平台/部署维护 + 3 项业务候选暂缓 |
| 直接变化 | 33 个能力，97 条语义义务逐项定位 |
| 间接适配 | 15 个能力，工具契约变化虽未修改其上游源文件，仍需转换适配 |
| 实际改变的 package trees | 48 |
| 保持原字节的 package trees | 82，逐包 SHA-256 与原锚点一致 |
| graph profiles | 130，全数保持原字节 |
| 执行类型 | mixed 42，llm 88 |
| 知识资源 | 348：103 py、243 md、2 txt，全部与 reviewed vendor bundle 逐字节相同 |
| 领域 | 28 ANZSRC Group + 2 tool domains，成员保持原集合 |
| 引用边 | 226：required 8、related 139、routing 79；证据路径、行号和原文全部复核 |

新增 `biomedical-fact-lookup`、`gene-liability`、`nih-funding-landscape` 仅作为业务候选记录；它们的内容、资源、依赖、重叠及领域尚未通过完整生产准入，本轮不发布。

每项 Skill 的 `source_release / source_revision` 是内容来源身份。直接变化或本轮间接适配使用目标身份；无影响项保留旧身份，避免仅因版本标记改变整个生成树。185 项中，98 项保留 v1.3.1 身份，87 项使用 v1.5.4 身份（48 项准入变化、4 项原排除变化、35 项新增排除）。这不代表 checkout 同时使用两个版本；转换输入只有新 pin。

## 审阅方法与保留集

对全部 130 个能力检查 generated vendor body 到 extension body 的完整保留关系、知识资源字节与 hash、六个通用 evidence fields、validator 声明、registry 和 domain/profile 投影。机器匹配用于定位；语义判定依据源程序、对应工具声明及实现、实际生成正文和资源，不以 hash 相等代替内容审阅。

33 个直接变化能力逐条审阅如下。原上游正文未变的 97 个能力，每项 2–3 个业务义务已记录于 [retained-semantic-review.md](artifacts/retained-semantic-review.md)。该文件属于生成前的保留性复核：最终 82 个无变化包通过原锚点 tree hash 证明义务承载仍在原位；另外 15 个经间接适配的包在后文以生成后的原文与行号补充复核。130 个 extension body 均完整保留其 reviewed vendor body；348 个知识资源均完整复制。

`residue-functional-mechanism-interpretation`、`rnaseq-deseq2`、`variant-analysis` 保持原有 progressive disclosure：尾部内容在 `references/upstream-details.md`，不会因主 Skill 的长度阈值丢失程序。未发布的上游测试只提供静态证据，不作为 executable knowledge。


## 实际生成物：33 项直接变化的承载复核

每条义务先按不可变源与工具实现审阅，再定位本轮生成包。退休接口为 removed；授权、参数或解析适配为 adapted；其余语义正文为 preserved。未发布的上游测试仅用于静态说明，不能成为知识资源。

### plugin-tooluniverse-admet-prediction

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| runtime dependency: ADMETAI local model needs the 'ml' extra | preserved | [SKILL.md:42](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-admet-prediction/SKILL.md)：**Hard constraint:** ResearchSpec never installs dependencies or probes the environment. Do not run `uv pip install 'tooluniverse[ml]'` or `tooluniverse-doctor` on the user's behalf; report a missing  |
| fail-soft path when the extra is absent | adapted | [SKILL.md:40](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-admet-prediction/SKILL.md)：ADMETAI tools run a local model, so they need the `ml` extra installed in the environment the target Agent is already authorized to use. |
| evidence/error-classification boundary: library warnings are not failures | preserved | [SKILL.md:47](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-admet-prediction/SKILL.md)：**Expected console noise — not errors.** The first ADMETAI call loads PyTorch |

### plugin-tooluniverse-adverse-event-detection

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| output contract: FAERS detailed-report tools return a paged object, not a list | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-event-detection/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specif |
| page is not the answer: read total_available, not count/len | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-event-detection/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specif |
| parameter change: FAERS_search_serious_reports_by_drug gains `serious` | preserved | [TOOL_REFERENCE.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-event-detection/TOOL_REFERENCE.md)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `serious`, `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdisabling`, `limit` \ |
| name-resolution scope widened for the drug arm | preserved | [TOOL_REFERENCE.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-event-detection/TOOL_REFERENCE.md)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `serious`, `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdisabling`, `limit` \ |

### plugin-tooluniverse-antibody-engineering

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| step now specifies tools and required taxid | preserved | [SKILL.md:263](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-antibody-engineering/SKILL.md)：1. Assess codon optimization for CHO, identify rare codons -- `CodonUsage_get_optimal_codons(taxid=<Cricetulus griseus NCBI taxid>)` gives the CHO-preferred codon per amino acid to compare against; re |
| evidence boundary: species-correct reference table | preserved | [SKILL.md:263](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-antibody-engineering/SKILL.md)：1. Assess codon optimization for CHO, identify rare codons -- `CodonUsage_get_optimal_codons(taxid=<Cricetulus griseus NCBI taxid>)` gives the CHO-preferred codon per amino acid to compare against; re |

### plugin-tooluniverse-binder-discovery

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency: MolGlueDB for glue-degrader neosubstrates | preserved | [SKILL.md:41](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-binder-discovery/SKILL.md)：- **Protein-protein interfaces**: flat, large contact surface. Small molecules rarely compete effectively unless there is a "hot spot" cavity. Check whether any allosteric pockets exist before committ |
| IDR branch redirect narrowed | preserved | [SKILL.md:42](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-binder-discovery/SKILL.md)：- **Intrinsically disordered regions**: essentially no direct small molecule approach. Redirect to peptide strategies, or check `MolGlueDB_search_compounds` in case the target is a documented molecula |
| bioactivity priority order gains item 6 | preserved | [SKILL.md:153](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-binder-discovery/SKILL.md)：6. `MolGlueDB_search_compounds` - molecular glue degraders specifically (small molecules that induce a novel protein-protein interaction rather than occupy a conventional pocket); check this when the  |

### plugin-tooluniverse-cell-line-profiling

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| tool table: CLUE_get_cell_lines dropped | removed | [SKILL.md:3](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-cell-line-profiling/SKILL.md)：description: "Cancer cell-line selection and profiling for experimental model choice. Cross-references DepMap, Cellosaurus, COSMIC, PharmacoDB to deliver identity verification, mutation/CNV profile, g |
| workflow step 4C CLUE removed | removed | [SKILL.md:3](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-cell-line-profiling/SKILL.md)：description: "Cancer cell-line selection and profiling for experimental model choice. Cross-references DepMap, Cellosaurus, COSMIC, PharmacoDB to deliver identity verification, mutation/CNV profile, g |
| troubleshooting row for missing CLUE_API_KEY removed | removed | [SKILL.md:3](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-cell-line-profiling/SKILL.md)：description: "Cancer cell-line selection and profiling for experimental model choice. Cross-references DepMap, Cellosaurus, COSMIC, PharmacoDB to deliver identity verification, mutation/CNV profile, g |
| target correction confirmed; stale baseline artifacts enumerated | removed | [SKILL.md:3](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-cell-line-profiling/SKILL.md)：description: "Cancer cell-line selection and profiling for experimental model choice. Cross-references DepMap, Cellosaurus, COSMIC, PharmacoDB to deliver identity verification, mutation/CNV profile, g |

### plugin-tooluniverse-comparative-genomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new pre-check tool for non-model organisms | preserved | [SKILL.md:104](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-comparative-genomics/SKILL.md)：For a species outside Ensembl's well-annotated set (most non-model organisms), check `GoaT_get_species(taxon=...)` first to confirm a reference genome assembly actually exists (and its status: draft/c |
| evidence boundary: assembly status qualifies what a lookup can claim | preserved | [SKILL.md:104](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-comparative-genomics/SKILL.md)：For a species outside Ensembl's well-annotated set (most non-model organisms), check `GoaT_get_species(taxon=...)` first to confirm a reference genome assembly actually exists (and its status: draft/c |

### plugin-tooluniverse-dataset-discovery

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| LMIC health-survey source added (DHS Program) | preserved | [SKILL.md:53](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-dataset-discovery/SKILL.md)：- Health surveys: CDC, NHANES (US; search by variable name, not topic keywords); DHS Program (`DHSProgram_search_indicators`/`_get_data`) for the international/LMIC equivalent -- fertility, maternal/c |
| open genomics archives extended (DDBJ, GSA) | preserved | [SKILL.md:54](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-dataset-discovery/SKILL.md)：- Genomics (open): SRA, ENA, ArrayExpress, GEO, and DDBJ (`DDBJ_search_entries`/`_get_entry`/`_get_cross_references`) -- the third INSDC archive alongside SRA/ENA, plus GEA/MetaboBank entries; also GS |
| controlled-access human genomics with permission boundary | preserved | [SKILL.md:55](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-dataset-discovery/SKILL.md)：- Genomics (controlled-access, human studies): dbGaP (`DbGaP_search_studies`/`_get_study`) and EGA (`EGA_get_study`/`_get_dataset`/`_get_study_datasets`) -- both require a separate data-access request |

### plugin-tooluniverse-drug-regulatory

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency and routing for biologics/biosimilars | preserved | [SKILL.md:139](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-regulatory/SKILL.md)：**Orange Book covers small-molecule drugs; biologics and biosimilars (e.g. "is there a biosimilar of adalimumab") are a different FDA list entirely** — use `FDAPurpleBook_search_products` for those in |
| existing Orange Book procedure retained | preserved | [SKILL.md:141](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-regulatory/SKILL.md)：**FDA_OrangeBook_search_drug**: `brand_name` (string), `generic_name` (string), `application_number` (string), `limit` (int, default 10). |

### plugin-tooluniverse-drug-research

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| output semantics: unique_PTs_returned is not a total | preserved | [TOOLS_REFERENCE.md:270](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-research/TOOLS_REFERENCE.md)：\| `FAERS_rollup_meddra_hierarchy` \| Aggregate by Preferred Term level \| Most-reported PTs with counts (up to 999). `unique_PTs_returned` is a row count, NOT a total — openFDA reports no total; chec |
| 报告中的事实须有逐项来源 | preserved | [SKILL.md:28](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-research/SKILL.md)：3. **Citation requirements** - Every fact must have inline source attribution |

### plugin-tooluniverse-ecology-biodiversity

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency: BOLD barcoding | preserved | [SKILL.md:76](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-ecology-biodiversity/SKILL.md)：\| `BOLDSystems_search_by_taxon` / `_search_by_bin` / `_get_record` \| DNA barcode-based species identification (COI barcoding); BIN clusters group specimens by barcode similarity, useful for cryptic- |
| 物种分类须查询数据库而非凭记忆 | preserved | [SKILL.md:21](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-ecology-biodiversity/SKILL.md)：1. **LOOK UP DON'T GUESS** — Use `GBIF_search_species` to get taxonomy, `WoRMS_search_species` for marine organisms |

### plugin-tooluniverse-epidemiological-analysis

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency and population-scope rule | preserved | [SKILL.md:113](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epidemiological-analysis/SKILL.md)：**International/LMIC population health**: for a PECO question outside the US, `DHSProgram_search_indicators`/`DHSProgram_get_data` covers the same kind of national survey indicators (fertility, matern |
| DHSProgram_search_indicators vs _get_data split | preserved | [SKILL.md:113](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epidemiological-analysis/SKILL.md)：**International/LMIC population health**: for a PECO question outside the US, `DHSProgram_search_indicators`/`DHSProgram_get_data` covers the same kind of national survey indicators (fertility, matern |

### plugin-tooluniverse-epigenomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency: EWASCatalog lookup | preserved | [SKILL.md:162](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics/SKILL.md)：**EWAS Catalog** (published epigenome-wide association study results, not raw methylation data): `EWASCatalog_search_by_cpg` (`cpg_id`, e.g. `"cg00000029"`) or `EWASCatalog_search_by_gene` (`gene_symb |
| scope boundary: published associations vs data processing | preserved | [SKILL.md:162](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics/SKILL.md)：**EWAS Catalog** (published epigenome-wide association study results, not raw methylation data): `EWASCatalog_search_by_cpg` (`cpg_id`, e.g. `"cg00000029"`) or `EWASCatalog_search_by_gene` (`gene_symb |

### plugin-tooluniverse-gene-enrichment

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| field rename: entities_ratio to entities_coverage | preserved | [tool_parameters.md:227](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-gene-enrichment/references/tool_parameters.md)：- `entities_coverage`: `entities_found / entities_total` — the coverage figure |
| new field pathway_size_fraction_of_reactome; entities_ratio is now its deprecated alias | preserved | [ora_workflow.md:275](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-gene-enrichment/references/ora_workflow.md)：#    entities_coverage, p_value, fdr, reactions_found, reactions_total, |
| ranking boundary: never rank by pathway size fraction | preserved | [tool_parameters.md:232](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-gene-enrichment/references/tool_parameters.md)：- `pathway_size_fraction_of_reactome`: pathway size divided by Reactome's entity universe for the species. Depends only on the pathway, not on the identifiers you submitted, so never rank by it. Depre |

### plugin-tooluniverse-literature-deep-research

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency: Consensus_search_papers (triage only) | preserved | [SKILL.md:146](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-literature-deep-research/SKILL.md)：\| Broad / hard-to-find / OA \| `Crossref_search_works`, `CORE_search_papers`, `DOAJ_search_articles`, `Fatcat_search_scholar`, `Consensus_search_papers` \| DOI registry + OA aggregators + Internet Ar |
| opt-in external service: Noodle MCP requires NOODLE_MCP_URL | preserved | [SKILL.md:129](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-literature-deep-research/SKILL.md)：**Step 2: Citation expansion**: `PubMed_get_cited_by`, `EuropePMC_get_citations/references`, `PubMed_get_related`, `SemanticScholar_get_recommendations`, `OpenCitations_get_citations`. If the opt-in N |
| last-resort external web search with grade boundary | preserved | [SKILL.md:165](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-literature-deep-research/SKILL.md)：Last resort when every structured index above is empty (a brand-new preprint, a dataset page, a project site with no DOI): the opt-in `exa_*` tools (general neural web search, no key needed for casual |
| tool inventory reference updated | preserved | [SKILL.md:207](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-literature-deep-research/SKILL.md)：- `TOOL_NAMES_REFERENCE.md` -- 130+ tools with parameters |

### plugin-tooluniverse-molecular-cloning

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| scope change: forward design plus reverse analysis | adapted | [SKILL.md:3](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-molecular-cloning/SKILL.md)：description: "Design Gibson and Golden Gate assemblies, simulate existing digestion and ligation reactions, and check restriction sites, overhang compatibility, domestication, sequence outcomes, and e |
| new tool: DNA_golden_gate_assemble; do not hand-write a simulator | preserved | [SKILL.md:74](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-molecular-cloning/SKILL.md)：## Working backwards — what does an existing assembly produce? |
| new tool dependency: REBASE for enzyme sites/isoschizomers | preserved | [SKILL.md:57](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-molecular-cloning/SKILL.md)：- **Domestication is mandatory.** The chosen enzyme's site (BsaI `GGTCTC`, BbsI `GAAGAC`) must NOT occur **inside** any part, or it will be cut internally. Remove internal sites by silent mutation bef |
| limitations rewritten: reaction now simulated, efficiency not modelled | preserved | [SKILL.md:109](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-molecular-cloning/SKILL.md)：- Digestion and overhang-driven ligation are simulated faithfully (`DNA_virtual_digest` |

### plugin-tooluniverse-multiomic-disease-characterization

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| response example: entities_ratio to entities_coverage plus size fraction | preserved | [response-formats.md:76](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-multiomic-disease-characterization/response-formats.md)：        "entities_coverage": 0.0638, |
| tool-reference schema and ranking note | preserved | [tool-reference.md:221](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-multiomic-disease-characterization/tool-reference.md)：- **NOTE**: rank by `fdr`/`p_value`. `entities_coverage` = found/total. `pathway_size_fraction_of_reactome` (deprecated alias `entities_ratio`) is pathway size over Reactome's entity universe and is i |

### plugin-tooluniverse-neuroscience

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| new tool dependency: DANDI neurophysiology data | preserved | [SKILL.md:165](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-neuroscience/SKILL.md)：\| `DANDI_search_datasets`/`DANDI_get_dataset`/`DANDI_list_assets` \| Published neurophysiology data (NWB format): spikes, LFP, imaging, behavior \| `query`; `dandiset_id` \| |
| existing C. elegans route preserved | preserved | [SKILL.md:189](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-neuroscience/SKILL.md)：For C. elegans neural circuit questions, ALWAYS use `WormBase_get_gene` to look up specific synapse and connectivity data. Do not guess neural connections from general knowledge. |

### plugin-tooluniverse-phylogenetics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Metric-to-alignment pairing for RCV-based metrics | preserved | [SKILL.md:230](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-phylogenetics/SKILL.md)：\| **`treeness_over_rcv` / `rcv`** \| **`.faa.mafft` (untrimmed)** \| |
| Never loop PhyKIT per file; use phykit_batch_analysis | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-phylogenetics/SKILL.md)：- `saturation` — the returned value is PhyKIT's second printed column (`1 - slope`); the first column is the slope. Do not report the slope as saturation. |
| PhyKIT multi-column output; state which column was read | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-phylogenetics/SKILL.md)：- `saturation` — the returned value is PhyKIT's second printed column (`1 - slope`); the first column is the slope. Do not report the slope as saturation. |
| Batch function set and treeness_over_rcv alias | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-phylogenetics/SKILL.md)：- `saturation` — the returned value is PhyKIT's second printed column (`1 - slope`); the first column is the slope. Do not report the slope as saturation. |
| Gap percentage means gapped alignment columns, not gapped residues | preserved | [SKILL.md:257](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-phylogenetics/SKILL.md)：**Gap percentage** in these questions means the fraction of alignment |

### plugin-tooluniverse-plant-genomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Plant gene expression source added | preserved | [SKILL.md:58](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-plant-genomics/SKILL.md)：\| `BAR_get_gene_info` / `BAR_get_rnaseq_expression` \| Plant gene expression (RNA-seq) — the expression-data source this skill was otherwise missing \| |
| Plant ontology tools added | preserved | [SKILL.md:59](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-plant-genomics/SKILL.md)：\| `Planteome_search_terms` / `Planteome_get_term` / `Planteome_search_annotations` \| Plant ontology (trait, structure, growth-stage terms) and gene-to-term annotations, GO-style but plant-specific \ |
| Existing keyless tool map preserved | preserved | [SKILL.md:60](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-plant-genomics/SKILL.md)：\| `kegg_search_pathway` \| Search KEGG pathways (use plant organism codes: ath, osa, zma) \| |

### plugin-tooluniverse-precision-oncology

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Drug-mechanism tool rename and parameter change | preserved | [TOOLS_REFERENCE.md:318](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-precision-oncology/TOOLS_REFERENCE.md)：\| `ChEMBL_get_drug_mechanisms` \| Drug MOA \| `drug_chembl_id` \| |
| Treatment query order step 3 | preserved | [API_USAGE_PATTERNS.md:345](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-precision-oncology/API_USAGE_PATTERNS.md)：3. `ChEMBL_get_drug_mechanisms` -> Mechanism |
| Neighbouring ChEMBL target-activity contract preserved | preserved | [TOOLS_REFERENCE.md:319](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-precision-oncology/TOOLS_REFERENCE.md)：\| `ChEMBL_get_target_activities` \| Bioactivity data \| `target_chembl_id` \| |

### plugin-tooluniverse-product-safety-surveillance

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Device UDI, classification and PMA tools added | preserved | [SKILL.md:68](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-product-safety-surveillance/SKILL.md)：\| Device \| Premarket Approval (PMA, Class 3 devices) \| `OpenFDADevice_search_pma` \| -- \| |
| Duplicate wrapper families must not both be called | preserved | [SKILL.md:79](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-product-safety-surveillance/SKILL.md)：**Note**: `OpenFDADevice_search_recalls`/`_search_adverse_events`/`_search_510k` return the same underlying openFDA data as `OpenFDA_search_device_recalls`/`_device_adverse_events`/`_device_510k` abov |
| Keyless retrieval boundary preserved | preserved | [SKILL.md:66](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-product-safety-surveillance/SKILL.md)：\| Device \| Unique Device Identifier (UDI) lookup \| `OpenFDADevice_search_udi` \| -- \| |

### plugin-tooluniverse-protein-interactions

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| SASBDB structural-analysis tool inventory collapses from five to two | preserved | [DOMAIN_ANALYSIS.md:180](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md)：2. `SASBDB_get_entry` - Get entry metadata, experimental conditions, publication info, and data file URLs (one call covers structure/scattering data access — there is no separate download tool) |
| SASBDB search entry description | preserved | [DOMAIN_ANALYSIS.md:179](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md)：1. `SASBDB_search_entries` - Find structural data (by molecular type, or list all entries) |
| Surrounding SAXS/SANS section otherwise unchanged | preserved | [DOMAIN_ANALYSIS.md:176](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md)：- **API**: Public REST API |

### plugin-tooluniverse-protein-structure-prediction

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Boltz complex and ligand-binding path with consent and cost boundary | preserved | [SKILL.md:210](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-structure-prediction/SKILL.md)：ESMFold and standard AlphaFold (above) predict single chains only. When the question is specifically about a **complex** -- multi-chain assembly, or protein-ligand binding -- the official Boltz API (` |
| Complex prediction no longer described as unavailable | preserved | [SKILL.md:359](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-structure-prediction/SKILL.md)：- **Single-chain only (ESMFold/AlphaFold)**: both predict monomers; for a multi-chain complex or protein-ligand binding, see the Boltz section above -- paid, not a free default |
| Databases-integrated table gains a paid entry | preserved | [SKILL.md:352](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-structure-prediction/SKILL.md)：\| **Boltz API** (paid, `BOLTZ_API_KEY`) \| Multi-chain complexes, protein-ligand binding \| Async job; estimate cost first (see dedicated section above) \| |
| Free synchronous monomer default preserved | preserved | [SKILL.md:204](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-protein-structure-prediction/SKILL.md)：- If AlphaFold confidence is very high (mean pLDDT > 85): recommend using AlphaFold as primary reference |

### plugin-tooluniverse-rare-disease-diagnosis

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| STRING fallback tool rename | preserved | [TOOLS_REFERENCE.md:751](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md)：\| `intact_search_interactions` \| `STRING_get_interaction_partners` \| Literature search \| |
| Variant-annotation fallback table preserved | preserved | [TOOLS_REFERENCE.md:753](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md)：### Variant Annotation |

### plugin-tooluniverse-rare-disease-genomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Deep intronic variant caveat with cross-skill referral | preserved | [SKILL.md:47](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-rare-disease-genomics/SKILL.md)：   - Synonymous / intronic: usually benign unless at splice junction -- but "usually" is doing real work: a *deep* intronic variant can still be pathogenic by creating a cryptic splice site far from t |
| Orphadata versus Orphanet tool-family choice | preserved | [SKILL.md:111](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-rare-disease-genomics/SKILL.md)：**Note on `Orphadata_*` tools**: a separate, smaller tool family (`Orphadata_get_disorder`/`_search_by_name`/`_get_epidemiology`/`_get_phenotypes`) wraps the same underlying Orphanet data with substan |
| Consequence-prioritization hierarchy preserved | preserved | [SKILL.md:45](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-rare-disease-genomics/SKILL.md)：   - Loss-of-function (frameshift, nonsense, splice-site): strongest candidates |

### plugin-tooluniverse-regulatory-genomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| AlphaGenome Atlas and ISM operations added | preserved | [SKILL.md:88](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-genomics/SKILL.md)：\| `AlphaGenome_predict_interval` / `AlphaGenome_score_variant` / `AlphaGenome_score_ism_variants` \| profile region / score variant / saturation-mutagenesis scan \| RNA-seq, ATAC, CAGE, splice tracks |
| Opt-in remote provider gi_* | preserved | [SKILL.md:93](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-genomics/SKILL.md)：\| `gi_*` (opt-in, `GENOMIC_INTELLIGENCE_MCP_URL`) \| profile (6 tasks) + composite find-genes-then-predict \| promoter, splice sites, enhancer activity, chromatin state, expression, gene annotation \ |
| Selection order prefers the precomputed Atlas read | preserved | [SKILL.md:95](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-genomics/SKILL.md)：**Picking one:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` (or `atlas_scan_interval` for a whole region) first — it's a precomputed database read covering all ~9B |
| Effect-size framing keeps the AVI_SCORE exception | preserved | [SKILL.md:95](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-genomics/SKILL.md)：**Picking one:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` (or `atlas_scan_interval` for a whole region) first — it's a precomputed database read covering all ~9B |

### plugin-tooluniverse-regulatory-variant-analysis

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Evidence model expands to five questions, including a mechanistic one | preserved | [SKILL.md:48](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-variant-analysis/SKILL.md)：When evaluating a non-coding variant, build evidence across five questions. The first four are annotation-based (what's already known to be at this position, in this population); the fifth is model-ba |
| New key-gated phases 0.5 and 4.5 must not block the pipeline | preserved | [SKILL.md:121](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-variant-analysis/SKILL.md)：**Requires `ALPHA_GENOME_API_KEY`.** If it isn't configured, the AlphaGenome tools won't appear in your toolset at all — skip this phase and Phase 4.5 entirely and proceed with Phases 1-4, which are a |
| New impact tier for sequence-model-supported, annotation-silent variants | preserved | [SKILL.md:188](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-variant-analysis/SKILL.md)：- **Sequence-model-supported, annotation-silent**: No GWAS/eQTL/ENCODE/RegulomeDB evidence, but Phase 4.5 shows a high AVI_SCORE and/or a clear multi-track mechanism (e.g., a created transcription-fac |
| Region caps for ISM and Atlas scanning | preserved | [SKILL.md:295](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-variant-analysis/SKILL.md)：- AlphaGenome/AVI_SCORE predictions are model estimates, not experimental measurements — they corroborate annotation evidence or generate a hypothesis worth validating, but a high score alone is not e |
| Cross-skill fallback to other sequence-prediction models | preserved | [SKILL.md:177](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-regulatory-variant-analysis/SKILL.md)：AlphaGenome isn't the only sequence-prediction model in ToolUniverse, just the broadest and the one this phase defaults to. If it's unavailable (no key) or a specific case calls for something else — a |

### plugin-tooluniverse-sequence-analysis

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| New EBI tools for alignment, translation and topology | preserved | [SKILL.md:159](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-sequence-analysis/SKILL.md)：**EBI_pairwise_align**: exactly two sequences (`algorithm='needle'` for global, `'water'` for local), returns percent identity/similarity/gaps and the alignment itself -- no existing tool in this skil |
| Codon-usage script is human-only | preserved | [SKILL.md:272](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-sequence-analysis/SKILL.md)：Use this script for any question about the genetic code, codon degeneracy, amino acid chemistry, codon usage bias, or tRNA wobble pairing. All outputs are JSON. **Its codon-usage frequencies are human |
| Pfam annotation on a sequence without a UniProt accession | preserved | [SKILL.md:155](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-sequence-analysis/SKILL.md)：**Pfam_get_protein_annotations**: `accession` (UniProt ID). Returns Pfam domain hits with exact residue coordinates and E-values. For a raw sequence with no UniProt accession yet (e.g. a novel or desi |

### plugin-tooluniverse-spatial-transcriptomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| H&E-only trigger with a local, key-free model and an evidence limit | preserved | [SKILL.md:26](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-spatial-transcriptomics/SKILL.md)：- User has *only* an H&E histology image and no spatial assay at all -- `DeepSpotM_predict_gene_expression` (local model, no API/key) predicts spatial gene expression for a 224x224 H&E tile directly,  |
| Assay-platform triggers preserved | preserved | [SKILL.md:27](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-spatial-transcriptomics/SKILL.md)：- Questions about tissue architecture or spatial organization |

### plugin-tooluniverse-statistical-modeling

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| FAERS reaction-count tool rename and grouping | preserved | [TOOLS_REFERENCE.md:80](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-statistical-modeling/TOOLS_REFERENCE.md)：\| `FAERS_count_reactions_by_drug_event` \| `medicinalproduct` \| `[{term, count}]` (grouped by MedDRA Preferred Term) \| |
| Disproportionality and stratification tools preserved | preserved | [TOOLS_REFERENCE.md:78](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-statistical-modeling/TOOLS_REFERENCE.md)：\| `FAERS_calculate_disproportionality` \| `drug_name`, `adverse_event` \| `{metrics: {PRR, ROR, IC}, signal_detection}` \| |

### plugin-tooluniverse-structural-proteomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| SKEMPI ddG tools for interface mutations | preserved | [SKILL.md:24](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-structural-proteomics/SKILL.md)：- Protein-protein binding mutations (ddG): `SKEMPI_search_by_structure`/`SKEMPI_search_by_protein`/`SKEMPI_get_mutation` -- BindingDB's protein-protein equivalent, for interface-mutation affinity effe |
| Existing structure and confidence sources preserved | preserved | [SKILL.md:21](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-structural-proteomics/SKILL.md)：- PDB structures/resolutions: `PDBeSIFTS_get_best_structures` and `RCSBGraphQL_get_structure_summary` |

### plugin-tooluniverse-target-research

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Reactome_query_by_ids parameter contract tightened | preserved | [REFERENCE.md:479](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-target-research/REFERENCE.md)：\| `Reactome_query_by_ids` \| `ids` \| ID query (no species/type filtering — filter results on `speciesName`/`schemaClass`) \| |
| Other Reactome endpoints preserved | preserved | [REFERENCE.md:478](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-target-research/REFERENCE.md)：\| `Reactome_list_species` \| - \| All species \| |

### plugin-tooluniverse-variant-interpretation

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| Opt-in Folklore MCP with a patient-data prohibition | preserved | [SKILL.md:79](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-variant-interpretation/SKILL.md)：Tools: `ClinVar_search_variants`, `gnomad_search_variants`, `gnomad_get_variant`, `OMIM_search`, `OMIM_get_entry`, `ClinGen_search_gene_validity`, `ClinGen_search_dosage_sensitivity`, `ClinGen_search_ |
| Atlas precomputed lookup preferred for known SNVs | preserved | [SKILL.md:110](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-variant-interpretation/SKILL.md)：**Which to pick:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` first — it's a precomputed database lookup (much cheaper than a live call) covering all ~9B possible  |
| AVI_SCORE exception to the not-a-probability rule | preserved | [SKILL.md:108](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-variant-interpretation/SKILL.md)：**Reading the score:** most of these return Δ (alt − ref) effect sizes, *not* calibrated pathogenicity probabilities — a large predicted disruption in a tissue-relevant track is mechanistic support (P |
| ClinGen tool renames | preserved | [TOOLS_REFERENCE.md:766](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-variant-interpretation/TOOLS_REFERENCE.md)：\| `ClinGen_dosage_by_gene` \| Dosage sensitivity \| `gene` \| |
| AlphaGenome input contract for both operations | preserved | [TOOLS_REFERENCE.md:629](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-variant-interpretation/TOOLS_REFERENCE.md)：**Inputs**: `AlphaGenome_atlas_lookup_variant`/`AlphaGenome_score_variant` → `chromosome`,`position`,`reference_bases`,`alternate_bases` (Atlas additionally takes `scorers`, default `["AVI_SCORE"]`; s |


## 实际生成物：15 项间接变化的承载复核

下表先核对保留性审阅选出的业务义务，再核对工具契约适配。引用行号以本轮实际生成物为准。全部间接包的 profile 保持原字节。

### plugin-tooluniverse-adverse-outcome-pathway

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| AOP 发现路径（AOPWiki） | preserved | [SKILL.md:68](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-outcome-pathway/SKILL.md)：### Phase 2: AOP Discovery |
| 危害量化路径（PubChemTox） | preserved | [SKILL.md:90](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-outcome-pathway/SKILL.md)：### Phase 3: Hazard Quantification (PubChemTox) |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-outcome-pathway/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-adverse-outcome-pathway/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-clinical-data-integration

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| FAERS 信号需标签/文献佐证才可采信 | preserved | [SKILL.md:27](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-data-integration/SKILL.md)：2. **Signals need context** -- a FAERS signal without label or literature corroboration is hypothesis-generating, not confirmatory |
| 不成比例性不等于因果 | preserved | [SKILL.md:28](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-data-integration/SKILL.md)：3. **Disproportionality is not causation** -- PRR/ROR measure reporting patterns, not causal relationships |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-data-integration/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-data-integration/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-clinical-trial-design

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 报告先行（强制） | preserved | [SKILL.md:42](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-trial-design/SKILL.md)：### 1. Report-First Approach (MANDATORY) |
| 可行性评分 0-100 | preserved | [SKILL.md:58](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-trial-design/SKILL.md)：### 3. Feasibility Score (0-100) |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-trial-design/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-clinical-trial-design/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-data-wrangling

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 工具 vs 代码的取舍判定 | preserved | [SKILL.md:33](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-data-wrangling/SKILL.md)：## Decision: Tool vs Code |
| 跨格式原始数据获取手册 | preserved | [SKILL.md:44](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-data-wrangling/SKILL.md)：## Section A: Format Cookbook |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-data-wrangling/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-data-wrangling/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-disease-research

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 报告先行的核心工作流 | preserved | [SKILL.md:43](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-disease-research/SKILL.md)：## Core Workflow: Report-First Approach |
| 10 个研究维度 | preserved | [SKILL.md:66](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-disease-research/SKILL.md)：## 10 Research Dimensions |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-disease-research/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-disease-research/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-drug-drug-interaction

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| A→B 与 B→A 双向分析 | preserved | [SKILL.md:27](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-drug-interaction/SKILL.md)：2. **Bidirectional analysis** - Always analyze A→B and B→A interactions (effects may differ) |
| 反向方向必须核查 | preserved | [SKILL.md:122](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-drug-interaction/SKILL.md)：4. **Always check the reverse direction.** Analyze B→A as well as A→B. The perpetrator-victim relationship may be asymmetric or bidirectional. |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-drug-interaction/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-drug-interaction/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-drug-repurposing

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 先判定策略再选工具（证据权重不同） | preserved | [SKILL.md:37](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-repurposing/SKILL.md)：Each strategy uses different tools and has different evidentiary weight. Identify which strategy applies FIRST, then choose the corresponding workflow below. Do not run all three strategies blindly — reason about which i |
| 再利用可行性评分 0-100 | preserved | [SKILL.md:139](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-repurposing/SKILL.md)：### Repurposing Viability Score (0-100) |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-repurposing/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-drug-repurposing/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-epigenomics-chromatin

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 组蛋白修饰的推理规则 | preserved | [SKILL.md:44](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics-chromatin/SKILL.md)：## Reasoning: Histone Marks |
| eQTL 解释推理 | preserved | [SKILL.md:61](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics-chromatin/SKILL.md)：## Reasoning: eQTL Interpretation |
| 退休接口替代与覆盖局限 | adapted | [SKILL.md:40](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics-chromatin/SKILL.md)：Use GTEx_get_single_tissue_eqtls or GTEx_query_eqtl to find genes whose expression is associated with variants in the element. Use SCREEN_get_regulatory_elements with element_type="PLS"/"pELS"/"dELS" to classify element-to-promoter relationships. |
| 退休接口替代与覆盖局限 | adapted | [SKILL.md:170](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-epigenomics-chromatin/SKILL.md)：**eQTL evidence:** use the GTEx tools above. Report their tissue and study coverage; when they cannot cover the question, request an independently available, user-authorized source. |

### plugin-tooluniverse-immunology

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 结合亲和力不得估算 | preserved | [SKILL.md:36](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-immunology/SKILL.md)：- **Antibody Kd values**: Never estimate binding affinity; check SAbDab, IEDB, or published literature. |
| 抗体/结构工具域 | preserved | [SKILL.md:63](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-immunology/SKILL.md)：### Antibody / Structural (SAbDab, TheraSAbDab) |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-immunology/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-immunology/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-kegg-disease-drug

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| KEGG ID 不得凭记忆 | preserved | [SKILL.md:29](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-kegg-disease-drug/SKILL.md)：**LOOK UP DON'T GUESS**: Do not assume KEGG disease IDs, drug IDs, or gene IDs from memory — always search first with `KEGG_search_disease`, `KEGG_search_drug`, or `KEGG_convert_ids`. Do not assume which pathways link a  |
| KEGG 自有基因 ID 命名空间 | preserved | [SKILL.md:186](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-kegg-disease-drug/SKILL.md)：- **ID conversion caveat**: KEGG uses its own gene ID namespace (e.g., hsa:7157 for TP53). Always use `KEGG_convert_ids` to map from external IDs (NCBI Gene, UniProt) before querying KEGG-specific tools. Failed conversio |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-kegg-disease-drug/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-kegg-disease-drug/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-network-pharmacology

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 实体消歧先行且先建报告 | preserved | [SKILL.md:106](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-network-pharmacology/SKILL.md)：### Phase 0: Entity Disambiguation and Report Setup |
| 网络邻近性打分阈值 | preserved | [SKILL.md:90](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-network-pharmacology/SKILL.md)：- **Network Proximity (35 pts)**: Z < -2, p < 0.01 earns full points. A drug whose targets are in a different network neighborhood from the disease module scores near zero here. Do not claim proximity without computing t |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-network-pharmacology/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-network-pharmacology/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-pharmacogenomics

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| CPIC 参数易错点（ID 或药名，混用会失败） | preserved | [SKILL.md:223](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacogenomics/SKILL.md)：- `CPIC_get_recommendations`: accepts `guideline_id` (integer) OR `drug`/`drug_name` (string). Never pass guideline_id as a string. |
| 代谢者表型推理 | preserved | [SKILL.md:157](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacogenomics/SKILL.md)：### Metabolizer Status Reasoning |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacogenomics/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacogenomics/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-pharmacovigilance

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 信号量化用不成比例性（PRR/ROR） | preserved | [SKILL.md:30](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacovigilance/SKILL.md)：2. **Signal quantification** - Use disproportionality measures (PRR, ROR) |
| 时间线作为诊断工具 | preserved | [SKILL.md:64](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacovigilance/SKILL.md)：### Reasoning Strategy 2: Timeline as Diagnostic Tool |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacovigilance/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-pharmacovigilance/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |

### plugin-tooluniverse-spatial-omics-analysis

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| 逐空间域独立表征再比较 | preserved | [SKILL.md:21](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-spatial-omics-analysis/SKILL.md)：2. **Domain-by-domain analysis** - Characterize each spatial region independently before comparison |
| 空间多组学整合评分 0-100 | preserved | [SKILL.md:72](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-spatial-omics-analysis/SKILL.md)：## Spatial Omics Integration Score (0-100) |
| Reactome 覆盖字段 | adapted | [tool-reference.md:36](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-spatial-omics-analysis/tool-reference.md)：\| `ReactomeAnalysis_pathway_enrichment` \| `{data: {pathways: [{pathway_id, name, p_value, fdr, entities_found, entities_total, entities_coverage}]}}` \| Top 20 returned \| |

### plugin-tooluniverse-toxicology

| 语义义务 | 判定 | 本轮承载与原文 |
|---|---|---|
| AOP 优先思考（MIE→KE→AO） | preserved | [SKILL.md:64](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-toxicology/SKILL.md)：1. **AOP-first thinking** - Frame all toxicity in terms of MIE → Key Events → Adverse Outcome |
| 机制与信号须区分 | preserved | [SKILL.md:67](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-toxicology/SKILL.md)：4. **Distinguish mechanism from signal** - AOPWiki = mechanism; FAERS = real-world signal |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:17](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-toxicology/SKILL.md)：Detailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` wi |
| FAERS 分页、报告分母和证据含义 | adapted | [SKILL.md:19](../../../skills/plugins/extensions/capabilities/plugin-tooluniverse-toxicology/SKILL.md)：Count tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal pr |


## 重点适配的内容判定

- **FAERS：adapted。** 调用示例及参数对照表、详细检索上限、分页 envelope、count 工具 `term/count`、全查询报告分母、serious 条件和 PRR/ROR/IC 来源同步到目标工具契约。所有受影响主 Skill 的证据约束前置。药物警戒引用示例不再从 count 行假读 PRR；Emerging Signals 通过 disproportionality 查询获取 PRR，把页内 serious/death 计数明确命名为 partial。药物再利用不再累加反应行作为报告分母；分母未知时保留 unknown。自发报告频数不能推断发生率、死亡因果或人群风险。
- **DDI：adapted。** 三个 Python 示例 `ddi_pipeline.py`、`python_implementation.py`、`ddi_working_example.py` 同步 `medicinalproduct`、`reactionmeddraverse` 和 `total_reports_matching_query`。查询失败或报告分母缺失保留 None，风险结果为 UNKNOWN，不被默认零报告和 LOW 覆盖。管线原有证据汇集和建议输出保留；其评分仍是示例性启发式，不能认证临床效度。这三项资源经过语法解析，未执行。工作示例的显示、返回报告与缺失证据状态保持一致，重复转换保持同样结果。
- **Reactome：adapted/preserved。** 新源的 `entities_coverage`、`entities_ratio`、`entities_found / entities_total` 含义保持；空间组学旧工具参考补充 coverage 字段，避免以错误比例解释通路结果。排序与 FDR、背景选择、交叉数据库复核保留。
- **EBI eQTL Catalogue：removed/adapted。** 默认目标配置已停用的 `eQTL_list_datasets` / `eQTL_get_associations` 不再出现在 epigenomics-chromatin 生产路由。GTEx 查询作为可用替代，同时声明组织、研究及覆盖局限；不足时请求独立、已授权来源，不把 GTEx 宣称为等价全覆盖。
- **CLUE：removed。** cell-line-profiling 删除已停用接口和 credential 排障支线；DepMap、Cellosaurus、COSMIC、PharmacoDB 的身份核对、突变/CNV、依赖性和模型选择路径保留。删除发生在特定退出的接口，研究任务仍有明确承载。
- **ADMET：adapted。** 保留本地 ML extra 前提、缺失前提时的降级和控制台 warning 判断；主 Skill 先说明使用已授权环境及报告缺失条件。吸纳和静态检查不会安装依赖或执行 doctor。
- **PhyKIT：adapted。** 保留查询、基因树/物种树比较、树支持和 paired/unpaired 统计流程。主 Skill 前置 saturation 第二列为 `1-slope`、第三列为 `%PIS`，RCV 使用未裁剪 alignment、`toverr` alias、DVMC/LB 的工具与 per-tree/statistical 约束。gaps 统计区分 residue gap 与 column gap；摘要不足以重建 Mann–Whitney。具备原始 alignment 时可由 Agent 计算列比例，不把现有 residue 工具称为列比例工具。
- **Regulatory variant：adapted。** 组织/基因组上下文、AlphaGenome 调用流程和可核验输出保留；模型预测限定为机制假说，不能仅凭模型输出声称因果关系。
- **外部服务：adapted。** Boltz 的按次费用、成本确认及 idempotency 保留；Folklore、Noodle/Exa、AlphaGenome、gi 系列仅在目标 Agent 已获授权、具备配置的范围内使用。未授权时报告不可用；代码、序列、任务材料或费用授权不由安装或 pin 更新推定。
- **Molecular cloning：adapted/preserved。** 修正不合法 frontmatter description，保留设计和反向解析两条业务路径以及序列、载体、酶切、同源组装等验证步骤。修正描述不改变其资源准入。

## 权限与验证边界

本轮只读取并转换 reviewed 内容。转换、registry assembly、审计和静态检查未执行 ToolUniverse 上游脚本或模型，未安装依赖、配置凭据、调用远程服务或写 ResearchSpec workflow。最终生成 Skill 的 `next-node / next-phase / agent-team / proceed to next` 扫描零命中。graph profiles 无变更；包内脚本作为知识资源，不获得 graph mutation authority。图运行测试只运行 ResearchSpec 声明的 evidence validator。

## 已运行验证

| 验证 | 实际结果 |
|---|---|
| `pnpm tooluniverse:convert --force` | 130 项成功生成，完整库存、源身份、准入、依赖和资源约束通过 |
| `node scripts/tooluniverse-maintenance.mjs artifacts v1.5.4-8ec5d4b` | 130 包、348 资源逐字节校验成功 |
| `pnpm check` / `pnpm lint` | 通过 |
| `tsc -p tsconfig.test.json` | 通过 |
| 定向 audit / converter / adaptations / domain / extensions / graph-runtime tests | 31 项通过，包含 graph validator 拒绝不完整材料并接受完整材料的路径 |
| 最终 adaptations / audit / converter tests | 19 项通过，包含 DDI 修复与 regeneration idempotence |
| 全包 body / knowledge / profiles 校验 | 130/130 body、348/348 resource、130/130 profile 通过 |
| 未受影响包原锚点 tree SHA-256 | 82/82 一致 |
| 改变的 Python 示例静态语法解析 | 21 个 Markdown Python blocks 和 3 个 DDI 文件通过，未执行示例 |
| `git diff --check` | 通过 |
| 参数表同步后：audit / converter / adaptations / maintenance / domain / extensions 定向测试 | 32 项通过，零失败；包含 registry、图运行、validator 和最终生成幂等性 |

全量 `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`：436 项通过，零失败；包含 DDI 返回分数一致性和重复适配回归。其后追加的 FAERS 参数表同步已通过 12 项适配测试，最终包、registry、领域和锚点的定向复核另记于下表。

baseline/check 已通过；新旧锚点差异见 [anchor-diff.txt](artifacts/anchor-diff.txt)。最终验证结果写入本记录后，再次固化并校验 record hash。

## 补充审阅证据绑定

这些 SHA-256 随本记录进入锚点 manifest 的 record hash，绑定独立保存的语义证据。

| 工件 | SHA-256 |
|---|---|
| [upstream-delta.json](artifacts/upstream-delta.json) | `7bcb2a25284ac816fc93e8dbe80622d23f86a8a549633b5eb407e07b32616f40` |
| [retained-semantic-review.md](artifacts/retained-semantic-review.md) | `4e8303411f774ee1a1280dec3f7d0200535c41ae8842839185f8652c629af76d` |
| [absorption-review.json](artifacts/absorption-review.json) | `2e07d763f9bd1cfb9de261f44ce3e61f2b39ce907887e5670191e84acb8ba80f` |

## 结论

**declared-fit-with-notes。** 已解决上游预审中的生产承载缺口，本轮 130 个既有能力可按目标 pin 生成并发布，48 个包有明确、可追溯变化；82 个无影响包和全部 profiles 保持原字节。33 项直接变化的 97 条义务、15 项间接变化的业务保留与契约适配，以及其余保留集均有证据承载。未发现剩余 gap。

这是静态吸纳结论，不是外部 API 可用性、上游示例运行、模型正确性或临床有效性的认证。三个新增业务候选仍排除；外部服务与目标 Agent 执行保留其独立授权边界。此结论由 Agent 作出，不代替人工 Gate 或 Decision 确认。
