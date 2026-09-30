# ToolUniverse 上游增量语义审阅：v1.3.1 → v1.5.4

本记录完成 33 个直接变化能力、1 个确认的间接退役缺口，以及全部 35 个新增 Skill 的范围分类。每个直接变化能力有 2–5 项语义判定，原文证据定位到不可变 Git revision。目标尚未转换，以下 preserved/adapted/removed/gap 比较上游内容，不代表目标 extension 已通过准入。

完整结构化义务、证据和建议见 [upstream-delta.json](artifacts/upstream-delta.json) 的 semantic_review。机审只检查库存和身份；以下逐项结论来自原文差异审阅。对工具名和参数的部分初判已按实际目录/schema/实现核对修正，分别记录在 maintainer_note。

## 逐能力判定

### plugin-tooluniverse-admet-prediction

New 'Before You Run' block adds a runtime prerequisite (tooluniverse[ml] local model) and a console-noise/error-classification rule. No tool call signatures changed.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| runtime dependency: ADMETAI local model needs the 'ml' extra | gap | [skills/tooluniverse-admet-prediction/SKILL.md:28](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-admet-prediction/SKILL.md#L28)：**Input**: Drug name (e.g., "ibuprofen") OR SMILES string (e.g., "CC(C)Cc1ccc(cc1)C(C)C(=O)O") | [skills/tooluniverse-admet-prediction/SKILL.md:35](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-admet-prediction/SKILL.md#L35)：uv pip install 'tooluniverse[ml]' |
| fail-soft path when the extra is absent | adapted | `skills/tooluniverse-admet-prediction/SKILL.md` | [skills/tooluniverse-admet-prediction/SKILL.md:40](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-admet-prediction/SKILL.md#L40)：`tooluniverse-doctor` to confirm which optional groups are installed. |
| evidence/error-classification boundary: library warnings are not failures | adapted | `skills/tooluniverse-admet-prediction/SKILL.md` | [skills/tooluniverse-admet-prediction/SKILL.md:42](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-admet-prediction/SKILL.md#L42)：**Expected console noise — not errors.** The first ADMETAI call loads PyTorch |

待处理：新增无条件安装命令和 doctor 探测建议，不能从静态发布准入推导安装或探测授权；运行时只可使用目标 Agent 已获授权的环境。

吸纳建议：Record the 'ml' extra as an explicit external prerequisite in the conversion/admission decision; do not auto-install or probe it.

### plugin-tooluniverse-adverse-event-detection

Two FAERS contract changes: FAERS_search_serious_reports_by_drug gains a `serious` parameter and no longer returns only serious reports; FAERS_search_adverse_event_reports / FAERS_search_reports_by_drug_and_reaction now return a paged dict (reports/count/total_available/truncated) instead of a bare list.

复核说明：serious 工具名不足以证明基线默认只返回严重病例；本审计确认的是目标新增明确筛选/分页说明，不据文档差异反推基线真实服务行为。上游测试仅作静态证据，未执行。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| output contract: FAERS detailed-report tools return a paged object, not a list | adapted | [skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py:129](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py#L129)：assert isinstance(result, list), f"Expected list, got {type(result)}" | [skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py:68](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py#L68)：assert isinstance(result, dict), f"Expected dict, got {type(result)}" |
| page is not the answer: read total_available, not count/len | adapted | [skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py:693](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py#L693)：assert len(result) > 0, "Should have at least 1 report" | [skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py:696](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-adverse-event-detection/test_adverse_event_detection.py#L696)：assert result["total_available"] > len(reports), "atorvastatin has many reports" |
| parameter change: FAERS_search_serious_reports_by_drug gains `serious` | adapted | [skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md:19](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md#L19)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdisabling`, `l | [skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md:19](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md#L19)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `serious`, `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdis |
| name-resolution scope widened for the drug arm | preserved | [skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md:19](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md#L19)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdisabling`, `l | [skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md:19](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-adverse-event-detection/TOOL_REFERENCE.md#L19)：\| `FAERS_search_serious_reports_by_drug` \| `medicinalproduct` (REQUIRED), `serious`, `seriousnessdeath`, `seriousnesshospitalization`, `seriousnesslifethreatening`, `seriousnessdis |

待处理：The dict envelope is a breaking response-shape change; any sibling Skill that reads FAERS case-report results as a list is now wrong.

吸纳建议：Regeneration must carry the dict contract; sweep other FAERS consumers (e.g. product-safety-surveillance, drug-research, pharmacovigilance) for list-shaped reads of the same tools.

### plugin-tooluniverse-antibody-engineering

CHO codon-optimization step now names the CodonUsage tools and the correct reference table, replacing a bare 'assess codon optimization' line.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| step now specifies tools and required taxid | adapted | [skills/tooluniverse-antibody-engineering/SKILL.md:255](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-antibody-engineering/SKILL.md#L255)：1. Assess codon optimization for CHO, identify rare codons | [skills/tooluniverse-antibody-engineering/SKILL.md:255](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-antibody-engineering/SKILL.md#L255)：1. Assess codon optimization for CHO, identify rare codons -- `CodonUsage_get_optimal_codons(taxid=<Cricetulus griseus NCBI taxid>)` gives the CHO-preferred codon per amino acid to |
| evidence boundary: species-correct reference table | adapted | [skills/tooluniverse-antibody-engineering/SKILL.md:255](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-antibody-engineering/SKILL.md#L255)：1. Assess codon optimization for CHO, identify rare codons | [skills/tooluniverse-antibody-engineering/SKILL.md:255](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-antibody-engineering/SKILL.md#L255)：1. Assess codon optimization for CHO, identify rare codons -- `CodonUsage_get_optimal_codons(taxid=<Cricetulus griseus NCBI taxid>)` gives the CHO-preferred codon per amino acid to |

待处理：Depends on Cricetulus griseus taxid resolution; an assumed default taxid would silently mis-tune optimization.


### plugin-tooluniverse-binder-discovery

Adds the MolGlueDB tools as a molecular-glue-degrader route in the PPI/IDR reasoning and as a sixth bioactivity source; removes the blanket 'redirect IDR to degrader strategies' phrasing.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency: MolGlueDB for glue-degrader neosubstrates | adapted | [skills/tooluniverse-binder-discovery/SKILL.md:33](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-binder-discovery/SKILL.md#L33)：- **Protein-protein interfaces**: flat, large contact surface. Small molecules rarely compete effectively unless there is a "hot spot" cavity. Check whether any allosteric pockets  | [skills/tooluniverse-binder-discovery/SKILL.md:33](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-binder-discovery/SKILL.md#L33)：- **Protein-protein interfaces**: flat, large contact surface. Small molecules rarely compete effectively unless there is a "hot spot" cavity. Check whether any allosteric pockets  |
| IDR branch redirect narrowed | adapted | [skills/tooluniverse-binder-discovery/SKILL.md:34](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-binder-discovery/SKILL.md#L34)：- **Intrinsically disordered regions**: essentially no small molecule approach. Redirect to peptide or degrader strategies. | [skills/tooluniverse-binder-discovery/SKILL.md:34](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-binder-discovery/SKILL.md#L34)：- **Intrinsically disordered regions**: essentially no direct small molecule approach. Redirect to peptide strategies, or check `MolGlueDB_search_compounds` in case the target is a |
| bioactivity priority order gains item 6 | adapted | [skills/tooluniverse-binder-discovery/SKILL.md:144](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-binder-discovery/SKILL.md#L144)：5. `OpenTargets_get_chemical_probes_by_target_ensemblID` - validated probes | [skills/tooluniverse-binder-discovery/SKILL.md:145](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-binder-discovery/SKILL.md#L145)：6. `MolGlueDB_search_compounds` - molecular glue degraders specifically (small molecules that induce a novel protein-protein interaction rather than occupy a conventional pocket);  |


### plugin-tooluniverse-cell-line-profiling

CLUE tools are removed from the Skill in all three places they appeared. Upstream moved clue_tools to src/tooluniverse/data/broken_apis/, so this is a deliberate retirement, not an accidental edit. Verified against the target: skills/tooluniverse-cell-line-profiling/SKILL.md at 8ec5d4be has ZERO case-insensitive 'clue' matches, and upstream-delta.json.tool_catalog_delta.removed lists the five CLUE_* interfaces (including CLUE_get_cell_lines) as moved out of src/tooluniverse/data/clue_tools.json. The eQTL_* retirement (eQTL_list_datasets, eQTL_get_associations) does NOT touch this Skill: no eQTL_* references at baseline or target (only GTEx_query_eqtl, a different tool, is used elsewhere).

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| tool table: CLUE_get_cell_lines dropped | removed | [skills/tooluniverse-cell-line-profiling/SKILL.md:57](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-cell-line-profiling/SKILL.md#L57)：\| `CLUE_get_cell_lines` \| `operation="get_cell_lines"`, `cell_id` \| L1000 CMap cell line info (requires CLUE_API_KEY) \| | `skills/tooluniverse-cell-line-profiling/SKILL.md` |
| workflow step 4C CLUE removed | removed | [skills/tooluniverse-cell-line-profiling/SKILL.md:160](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-cell-line-profiling/SKILL.md#L160)：**4C CLUE**: `CLUE_get_cell_lines(operation="get_cell_lines", cell_id="MCF7")` — requires CLUE_API_KEY. | `skills/tooluniverse-cell-line-profiling/SKILL.md` |
| troubleshooting row for missing CLUE_API_KEY removed | removed | [skills/tooluniverse-cell-line-profiling/SKILL.md:260](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-cell-line-profiling/SKILL.md#L260)：\| CLUE requires API key \| Skip CLUE tools if CLUE_API_KEY not set; note in report \| | `skills/tooluniverse-cell-line-profiling/SKILL.md` |
| target correction confirmed; stale baseline artifacts enumerated | removed | [skills/tooluniverse-cell-line-profiling/SKILL.md:57](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-cell-line-profiling/SKILL.md#L57)：\| `CLUE_get_cell_lines` \| `operation="get_cell_lines"`, `cell_id` \| L1000 CMap cell line info (requires CLUE_API_KEY) \| | `skills/tooluniverse-cell-line-profiling/SKILL.md` |

待处理：A stale regenerated package would keep advertising retired CLUE tools and the CLUE_API_KEY path.；Five CLUE_* interfaces plus eQTL_list_datasets/eQTL_get_associations moved to broken_apis; only CLUE_get_cell_lines is referenced by this Skill, and the target removes it. eQTL_* has no reference in any of the 17 reviewed Skills (the eQTL_* retirement instead impacts plugin-tooluniverse-epigenomics-chromatin, outside this group).

吸纳建议：Regeneration from v1.5.4 must drop all three CLUE references in both the vendor-package copy and the extension capability copy; no credential/provider text for CLUE should remain.；No eQTL_* action for this Skill or any of the 17 reviewed Skills; route eQTL_* impact to the epigenomics-chromatin owner.

### plugin-tooluniverse-comparative-genomics

Phase 1 adds a GoaT pre-check that a reference assembly actually exists before gene-level lookups for non-model species.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new pre-check tool for non-model organisms | adapted | [skills/tooluniverse-comparative-genomics/SKILL.md:94](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-comparative-genomics/SKILL.md#L94)：`ensembl_lookup_gene` takes `gene_id` (symbol or Ensembl ID). The `species` parameter is REQUIRED when using gene symbols (e.g., `species="homo_sapiens"`); omitting it causes error | [skills/tooluniverse-comparative-genomics/SKILL.md:96](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-comparative-genomics/SKILL.md#L96)：For a species outside Ensembl's well-annotated set (most non-model organisms), check `GoaT_get_species(taxon=...)` first to confirm a reference genome assembly actually exists (and |
| evidence boundary: assembly status qualifies what a lookup can claim | adapted | [skills/tooluniverse-comparative-genomics/SKILL.md:94](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-comparative-genomics/SKILL.md#L94)：`ensembl_lookup_gene` takes `gene_id` (symbol or Ensembl ID). The `species` parameter is REQUIRED when using gene symbols (e.g., `species="homo_sapiens"`); omitting it causes error | [skills/tooluniverse-comparative-genomics/SKILL.md:96](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-comparative-genomics/SKILL.md#L96)：For a species outside Ensembl's well-annotated set (most non-model organisms), check `GoaT_get_species(taxon=...)` first to confirm a reference genome assembly actually exists (and |


### plugin-tooluniverse-dataset-discovery

Layer 2 repository list is reorganized and extended: DHS Program (LMIC surveys), DDBJ + GSA (open genomics), and dbGaP + EGA (controlled-access human genomics with an explicit access-request boundary).

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| LMIC health-survey source added (DHS Program) | adapted | [skills/tooluniverse-dataset-discovery/SKILL.md:45](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-dataset-discovery/SKILL.md#L45)：- Health surveys: CDC, NHANES (search by variable name, not topic keywords) | [skills/tooluniverse-dataset-discovery/SKILL.md:45](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-dataset-discovery/SKILL.md#L45)：- Health surveys: CDC, NHANES (US; search by variable name, not topic keywords); DHS Program (`DHSProgram_search_indicators`/`_get_data`) for the international/LMIC equivalent -- f |
| open genomics archives extended (DDBJ, GSA) | adapted | [skills/tooluniverse-dataset-discovery/SKILL.md:46](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-dataset-discovery/SKILL.md#L46)：- Genomics: SRA, ENA, ArrayExpress, GEO | [skills/tooluniverse-dataset-discovery/SKILL.md:46](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-dataset-discovery/SKILL.md#L46)：- Genomics (open): SRA, ENA, ArrayExpress, GEO, and DDBJ (`DDBJ_search_entries`/`_get_entry`/`_get_cross_references`) -- the third INSDC archive alongside SRA/ENA, plus GEA/MetaboB |
| controlled-access human genomics with permission boundary | adapted | `skills/tooluniverse-dataset-discovery/SKILL.md` | [skills/tooluniverse-dataset-discovery/SKILL.md:47](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-dataset-discovery/SKILL.md#L47)：- Genomics (controlled-access, human studies): dbGaP (`DbGaP_search_studies`/`_get_study`) and EGA (`EGA_get_study`/`_get_dataset`/`_get_study_datasets`) -- both require a separate |

待处理：The controlled-access line could invite the impression that genotype data is retrievable through ToolUniverse; the metadata-only qualifier must survive verbatim.


### plugin-tooluniverse-drug-regulatory

Phase 3 retitled to Orange Book / Purple Book; biologics and biosimilars must now use FDAPurpleBook_search_products.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency and routing for biologics/biosimilars | adapted | [skills/tooluniverse-drug-regulatory/SKILL.md:126](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-drug-regulatory/SKILL.md#L126)：## Phase 3: Approval & Generic Status (FDA Orange Book) | [skills/tooluniverse-drug-regulatory/SKILL.md:128](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-drug-regulatory/SKILL.md#L128)：**Orange Book covers small-molecule drugs; biologics and biosimilars (e.g. "is there a biosimilar of adalimumab") are a different FDA list entirely** — use `FDAPurpleBook_search_pr |
| existing Orange Book procedure retained | preserved | [skills/tooluniverse-drug-regulatory/SKILL.md:50](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-drug-regulatory/SKILL.md#L50)：Phase 3: Approval & Generic Status -- FDA_OrangeBook_search_drug, FDA_OrangeBook_check_generic_availability | [skills/tooluniverse-drug-regulatory/SKILL.md:130](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-drug-regulatory/SKILL.md#L130)：**FDA_OrangeBook_search_drug**: `brand_name` (string), `generic_name` (string), `application_number` (string), `limit` (int, default 10). |

待处理：A biosimilar question routed to Orange Book now silently returns nothing; the new routing line is load-bearing.


### plugin-tooluniverse-drug-research

FAERS_rollup_meddra_hierarchy row rewritten: up to 999 PTs, unique_PTs_returned is a row count not a total, and a truncated flag must be checked.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| output semantics: unique_PTs_returned is not a total | adapted | [skills/tooluniverse-drug-research/TOOLS_REFERENCE.md:270](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-drug-research/TOOLS_REFERENCE.md#L270)：\| `FAERS_rollup_meddra_hierarchy` \| Aggregate by Preferred Term level \| Top 50 PTs with counts \| | [skills/tooluniverse-drug-research/TOOLS_REFERENCE.md:270](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-drug-research/TOOLS_REFERENCE.md#L270)：\| `FAERS_rollup_meddra_hierarchy` \| Aggregate by Preferred Term level \| Most-reported PTs with counts (up to 999). `unique_PTs_returned` is a row count, NOT a total — openFDA repor |
| 报告中的事实须有逐项来源 | preserved | [skills/tooluniverse-drug-research/SKILL.md:14](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-drug-research/SKILL.md#L14)：3. **Citation requirements** - Every fact must have inline source attribution | [skills/tooluniverse-drug-research/SKILL.md:14](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-drug-research/SKILL.md#L14)：3. **Citation requirements** - Every fact must have inline source attribution |


### plugin-tooluniverse-ecology-biodiversity

Species-identification table gains the BOLDSystems DNA-barcode tools for cryptic-species questions GBIF cannot resolve by name.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency: BOLD barcoding | adapted | [skills/tooluniverse-ecology-biodiversity/SKILL.md:67](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-ecology-biodiversity/SKILL.md#L67)：\| `WoRMS_search_species` \| Marine species taxonomy \| | [skills/tooluniverse-ecology-biodiversity/SKILL.md:68](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-ecology-biodiversity/SKILL.md#L68)：\| `BOLDSystems_search_by_taxon` / `_search_by_bin` / `_get_record` \| DNA barcode-based species identification (COI barcoding); BIN clusters group specimens by barcode similarity, u |
| 物种分类须查询数据库而非凭记忆 | preserved | [skills/tooluniverse-ecology-biodiversity/SKILL.md:13](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-ecology-biodiversity/SKILL.md#L13)：1. **LOOK UP DON'T GUESS** — Use `GBIF_search_species` to get taxonomy, `WoRMS_search_species` for marine organisms | [skills/tooluniverse-ecology-biodiversity/SKILL.md:13](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-ecology-biodiversity/SKILL.md#L13)：1. **LOOK UP DON'T GUESS** — Use `GBIF_search_species` to get taxonomy, `WoRMS_search_species` for marine organisms |


### plugin-tooluniverse-epidemiological-analysis

Survey-weights paragraph gains a non-US/LMIC source (DHS Program) for PECO questions outside the US.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency and population-scope rule | adapted | [skills/tooluniverse-epidemiological-analysis/SKILL.md:103](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-epidemiological-analysis/SKILL.md#L103)：**Survey weights**: Some surveys (NHANES, BRFSS, MEPS) require sampling weights for valid inference. Check the survey documentation. For weighted regression, use `statsmodels.stats | [skills/tooluniverse-epidemiological-analysis/SKILL.md:105](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epidemiological-analysis/SKILL.md#L105)：**International/LMIC population health**: for a PECO question outside the US, `DHSProgram_search_indicators`/`DHSProgram_get_data` covers the same kind of national survey indicator |
| DHSProgram_search_indicators vs _get_data split | adapted | `skills/tooluniverse-epidemiological-analysis/SKILL.md` | [skills/tooluniverse-epidemiological-analysis/SKILL.md:105](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epidemiological-analysis/SKILL.md#L105)：**International/LMIC population health**: for a PECO question outside the US, `DHSProgram_search_indicators`/`DHSProgram_get_data` covers the same kind of national survey indicator |


### plugin-tooluniverse-epigenomics

Phase 6 adds the EWAS Catalog tools for published EWAS results, with an explicit not-raw-methylation scope boundary.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency: EWASCatalog lookup | adapted | [skills/tooluniverse-epigenomics/SKILL.md:152](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-epigenomics/SKILL.md#L152)：- `GTEx_query_eqtl`: `gene_symbol`, `tissue_id` (case-sensitive exact, e.g., `"Whole_Blood"`) | [skills/tooluniverse-epigenomics/SKILL.md:154](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epigenomics/SKILL.md#L154)：**EWAS Catalog** (published epigenome-wide association study results, not raw methylation data): `EWASCatalog_search_by_cpg` (`cpg_id`, e.g. `"cg00000029"`) or `EWASCatalog_search_ |
| scope boundary: published associations vs data processing | adapted | `skills/tooluniverse-epigenomics/SKILL.md` | [skills/tooluniverse-epigenomics/SKILL.md:154](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epigenomics/SKILL.md#L154)：**EWAS Catalog** (published epigenome-wide association study results, not raw methylation data): `EWASCatalog_search_by_cpg` (`cpg_id`, e.g. `"cg00000029"`) or `EWASCatalog_search_ |


### plugin-tooluniverse-gene-enrichment

ReactomeAnalysis_pathway_enrichment output field rename/repurpose: entities_ratio to entities_coverage (found/total), plus a new pathway_size_fraction_of_reactome with a never-rank-by-it rule.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| field rename: entities_ratio to entities_coverage | adapted | [skills/tooluniverse-gene-enrichment/references/tool_parameters.md:227](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-gene-enrichment/references/tool_parameters.md#L227)：- `entities_ratio`: Found/Total ratio | [skills/tooluniverse-gene-enrichment/references/tool_parameters.md:227](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-enrichment/references/tool_parameters.md#L227)：- `entities_coverage`: `entities_found / entities_total` — the coverage figure |
| new field pathway_size_fraction_of_reactome; entities_ratio is now its deprecated alias | adapted | [skills/tooluniverse-gene-enrichment/references/ora_workflow.md:275](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-gene-enrichment/references/ora_workflow.md#L275)：#    entities_ratio, p_value, fdr, reactions_found, reactions_total} | [skills/tooluniverse-gene-enrichment/references/ora_workflow.md:275](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-enrichment/references/ora_workflow.md#L275)：#    entities_coverage, p_value, fdr, reactions_found, reactions_total, |
| ranking boundary: never rank by pathway size fraction | adapted | [skills/tooluniverse-gene-enrichment/references/tool_parameters.md:187](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-gene-enrichment/references/tool_parameters.md#L187)：- `p_value`: Raw p-value | [skills/tooluniverse-gene-enrichment/references/tool_parameters.md:232](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-enrichment/references/tool_parameters.md#L232)：- `pathway_size_fraction_of_reactome`: pathway size divided by Reactome's entity universe for the species. Depends only on the pathway, not on the identifiers you submitted, so nev |

待处理：Silent numeric reinterpretation of a longstanding field name; any downstream code sorting on entities_ratio now sorts by pathway size.

吸纳建议：Sweep other converted packages that document/parse ReactomeAnalysis_pathway_enrichment and carry the same field rename.

### plugin-tooluniverse-literature-deep-research

Search surface extended with Consensus_search_papers and two opt-in MCP integrations (noodle_*, exa_*) carrying env-var/config and evidence-grade boundaries; tool count 123 to 130+.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency: Consensus_search_papers (triage only) | adapted | [skills/tooluniverse-literature-deep-research/SKILL.md:136](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-literature-deep-research/SKILL.md#L136)：\| Broad / hard-to-find / OA \| `Crossref_search_works`, `CORE_search_papers`, `DOAJ_search_articles`, `Fatcat_search_scholar` \| DOI registry + OA aggregators + Internet Archive Scho | [skills/tooluniverse-literature-deep-research/SKILL.md:136](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-literature-deep-research/SKILL.md#L136)：\| Broad / hard-to-find / OA \| `Crossref_search_works`, `CORE_search_papers`, `DOAJ_search_articles`, `Fatcat_search_scholar`, `Consensus_search_papers` \| DOI registry + OA aggregat |
| opt-in external service: Noodle MCP requires NOODLE_MCP_URL | gap | [skills/tooluniverse-literature-deep-research/SKILL.md:119](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-literature-deep-research/SKILL.md#L119)：**Step 2: Citation expansion**: `PubMed_get_cited_by`, `EuropePMC_get_citations/references`, `PubMed_get_related`, `SemanticScholar_get_recommendations`, `OpenCitations_get_citatio | [skills/tooluniverse-literature-deep-research/SKILL.md:119](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-literature-deep-research/SKILL.md#L119)：**Step 2: Citation expansion**: `PubMed_get_cited_by`, `EuropePMC_get_citations/references`, `PubMed_get_related`, `SemanticScholar_get_recommendations`, `OpenCitations_get_citatio |
| last-resort external web search with grade boundary | gap | [skills/tooluniverse-literature-deep-research/SKILL.md:153](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-literature-deep-research/SKILL.md#L153)：Retry once -> fallback tool. Key fallbacks: PubMed_get_cited_by -> EuropePMC_get_citations -> OpenCitations. OA: Unpaywall if configured, else Europe PMC/PMC/OpenAlex flags. | [skills/tooluniverse-literature-deep-research/SKILL.md:155](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-literature-deep-research/SKILL.md#L155)：Last resort when every structured index above is empty (a brand-new preprint, a dataset page, a project site with no DOI): the opt-in `exa_*` tools (general neural web search, no k |
| tool inventory reference updated | adapted | [skills/tooluniverse-literature-deep-research/SKILL.md:193](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-literature-deep-research/SKILL.md#L193)：- `TOOL_NAMES_REFERENCE.md` -- 123 tools with parameters | [skills/tooluniverse-literature-deep-research/SKILL.md:197](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-literature-deep-research/SKILL.md#L197)：- `TOOL_NAMES_REFERENCE.md` -- 130+ tools with parameters |

待处理：Two opt-in MCP providers (Noodle, Exa) with URL/key configuration are now recommended inside an agent-neutral Skill; provider-neutrality and 'no secrets persisted' boundaries must hold.；Consensus/Exa output is explicitly non-authoritative; the triage-vs-source caveat is load-bearing for evidence grading.

吸纳建议：Consensus 属于目标工具目录中的 triage 工具；Noodle/Exa 属于可选外部 MCP。分别记录 availability/配置要求，保留非证据源、无凭证持久化和用户配置边界。

### plugin-tooluniverse-molecular-cloning

Skill scope extended from design-only to design+analysis: adds DNA_golden_gate_assemble (simulate an existing reaction) and DNA_virtual_digest, REBASE site lookup, extra enzyme aliases, and rewritten honest limitations.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| scope change: forward design plus reverse analysis | adapted | [skills/tooluniverse-molecular-cloning/SKILL.md:3](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-molecular-cloning/SKILL.md#L3)：description: Molecular cloning assembly design — Gibson Assembly (overlap design for seamless multi-fragment joining) and Golden Gate Assembly (Type IIS / BsaI / BbsI design with u | [skills/tooluniverse-molecular-cloning/SKILL.md:3](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-molecular-cloning/SKILL.md#L3)：description: Molecular cloning, in both directions. DESIGN — Gibson Assembly (overlap design for seamless multi-fragment joining) and Golden Gate Assembly (Type IIS / BsaI / BbsI / |
| new tool: DNA_golden_gate_assemble; do not hand-write a simulator | adapted | [skills/tooluniverse-molecular-cloning/SKILL.md:49](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-molecular-cloning/SKILL.md#L49)：- **Domestication is mandatory.** The chosen enzyme's site (BsaI `GGTCTC`, BbsI `GAAGAC`) must NOT occur **inside** any part, or it will be cut internally. Remove internal sites by | [skills/tooluniverse-molecular-cloning/SKILL.md:66](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-molecular-cloning/SKILL.md#L66)：## Working backwards — what does an existing assembly produce? |
| new tool dependency: REBASE for enzyme sites/isoschizomers | adapted | [skills/tooluniverse-molecular-cloning/SKILL.md:49](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-molecular-cloning/SKILL.md#L49)：- **Domestication is mandatory.** The chosen enzyme's site (BsaI `GGTCTC`, BbsI `GAAGAC`) must NOT occur **inside** any part, or it will be cut internally. Remove internal sites by | [skills/tooluniverse-molecular-cloning/SKILL.md:49](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-molecular-cloning/SKILL.md#L49)：- **Domestication is mandatory.** The chosen enzyme's site (BsaI `GGTCTC`, BbsI `GAAGAC`) must NOT occur **inside** any part, or it will be cut internally. Remove internal sites by |
| limitations rewritten: reaction now simulated, efficiency not modelled | adapted | [skills/tooluniverse-molecular-cloning/SKILL.md:68](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-molecular-cloning/SKILL.md#L68)：- These tools design the assembly junctions; they do not simulate the full ligation/exonuclease reaction or guarantee efficiency — validate by sequencing the assembled construct. | [skills/tooluniverse-molecular-cloning/SKILL.md:101](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-molecular-cloning/SKILL.md#L101)：- Digestion and overhang-driven ligation are simulated faithfully (`DNA_virtual_digest` |

待处理：The prior limitation text ('do not simulate the full ligation reaction') now contradicts the added tools; both must not coexist after regeneration.

吸纳建议：Confirm the regenerated package carries the new description, the analysis section, and the rewritten limitations rather than the design-only wording.

### plugin-tooluniverse-multiomic-disease-characterization

Same ReactomeAnalysis_pathway_enrichment field change as gene-enrichment, applied to the response example and the tool-reference schema.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| response example: entities_ratio to entities_coverage plus size fraction | adapted | [skills/tooluniverse-multiomic-disease-characterization/response-formats.md:76](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-multiomic-disease-characterization/response-formats.md#L76)："entities_ratio": 0.00291, | [skills/tooluniverse-multiomic-disease-characterization/response-formats.md:76](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-multiomic-disease-characterization/response-formats.md#L76)："entities_coverage": 0.0638, |
| tool-reference schema and ranking note | adapted | [skills/tooluniverse-multiomic-disease-characterization/tool-reference.md:220](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-multiomic-disease-characterization/tool-reference.md#L220)：- **Output**: `{data: {token, analysis_type, pathways_found, pathways: [{pathway_id, name, species, is_disease, is_lowest_level, entities_found, entities_total, entities_ratio, p_v | [skills/tooluniverse-multiomic-disease-characterization/tool-reference.md:221](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-multiomic-disease-characterization/tool-reference.md#L221)：- **NOTE**: rank by `fdr`/`p_value`. `entities_coverage` = found/total. `pathway_size_fraction_of_reactome` (deprecated alias `entities_ratio`) is pathway size over Reactome's enti |

待处理：Two different packages (this and gene-enrichment) now document the same renamed field; they must stay consistent to avoid contradictory guidance.


### plugin-tooluniverse-neuroscience

Literature/data table gains the DANDI tools for published NWB neurophysiology datasets.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| new tool dependency: DANDI neurophysiology data | adapted | [skills/tooluniverse-neuroscience/SKILL.md:156](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-neuroscience/SKILL.md#L156)：\| `WormBase_get_gene` \| C. elegans neurons, connectome, gene expression \| `query` \| | [skills/tooluniverse-neuroscience/SKILL.md:157](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-neuroscience/SKILL.md#L157)：\| `DANDI_search_datasets`/`DANDI_get_dataset`/`DANDI_list_assets` \| Published neurophysiology data (NWB format): spikes, LFP, imaging, behavior \| `query`; `dandiset_id` \| |
| existing C. elegans route preserved | preserved | [skills/tooluniverse-neuroscience/SKILL.md:180](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-neuroscience/SKILL.md#L180)：For C. elegans neural circuit questions, ALWAYS use `WormBase_get_gene` to look up specific synapse and connectivity data. Do not guess neural connections from general knowledge. | [skills/tooluniverse-neuroscience/SKILL.md:181](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-neuroscience/SKILL.md#L181)：For C. elegans neural circuit questions, ALWAYS use `WormBase_get_gene` to look up specific synapse and connectivity data. Do not guess neural connections from general knowledge. |


### plugin-tooluniverse-phylogenetics

Guidance-only update (+138/-1) to SKILL.md: adds a four-trap section, a per-metric alignment table that reverses the deleted blanket rule that tree-paired metrics use the ClipKit alignment, a batch-tool performance mandate, PhyKIT column conventions, and a commit-the-computed-value rule. No tool retired or renamed, and no credential, provider, or remote service added.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Metric-to-alignment pairing for RCV-based metrics | adapted | [skills/tooluniverse-phylogenetics/SKILL.md:151](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-phylogenetics/SKILL.md#L151)：Use clipkit alignment + treefile for tree-paired metrics. | [skills/tooluniverse-phylogenetics/SKILL.md:208](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-phylogenetics/SKILL.md#L208)：\| **`treeness_over_rcv` / `rcv`** \| **`.faa.mafft` (untrimmed)** \| |
| Never loop PhyKIT per file; use phykit_batch_analysis | adapted | [skills/tooluniverse-phylogenetics/SKILL.md:306](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-phylogenetics/SKILL.md#L306)：Do NOT run phykit manually in a loop — the tool handles all files and returns correct summary statistics. | [skills/tooluniverse-phylogenetics/SKILL.md:388](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-phylogenetics/SKILL.md#L388)：**The batch tool is parallel: ~250 trees finish in about 35 seconds.** A per-tree |
| PhyKIT multi-column output; state which column was read | adapted | [skills/tooluniverse-phylogenetics/SKILL.md:308](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-phylogenetics/SKILL.md#L308)：### PhyKIT column-position cheat sheet (parse output carefully) | [skills/tooluniverse-phylogenetics/SKILL.md:414](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-phylogenetics/SKILL.md#L414)：### PhyKIT column conventions — take the right one |
| Batch function set and treeness_over_rcv alias | adapted | [skills/tooluniverse-phylogenetics/SKILL.md:304](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-phylogenetics/SKILL.md#L304)：tu run phykit_batch_analysis '{"operation":"gap_percentage","directory":"./alignments","extension":".fa"}' | [skills/tooluniverse-phylogenetics/SKILL.md:396](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-phylogenetics/SKILL.md#L396)：`treeness_over_rcv` (alias `toverr`). `dvmc` and `long_branch_score` are |
| Gap percentage means gapped alignment columns, not gapped residues | adapted | [skills/tooluniverse-phylogenetics/SKILL.md:159](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-phylogenetics/SKILL.md#L159)：shipped files are canonical. | [skills/tooluniverse-phylogenetics/SKILL.md:235](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-phylogenetics/SKILL.md#L235)：**Gap percentage** in these questions means the fraction of alignment |

待处理：New guidance is written in a benchmark-answer voice (it names reference answers, this benchmark, and two failures in this benchmark) and carries dataset-specific medians (0.2683, 0.3050, 0.4174, 0.556, 0.783). These are upstream evaluation artifacts and must not be promoted to ResearchSpec facts or specs.；The saturation convention is presented as an open disagreement, and the instruction is to declare the convention used rather than enforce one, so no single canonical column is asserted.

吸纳建议：Regenerate plugin-tooluniverse-phylogenetics from the target SKILL.md body and do not reintroduce the deleted line 'Use clipkit alignment + treefile for tree-paired metrics.'

### plugin-tooluniverse-plant-genomics

Two tool-map rows added (+2/-0) to the plant tool inventory: BAR plant RNA-seq expression and Planteome plant ontology. No step, output, or permission change, and no credential or remote service added; BAR and Planteome are keyless.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Plant gene expression source added | adapted | [skills/tooluniverse-plant-genomics/SKILL.md:49](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-plant-genomics/SKILL.md#L49)：\| `ensembl_lookup_gene` \| Gene lookup — use with plant species (e.g., `species="arabidopsis_thaliana"`) \| | [skills/tooluniverse-plant-genomics/SKILL.md:50](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-plant-genomics/SKILL.md#L50)：\| `BAR_get_gene_info` / `BAR_get_rnaseq_expression` \| Plant gene expression (RNA-seq) — the expression-data source this skill was otherwise missing \| |
| Plant ontology tools added | adapted | [skills/tooluniverse-plant-genomics/SKILL.md:49](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-plant-genomics/SKILL.md#L49)：\| `ensembl_lookup_gene` \| Gene lookup — use with plant species (e.g., `species="arabidopsis_thaliana"`) \| | [skills/tooluniverse-plant-genomics/SKILL.md:51](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-plant-genomics/SKILL.md#L51)：\| `Planteome_search_terms` / `Planteome_get_term` / `Planteome_search_annotations` \| Plant ontology (trait, structure, growth-stage terms) and gene-to-term annotations, GO-style bu |
| Existing keyless tool map preserved | preserved | [skills/tooluniverse-plant-genomics/SKILL.md:50](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-plant-genomics/SKILL.md#L50)：\| `kegg_search_pathway` \| Search KEGG pathways (use plant organism codes: ath, osa, zma) \| | [skills/tooluniverse-plant-genomics/SKILL.md:52](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-plant-genomics/SKILL.md#L52)：\| `kegg_search_pathway` \| Search KEGG pathways (use plant organism codes: ath, osa, zma) \| |

吸纳建议：Regenerate plugin-tooluniverse-plant-genomics from the target SKILL.md body.

### plugin-tooluniverse-precision-oncology

两份资源中的错误 ChEMBL 工具名改为已声明的 ChEMBL_get_drug_mechanisms，并同步 drug_chembl_id 参数；这是文档纠错。

复核说明：相关旧工具名在基线与目标的非归档工具声明中均不存在；将此差异解释为文档纠错，不认定为本轮真实 API 重命名。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Drug-mechanism tool rename and parameter change | adapted | [skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md:318](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md#L318)：\| `ChEMBL_get_drug_mechanisms_of_action_by_chemblId` \| Drug MOA \| `chemblId` \| | [skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md:318](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md#L318)：\| `ChEMBL_get_drug_mechanisms` \| Drug MOA \| `drug_chembl_id` \| |
| Treatment query order step 3 | adapted | [skills/tooluniverse-precision-oncology/API_USAGE_PATTERNS.md:345](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-precision-oncology/API_USAGE_PATTERNS.md#L345)：3. `ChEMBL_get_drug_mechanisms_of_action_by_chemblId` -> Mechanism | [skills/tooluniverse-precision-oncology/API_USAGE_PATTERNS.md:345](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-precision-oncology/API_USAGE_PATTERNS.md#L345)：3. `ChEMBL_get_drug_mechanisms` -> Mechanism |
| Neighbouring ChEMBL target-activity contract preserved | preserved | [skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md:319](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md#L319)：\| `ChEMBL_get_target_activities` \| Bioactivity data \| `target_chembl_id` \| | [skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md:319](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-precision-oncology/TOOLS_REFERENCE.md#L319)：\| `ChEMBL_get_target_activities` \| Bioactivity data \| `target_chembl_id` \| |

吸纳建议：Regenerate plugin-tooluniverse-precision-oncology so the renamed tool and parameter propagate into the copied TOOLS_REFERENCE.md and API_USAGE_PATTERNS.md.

### plugin-tooluniverse-product-safety-surveillance

Five added lines to SKILL.md: three new OpenFDADevice device tools (UDI, classification, PMA) and a disambiguation note about two parallel wrapper families over the same openFDA endpoints. All tools stay keyless.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Device UDI, classification and PMA tools added | adapted | [skills/tooluniverse-product-safety-surveillance/SKILL.md:68](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-product-safety-surveillance/SKILL.md#L68)：\| Device \| 510(k) clearances (context) \| `OpenFDA_search_device_510k` \| `/device/510k.json` \| | [skills/tooluniverse-product-safety-surveillance/SKILL.md:71](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-product-safety-surveillance/SKILL.md#L71)：\| Device \| Premarket Approval (PMA, Class 3 devices) \| `OpenFDADevice_search_pma` \| -- \| |
| Duplicate wrapper families must not both be called | adapted | [skills/tooluniverse-product-safety-surveillance/SKILL.md:77](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-product-safety-surveillance/SKILL.md#L77)：All tools take a Lucene `search` string plus optional `limit` and `skip`. All are keyless and verified live. | [skills/tooluniverse-product-safety-surveillance/SKILL.md:82](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-product-safety-surveillance/SKILL.md#L82)：**Note**: `OpenFDADevice_search_recalls`/`_search_adverse_events`/`_search_510k` return the same underlying openFDA data as `OpenFDA_search_device_recalls`/`_device_adverse_events` |
| Keyless retrieval boundary preserved | preserved | [skills/tooluniverse-product-safety-surveillance/SKILL.md:77](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-product-safety-surveillance/SKILL.md#L77)：All tools take a Lucene `search` string plus optional `limit` and `skip`. All are keyless and verified live. | [skills/tooluniverse-product-safety-surveillance/SKILL.md:69](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-product-safety-surveillance/SKILL.md#L69)：\| Device \| Unique Device Identifier (UDI) lookup \| `OpenFDADevice_search_udi` \| -- \| |

吸纳建议：Regenerate plugin-tooluniverse-product-safety-surveillance from the target SKILL.md body.

### plugin-tooluniverse-protein-interactions

Reference-only section rewritten: the SASBDB tool list drops from five entries to two, collapsing three duplicate get_entry rows and deleting SASBDB_download_data. Raw-data download is now only whatever file URLs the metadata call returns.

复核说明：SASBDB_download_data 在基线、目标工具声明中均不存在；removed 表示删除不可兑现的文档承诺，不证明一个已实现下载接口在本轮被移除。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| SASBDB structural-analysis tool inventory collapses from five to two | removed | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:183](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L183)：5. `SASBDB_download_data` - Download raw data | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:180](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L180)：2. `SASBDB_get_entry` - Get entry metadata, experimental conditions, publication info, and data file URLs (one call covers structure/scattering data access — there is no separate d |
| SASBDB search entry description | adapted | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:179](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L179)：1. `SASBDB_search_entries` - Find structural data | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:179](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L179)：1. `SASBDB_search_entries` - Find structural data (by molecular type, or list all entries) |
| Surrounding SAXS/SANS section otherwise unchanged | preserved | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:176](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L176)：- **API**: Public REST API | [skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md:176](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-interactions/DOMAIN_ANALYSIS.md#L176)：- **API**: Public REST API |

待处理：With the download tool gone, a workflow that fetched raw scattering data has no documented step for it. The replacement path (file URLs from SASBDB_get_entry) is asserted in prose only and was not exercised in this audit.

吸纳建议：Regenerate plugin-tooluniverse-protein-interactions and confirm the copied DOMAIN_ANALYSIS.md no longer advertises a download tool.

### plugin-tooluniverse-protein-structure-prediction

Adds an optional, paid, credentialed Boltz path for multi-chain and protein-ligand complexes, and retires the false claim that complex prediction is unavailable. Introduces a cost-confirmation and idempotency boundary the base skill did not have.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Boltz complex and ligand-binding path with consent and cost boundary | adapted | [skills/tooluniverse-protein-structure-prediction/SKILL.md:193](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-structure-prediction/SKILL.md#L193)：- If protein is a complex or has multiple chains: note that both tools predict single chains | [skills/tooluniverse-protein-structure-prediction/SKILL.md:200](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-structure-prediction/SKILL.md#L200)：ESMFold and standard AlphaFold (above) predict single chains only. When the question is specifically about a **complex** -- multi-chain assembly, or protein-ligand binding -- the o |
| Complex prediction no longer described as unavailable | adapted | [skills/tooluniverse-protein-structure-prediction/SKILL.md:336](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-structure-prediction/SKILL.md#L336)：- **Single-chain only**: both ESMFold and standard AlphaFold predict monomers; complex prediction requires AlphaFold-Multimer (not available via these tools) | [skills/tooluniverse-protein-structure-prediction/SKILL.md:349](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-structure-prediction/SKILL.md#L349)：- **Single-chain only (ESMFold/AlphaFold)**: both predict monomers; for a multi-chain complex or protein-ligand binding, see the Boltz section above -- paid, not a free default |
| Databases-integrated table gains a paid entry | adapted | [skills/tooluniverse-protein-structure-prediction/SKILL.md:329](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-structure-prediction/SKILL.md#L329)：\| **ProtParam** \| Any sequence \| Physicochemical sequence properties \| | [skills/tooluniverse-protein-structure-prediction/SKILL.md:342](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-structure-prediction/SKILL.md#L342)：\| **Boltz API** (paid, `BOLTZ_API_KEY`) \| Multi-chain complexes, protein-ligand binding \| Async job; estimate cost first (see dedicated section above) \| |
| Free synchronous monomer default preserved | preserved | [skills/tooluniverse-protein-structure-prediction/SKILL.md:194](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-protein-structure-prediction/SKILL.md#L194)：- If AlphaFold confidence is very high (mean pLDDT > 85): recommend using AlphaFold as primary reference | [skills/tooluniverse-protein-structure-prediction/SKILL.md:194](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-protein-structure-prediction/SKILL.md#L194)：- If AlphaFold confidence is very high (mean pLDDT > 85): recommend using AlphaFold as primary reference |

待处理：A paid third-party service and its API key are now part of a research path. ResearchSpec must not provision BOLTZ_API_KEY, and the skill's confirm-with-the-user instruction is skill-level advice, not a ResearchSpec Gate or model-consent record.；Boltz is asynchronous (submit, poll, retrieve) with a billing side effect on retry, so unattended invocation is materially riskier than the rest of this skill's synchronous calls.

吸纳建议：Regenerate plugin-tooluniverse-protein-structure-prediction and keep the paid, credentialed and cost-confirmation framing intact.

### plugin-tooluniverse-rare-disease-diagnosis

pathway fallback 表将错误名称 STRING_interactions 更正为已声明的 STRING_get_interaction_partners；未发现其他程序义务变化。

复核说明：相关旧工具名在基线与目标的非归档工具声明中均不存在；将此差异解释为文档纠错，不认定为本轮真实 API 重命名。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| STRING fallback tool rename | adapted | [skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md:751](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md#L751)：\| `intact_search_interactions` \| `STRING_interactions` \| Literature search \| | [skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md:751](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md#L751)：\| `intact_search_interactions` \| `STRING_get_interaction_partners` \| Literature search \| |
| Variant-annotation fallback table preserved | preserved | [skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md:753](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md#L753)：### Variant Annotation | [skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md:753](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-rare-disease-diagnosis/TOOLS_REFERENCE.md#L753)：### Variant Annotation |

吸纳建议：Regenerate plugin-tooluniverse-rare-disease-diagnosis so the STRING rename reaches the copied TOOLS_REFERENCE.md.

### plugin-tooluniverse-rare-disease-genomics

Two additions to SKILL.md: a caveat that deep intronic variants can be pathogenic by cryptic splicing, with a referral to the regulatory-variant-analysis skill, and a note distinguishing the overlapping Orphadata and Orphanet tool families.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Deep intronic variant caveat with cross-skill referral | adapted | [skills/tooluniverse-rare-disease-genomics/SKILL.md:42](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-rare-disease-genomics/SKILL.md#L42)：- Synonymous / intronic: usually benign unless at splice junction | [skills/tooluniverse-rare-disease-genomics/SKILL.md:42](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-rare-disease-genomics/SKILL.md#L42)：- Synonymous / intronic: usually benign unless at splice junction -- but "usually" is doing real work: a *deep* intronic variant can still be pathogenic by creating a cryptic splic |
| Orphadata versus Orphanet tool-family choice | adapted | [skills/tooluniverse-rare-disease-genomics/SKILL.md:104](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-rare-disease-genomics/SKILL.md#L104)：**Orphanet_get_icd_mapping**: `orpha_code` (string REQUIRED). Maps to ICD-10/ICD-11 for clinical coding contexts. | [skills/tooluniverse-rare-disease-genomics/SKILL.md:106](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-rare-disease-genomics/SKILL.md#L106)：**Note on `Orphadata_*` tools**: a separate, smaller tool family (`Orphadata_get_disorder`/`_search_by_name`/`_get_epidemiology`/`_get_phenotypes`) wraps the same underlying Orphan |
| Consequence-prioritization hierarchy preserved | preserved | [skills/tooluniverse-rare-disease-genomics/SKILL.md:40](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-rare-disease-genomics/SKILL.md#L40)：- Loss-of-function (frameshift, nonsense, splice-site): strongest candidates | [skills/tooluniverse-rare-disease-genomics/SKILL.md:40](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-rare-disease-genomics/SKILL.md#L40)：- Loss-of-function (frameshift, nonsense, splice-site): strongest candidates |

待处理：The referral names a raw Skill id from the same vendor bundle. If the two capabilities are ever installed independently, the advice points at something that may not be selected.

吸纳建议：Regenerate plugin-tooluniverse-rare-disease-genomics and record the advisory relationship to tooluniverse-regulatory-variant-analysis in the extension relationship metadata.

### plugin-tooluniverse-regulatory-genomics

The sequence-model table gains AlphaGenome Atlas precomputed lookup, region scanning, and a saturation-mutagenesis operation, plus a new opt-in remote gi_* provider. Selection guidance now prefers the precomputed Atlas read for known SNVs.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| AlphaGenome Atlas and ISM operations added | adapted | [skills/tooluniverse-regulatory-genomics/SKILL.md:77](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-genomics/SKILL.md#L77)：\| `AlphaGenome_predict_interval` / `AlphaGenome_score_variant` \| profile region / score variant \| RNA-seq, ATAC, CAGE, splice tracks (frontier accuracy, single-base) \| up to 1 Mb \| | [skills/tooluniverse-regulatory-genomics/SKILL.md:78](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-genomics/SKILL.md#L78)：\| `AlphaGenome_predict_interval` / `AlphaGenome_score_variant` / `AlphaGenome_score_ism_variants` \| profile region / score variant / saturation-mutagenesis scan \| RNA-seq, ATAC, CA |
| Opt-in remote provider gi_* | adapted | [skills/tooluniverse-regulatory-genomics/SKILL.md:81](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-genomics/SKILL.md#L81)：\| `Evo2_score_variant` \| score \| genome-foundation-model delta log-likelihood; coding **and** non-coding \| up to 1 Mb \| hosted NIM — `NVIDIA_API_KEY` \| | [skills/tooluniverse-regulatory-genomics/SKILL.md:83](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-genomics/SKILL.md#L83)：\| `gi_*` (opt-in, `GENOMIC_INTELLIGENCE_MCP_URL`) \| profile (6 tasks) + composite find-genes-then-predict \| promoter, splice sites, enhancer activity, chromatin state, expression,  |
| Selection order prefers the precomputed Atlas read | adapted | [skills/tooluniverse-regulatory-genomics/SKILL.md:83](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-genomics/SKILL.md#L83)：**Picking one:** `AlphaGenome_*` is the broadest readout + longest context when its key is set; `run_enformer_*` / `run_borzoi_*` are the published, self-hostable equivalents (Enfo | [skills/tooluniverse-regulatory-genomics/SKILL.md:85](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-genomics/SKILL.md#L85)：**Picking one:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` (or `atlas_scan_interval` for a whole region) first — it's a precomputed database r |
| Effect-size framing keeps the AVI_SCORE exception | adapted | [skills/tooluniverse-regulatory-genomics/SKILL.md:83](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-genomics/SKILL.md#L83)：**Picking one:** `AlphaGenome_*` is the broadest readout + longest context when its key is set; `run_enformer_*` / `run_borzoi_*` are the published, self-hostable equivalents (Enfo | [skills/tooluniverse-regulatory-genomics/SKILL.md:85](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-genomics/SKILL.md#L85)：**Picking one:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` (or `atlas_scan_interval` for a whole region) first — it's a precomputed database r |

待处理：Two external-service dependencies now sit behind this skill (the ALPHA_GENOME_API_KEY hosted API and the GENOMIC_INTELLIGENCE_MCP_URL demo server). ResearchSpec must not configure either, and the shared demo quota is outside its control.

吸纳建议：Regenerate plugin-tooluniverse-regulatory-genomics from the target SKILL.md body.

### plugin-tooluniverse-regulatory-variant-analysis

Largest semantic delta in this group. The evidence model grows from four questions to five, two new key-gated phases (Atlas triage and live sequence deep-dive) enter the workflow, a new impact tier appears, and the frontmatter description changes. The base annotation pipeline remains valid and is declared self-sufficient without the key.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Evidence model expands to five questions, including a mechanistic one | adapted | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:36](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L36)：When evaluating a non-coding variant, build evidence across four questions: | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:38](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L38)：When evaluating a non-coding variant, build evidence across five questions. The first four are annotation-based (what's already known to be at this position, in this population); t |
| New key-gated phases 0.5 and 4.5 must not block the pipeline | adapted | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:92](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L92)：Use `ols_search_terms` to resolve trait names to ontology IDs before GWAS queries. Restrict to `ontology="efo"` for GWAS traits; OpenTargets prefers MONDO IDs (e.g., MONDO_0005148  | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:111](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L111)：**Requires `ALPHA_GENOME_API_KEY`.** If it isn't configured, the AlphaGenome tools won't appear in your toolset at all — skip this phase and Phase 4.5 entirely and proceed with Pha |
| New impact tier for sequence-model-supported, annotation-silent variants | adapted | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:139](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L139)：- **No evidence**: No regulatory annotations in any source; the variant may be in a non-functional region or the relevant cell type is not represented in available datasets. | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:178](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L178)：- **Sequence-model-supported, annotation-silent**: No GWAS/eQTL/ENCODE/RegulomeDB evidence, but Phase 4.5 shows a high AVI_SCORE and/or a clear multi-track mechanism (e.g., a creat |
| Region caps for ISM and Atlas scanning | adapted | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:203](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L203)：- GWAS associations are population-level; individual variant effects depend on genetic background. | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:285](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L285)：- AlphaGenome/AVI_SCORE predictions are model estimates, not experimental measurements — they corroborate annotation evidence or generate a hypothesis worth validating, but a high  |
| Cross-skill fallback to other sequence-prediction models | adapted | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:128](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L128)：`OpenTargets_search_gwas_studies_by_disease` takes `diseaseIds` as an array of MONDO IDs. It provides locus-to-gene (L2G) scores from multiple GWAS studies, which go beyond simple  | [skills/tooluniverse-regulatory-variant-analysis/SKILL.md:167](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-regulatory-variant-analysis/SKILL.md#L167)：AlphaGenome isn't the only sequence-prediction model in ToolUniverse, just the broadest and the one this phase defaults to. If it's unavailable (no key) or a specific case calls fo |

待处理：The capability is now partially credential-gated. ResearchSpec conversion must not bundle, prompt for, or persist ALPHA_GENOME_API_KEY, and must keep the no-key path first-class.；The example workflow cites an external GREGoR Consortium DNM1 epilepsy case as motivation. That is an unverified third-party claim carried as evidence context.；The YAML description was rewritten to add sequence-based deep-learning prediction, so the vendor-prefixed description, domain assignment and capability metadata for this extension need regeneration.

吸纳建议：Regenerate plugin-tooluniverse-regulatory-variant-analysis from the target SKILL.md body and carry the new tier vocabulary and key-gated phases, keeping them advisory rather than workflow authority.

### plugin-tooluniverse-sequence-analysis

Adds several EBI tools that fill concrete gaps (pairwise alignment, six-frame and back translation, membrane-topology prediction, Pfam scan on a raw sequence, profile search) and corrects the codon-usage script to human-only frequencies.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| New EBI tools for alignment, translation and topology | adapted | [skills/tooluniverse-sequence-analysis/SKILL.md:149](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-sequence-analysis/SKILL.md#L149)：**BLAST_protein_search**: `sequence` (amino acid string), `database` (default "swissprot"), `limit`. Returns homologs with alignment scores, identity, E-values. | [skills/tooluniverse-sequence-analysis/SKILL.md:151](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-sequence-analysis/SKILL.md#L151)：**EBI_pairwise_align**: exactly two sequences (`algorithm='needle'` for global, `'water'` for local), returns percent identity/similarity/gaps and the alignment itself -- no existi |
| Codon-usage script is human-only | adapted | [skills/tooluniverse-sequence-analysis/SKILL.md:258](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-sequence-analysis/SKILL.md#L258)：Use this script for any question about the genetic code, codon degeneracy, amino acid chemistry, codon usage bias, or tRNA wobble pairing. All outputs are JSON. | [skills/tooluniverse-sequence-analysis/SKILL.md:264](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-sequence-analysis/SKILL.md#L264)：Use this script for any question about the genetic code, codon degeneracy, amino acid chemistry, codon usage bias, or tRNA wobble pairing. All outputs are JSON. **Its codon-usage f |
| Pfam annotation on a sequence without a UniProt accession | adapted | [skills/tooluniverse-sequence-analysis/SKILL.md:147](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-sequence-analysis/SKILL.md#L147)：**Pfam_get_protein_annotations**: `accession` (UniProt ID). Returns Pfam domain hits with exact residue coordinates and E-values. | [skills/tooluniverse-sequence-analysis/SKILL.md:147](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-sequence-analysis/SKILL.md#L147)：**Pfam_get_protein_annotations**: `accession` (UniProt ID). Returns Pfam domain hits with exact residue coordinates and E-values. For a raw sequence with no UniProt accession yet ( |

吸纳建议：Regenerate plugin-tooluniverse-sequence-analysis from the target SKILL.md body.

### plugin-tooluniverse-spatial-transcriptomics

One trigger added: an H&E-only input can use a local prediction model that needs no API or key, with an explicit statement that the output is a prediction to guide follow-up rather than a substitute for real spatial data.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| H&E-only trigger with a local, key-free model and an evidence limit | adapted | [skills/tooluniverse-spatial-transcriptomics/SKILL.md:17](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-spatial-transcriptomics/SKILL.md#L17)：- User has spatial transcriptomics data (Visium, MERFISH, seqFISH, etc.) | [skills/tooluniverse-spatial-transcriptomics/SKILL.md:18](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-spatial-transcriptomics/SKILL.md#L18)：- User has *only* an H&E histology image and no spatial assay at all -- `DeepSpotM_predict_gene_expression` (local model, no API/key) predicts spatial gene expression for a 224x224 |
| Assay-platform triggers preserved | preserved | [skills/tooluniverse-spatial-transcriptomics/SKILL.md:18](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-spatial-transcriptomics/SKILL.md#L18)：- Questions about tissue architecture or spatial organization | [skills/tooluniverse-spatial-transcriptomics/SKILL.md:19](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-spatial-transcriptomics/SKILL.md#L19)：- Questions about tissue architecture or spatial organization |

吸纳建议：Regenerate plugin-tooluniverse-spatial-transcriptomics from the target SKILL.md body.

### plugin-tooluniverse-statistical-modeling

资源表将未声明的 FAERS_count_patient_reaction 更正为 FAERS_count_reactions_by_drug_event，并澄清分组；参数名未变。

复核说明：相关旧工具名在基线与目标的非归档工具声明中均不存在；将此差异解释为文档纠错，不认定为本轮真实 API 重命名。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| FAERS reaction-count tool rename and grouping | adapted | [skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md:80](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md#L80)：\| `FAERS_count_patient_reaction` \| `medicinalproduct` \| `[{term, count}]` \| | [skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md:80](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md#L80)：\| `FAERS_count_reactions_by_drug_event` \| `medicinalproduct` \| `[{term, count}]` (grouped by MedDRA Preferred Term) \| |
| Disproportionality and stratification tools preserved | preserved | [skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md:78](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md#L78)：\| `FAERS_calculate_disproportionality` \| `drug_name`, `adverse_event` \| `{metrics: {PRR, ROR, IC}, signal_detection}` \| | [skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md:78](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-statistical-modeling/TOOLS_REFERENCE.md#L78)：\| `FAERS_calculate_disproportionality` \| `drug_name`, `adverse_event` \| `{metrics: {PRR, ROR, IC}, signal_detection}` \| |

吸纳建议：Regenerate plugin-tooluniverse-statistical-modeling so the renamed FAERS tool reaches the copied TOOLS_REFERENCE.md.

### plugin-tooluniverse-structural-proteomics

One bullet added to the source list: SKEMPI tools for protein-protein interface mutation effects (ddG), positioned as the protein-protein analogue of the existing BindingDB ligand source.

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| SKEMPI ddG tools for interface mutations | adapted | [skills/tooluniverse-structural-proteomics/SKILL.md:15](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-structural-proteomics/SKILL.md#L15)：- Ligands/affinities: `PDBe_get_structure_ligands` and `BindingDB_get_ligands_by_uniprot` | [skills/tooluniverse-structural-proteomics/SKILL.md:16](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-structural-proteomics/SKILL.md#L16)：- Protein-protein binding mutations (ddG): `SKEMPI_search_by_structure`/`SKEMPI_search_by_protein`/`SKEMPI_get_mutation` -- BindingDB's protein-protein equivalent, for interface-mu |
| Existing structure and confidence sources preserved | preserved | [skills/tooluniverse-structural-proteomics/SKILL.md:13](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-structural-proteomics/SKILL.md#L13)：- PDB structures/resolutions: `PDBeSIFTS_get_best_structures` and `RCSBGraphQL_get_structure_summary` | [skills/tooluniverse-structural-proteomics/SKILL.md:13](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-structural-proteomics/SKILL.md#L13)：- PDB structures/resolutions: `PDBeSIFTS_get_best_structures` and `RCSBGraphQL_get_structure_summary` |

吸纳建议：Regenerate plugin-tooluniverse-structural-proteomics from the target SKILL.md body.

### plugin-tooluniverse-target-research

Reactome 文档撤下 species 参数建议；目标 schema 仍保留 species/types 字段并标记不支持，目标实现对该 endpoint 显式拒绝非空过滤参数。应在客户端过滤返回记录。

复核说明：已核对前后 reactome_tools.json 和目标 reactome_tool.py；不是 schema 删参，也不是目标静默忽略。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Reactome_query_by_ids parameter contract tightened | adapted | [skills/tooluniverse-target-research/REFERENCE.md:479](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-target-research/REFERENCE.md#L479)：\| `Reactome_query_by_ids` \| `ids`, `species` \| ID query \| | [skills/tooluniverse-target-research/REFERENCE.md:479](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-target-research/REFERENCE.md#L479)：\| `Reactome_query_by_ids` \| `ids` \| ID query (no species/type filtering — filter results on `speciesName`/`schemaClass`) \| |
| Other Reactome endpoints preserved | preserved | [skills/tooluniverse-target-research/REFERENCE.md:478](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-target-research/REFERENCE.md#L478)：\| `Reactome_list_species` \| - \| All species \| | [skills/tooluniverse-target-research/REFERENCE.md:478](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-target-research/REFERENCE.md#L478)：\| `Reactome_list_species` \| - \| All species \| |

吸纳建议：Regenerate plugin-tooluniverse-target-research so the tightened parameter contract reaches the copied REFERENCE.md.

### plugin-tooluniverse-variant-interpretation

新增可选 Folklore MCP 及患者数据限制，优先使用已知 SNV 的 AlphaGenome Atlas 查询，调整 AVI_SCORE 的解释，并纠正两个未声明的 ClinGen 名称。

复核说明：相关旧工具名在基线与目标的非归档工具声明中均不存在；将此差异解释为文档纠错，不认定为本轮真实 API 重命名。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| Opt-in Folklore MCP with a patient-data prohibition | adapted | [skills/tooluniverse-variant-interpretation/SKILL.md:69](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-variant-interpretation/SKILL.md#L69)：Tools: `ClinVar_search_variants`, `gnomad_search_variants`, `gnomad_get_variant`, `OMIM_search`, `OMIM_get_entry`, `ClinGen_search_gene_validity`, `ClinGen_search_dosage_sensitivit | [skills/tooluniverse-variant-interpretation/SKILL.md:69](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-variant-interpretation/SKILL.md#L69)：Tools: `ClinVar_search_variants`, `gnomad_search_variants`, `gnomad_get_variant`, `OMIM_search`, `OMIM_get_entry`, `ClinGen_search_gene_validity`, `ClinGen_search_dosage_sensitivit |
| Atlas precomputed lookup preferred for known SNVs | adapted | [skills/tooluniverse-variant-interpretation/SKILL.md:99](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-variant-interpretation/SKILL.md#L99)：**Which to pick:** start with `AlphaGenome_score_variant` (broadest readout, longest context, frontier accuracy) when its key is set; `run_enformer_variant_effect` / `run_borzoi_va | [skills/tooluniverse-variant-interpretation/SKILL.md:100](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-variant-interpretation/SKILL.md#L100)：**Which to pick:** for a known single-nucleotide variant, check `AlphaGenome_atlas_lookup_variant` first — it's a precomputed database lookup (much cheaper than a live call) coveri |
| AVI_SCORE exception to the not-a-probability rule | adapted | [skills/tooluniverse-variant-interpretation/SKILL.md:97](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-variant-interpretation/SKILL.md#L97)：**Reading the score:** these return Δ (alt − ref) effect sizes, *not* calibrated pathogenicity probabilities. A large predicted disruption in a tissue-relevant track is mechanistic | [skills/tooluniverse-variant-interpretation/SKILL.md:98](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-variant-interpretation/SKILL.md#L98)：**Reading the score:** most of these return Δ (alt − ref) effect sizes, *not* calibrated pathogenicity probabilities — a large predicted disruption in a tissue-relevant track is me |
| ClinGen tool renames | adapted | [skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md:764](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md#L764)：\| `ClinGen_gene_validity` \| Get curation status \| `gene` \| | [skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md:766](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md#L766)：\| `ClinGen_dosage_by_gene` \| Dosage sensitivity \| `gene` \| |
| AlphaGenome input contract for both operations | adapted | [skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md:628](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md#L628)：**Inputs**: `AlphaGenome_score_variant` → `chromosome`,`position`,`reference_bases`,`alternate_bases`,`output_type`,`sequence_length`. `Evo2_score_variant` → `sequence`+`position`+ | [skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md:629](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-variant-interpretation/TOOLS_REFERENCE.md#L629)：**Inputs**: `AlphaGenome_atlas_lookup_variant`/`AlphaGenome_score_variant` → `chromosome`,`position`,`reference_bases`,`alternate_bases` (Atlas additionally takes `scorers`, defaul |

待处理：Two new external-service surfaces reach a clinical-adjacent skill: the key-gated AlphaGenome API and an opt-in Folklore MCP behind FOLKLORE_MCP_URL. ResearchSpec must not configure or persist either, and the no-patient-data rule must survive conversion verbatim.；The Atlas row is described as covering essentially all possible human SNVs while remaining a hosted-API dependency; if the key is absent the tool is not in the toolset and the tidy ranking advice silently disappears.

吸纳建议：Regenerate plugin-tooluniverse-variant-interpretation from the target SKILL.md and TOOLS_REFERENCE.md bodies, preserving the Folklore privacy boundary and the SNV-only Atlas restriction.

### plugin-tooluniverse-epigenomics-chromatin

正文未变，但其 EBI eQTL Catalogue 主路径和 fallback 仍指向已被默认配置停用的接口。

| 语义义务 | 判定 | 基线证据 | 目标证据 |
|---|---|---|---|
| eQTL Catalogue 路径可用性 | gap | [skills/tooluniverse-epigenomics-chromatin/SKILL.md:165](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-epigenomics-chromatin/SKILL.md#L165)：**eQTL_list_datasets** / **eQTL_get_associations**: EBI eQTL Catalogue. Use `dataset_id` (from list call), `gene_id` (Ensembl), `variant`. Complementary to GTEx. | [skills/tooluniverse-epigenomics-chromatin/SKILL.md:165](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epigenomics-chromatin/SKILL.md#L165)：**eQTL_list_datasets** / **eQTL_get_associations**: EBI eQTL Catalogue. Use `dataset_id` (from list call), `gene_id` (Ensembl), `variant`. Complementary to GTEx. |
| 失败替代路径 | gap | [skills/tooluniverse-epigenomics-chromatin/SKILL.md:237](https://github.com/mims-harvard/ToolUniverse/blob/9b7ff91ddb45b567cac2fa8ea31b82851e877617/skills/tooluniverse-epigenomics-chromatin/SKILL.md#L237)：\| eQTLs \| GTEx_get_single_tissue_eqtls \| eQTL_get_associations (EBI) \| | [skills/tooluniverse-epigenomics-chromatin/SKILL.md:237](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-epigenomics-chromatin/SKILL.md#L237)：\| eQTLs \| GTEx_get_single_tissue_eqtls \| eQTL_get_associations (EBI) \| |

待处理：仅按 SKILL 文件 diff 判断不受影响会漏掉此退役接口。

吸纳建议：更新 raw 转换的受审适配和对应 extension，不能只复制本轮直接变化的 33 个能力。

## 新增业务候选

### tooluniverse-biomedical-fact-lookup

defer：有数据库事实核查价值，但“必须查询”与变异题建议凭模型推理存在内部冲突；最大 p 值被默认解释为最显著、PubTator 共现被当作特定数据库关系的替代证据，需要先适配。

- 强制数据库证据：[skills/tooluniverse-biomedical-fact-lookup/SKILL.md:43](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-biomedical-fact-lookup/SKILL.md#L43)；If a question names a database, a gene set, or any annotation that lives in a database, you MUST query the tool before answering. Answering a "according to <database>" question fro
- 变异题凭模型推理例外：[skills/tooluniverse-biomedical-fact-lookup/SKILL.md:66](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-biomedical-fact-lookup/SKILL.md#L66)；| **variant / sequence** pathogenicity ("which variant/sequence is pathogenic *or* benign per ClinVar") | (only when genuinely unsure) `annotate_variant_multi_source`, `VEP_predict
- 替代数据库与共现关系：[skills/tooluniverse-biomedical-fact-lookup/SKILL.md:144](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-biomedical-fact-lookup/SKILL.md#L144)；4. **Text-mined fallback** (covers DisGeNet's text-mined tier when curated is empty): `PubTator3_LiteratureSearch("<GENE> <disease>")` or `PubTator3_GetEntityRelations(e1="@GENE_<s
- 最大 p 值的歧义：[skills/tooluniverse-biomedical-fact-lookup/SKILL.md:206](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-biomedical-fact-lookup/SKILL.md#L206)；In GWAS writing, "the highest p-value", "the top hit" and "the strongest

### tooluniverse-gene-liability

candidate-not-admitted：可作为研究性风险分析候选；覆盖率、缺失值和实验建议有明确契约。0–100 分数、阈值及权重是上游启发式，不能作为已验证安全指标；需评估与 target-research/toxicology 重叠。

- 缺失数据不代表安全：[skills/tooluniverse-gene-liability/SKILL.md:32](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-liability/SKILL.md#L32)；- Treat absent data as unknown, never as evidence of safety.
- 可用权重归一化分数：[skills/tooluniverse-gene-liability/SKILL.md:132](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-liability/SKILL.md#L132)；`liability score = 100 × points earned / available weight`
- 不足 60% 只报证据不足：[skills/tooluniverse-gene-liability/SKILL.md:142](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-liability/SKILL.md#L142)；Publish a categorical score only when coverage is at least 60%. Below 60%, report
- 研究用途边界：[skills/tooluniverse-gene-liability/SKILL.md:179](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-gene-liability/SKILL.md#L179)；End with: “This is a research risk assessment, not a clinical safety determination.”

### tooluniverse-nih-funding-landscape

candidate-not-admitted：适合作为资金与研究政策分析候选；须独立审阅资源、OpenNIH 服务条件和内容许可，区分经验案例与验证事实。live verifier/evals 属维护验证资源，不能仅因在 scripts/ 下便转入生产包。

- 按需资源读取契约：[skills/tooluniverse-nih-funding-landscape/SKILL.md:10](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-nih-funding-landscape/SKILL.md#L10)；Always read [references/tool-reference.md](references/tool-reference.md) before choosing tools or comparing totals. Read [references/verified-cases.md](references/verified-cases.md
- 数据覆盖状态：[skills/tooluniverse-nih-funding-landscape/SKILL.md:36](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-nih-funding-landscape/SKILL.md#L36)；2. Call `OpenNIH_source_status` before a broad report, an absence claim, publication/detail linkage, or any current-year conclusion. Capture the main-corpus fiscal years, latest-ye
- 分页与金额对账：[skills/tooluniverse-nih-funding-landscape/SKILL.md:60](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-nih-funding-landscape/SKILL.md#L60)；7. Before custom pagination, require `meta.total <= 100050`; `limit` is 50 and `offset` is capped at 100000. If the slice is larger, narrow it by fiscal year, exact IC/activity, or
- 奖项、申请与因果边界：[skills/tooluniverse-nih-funding-landscape/SKILL.md:108](https://github.com/mims-harvard/ToolUniverse/blob/8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06/skills/tooluniverse-nih-funding-landscape/SKILL.md#L108)；- Do not infer application success rates, reviewer preferences, scientific quality, investigator independence, or causal impact from awarded-grant records alone.

## 权限与流程复核

- 新增付费 Boltz 路径必须保留成本估计、提交前确认和 idempotency_key；该确认不产生 ResearchSpec Gate、Decision 或模型授权。
- AlphaGenome、Folklore、Genomic Intelligence、Noodle、Exa 只可使用目标 Agent 已获授权的配置；不得在转换中配置凭证、访问服务或触发模型。Folklore 的患者/表型/家庭数据边界须保留。
- 新增 raw Skill 转介先更新既有 dependency-decisions 的语义分类，不据文本提及直接建立硬依赖或新的 registry。
- 上游 Phase 0.5/4.5 是领域程序步骤；正式图节点、Gate、Decision 与状态写入仍由 ResearchSpec 现有契约持有。
- 当前生产 extension 的 next-node/next-phase/agent-team/proceed-to-next 扫描零命中；目标没有生成 extension，不能据此声明未来目标生产树通过。

## 结论

`not-fit`：v1.5.4 原样吸纳尚不可接受。已确认 epigenomics-chromatin 的退役接口缺口，以及运行环境/服务授权需明确适配；FAERS、Reactome 和 PhyKIT 的语义变化必须随转换保留。该结论只否定无审阅的直接刷新，不否定按上述受审决策实施增量吸纳。

本轮增量审计完成；目标生产转换、图运行验收和 baseline 不属于已完成事项。
