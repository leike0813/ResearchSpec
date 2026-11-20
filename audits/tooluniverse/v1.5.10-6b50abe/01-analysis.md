# ToolUniverse Extension Anchor Analysis — v1.5.10

- upstream: https://github.com/mims-harvard/ToolUniverse
- revision: `6b50abef032a702554e2b34a4f592ee674f12f8f`
- upstream content files: 10013
- upstream tree SHA-256: `def99a86cf82ad3a394d4518003646bddedb49069088158090603c3a8e238b9c`
- immutable audit SHA-256: `bf4aa5ea284cb33ec5cc4bcb6bf3ab22b30fea60d5fcf06504dd0e26463b9911`
- advisory vendor bundle SHA-256: `bd13201c0c912ba9c377b338502b3e9330aa218b8c576b60bc3334a00898c0a9`

增量路径、工具声明变化、逐能力原文与新增 Skill 决策见 [artifacts/upstream-delta.json](artifacts/upstream-delta.json) 和 [artifacts/upstream-analysis.md](artifacts/upstream-analysis.md)。实际生成后的语义判定见 [05-semantic-review.md](05-semantic-review.md)。

## Upstream Inventory

| top-level area | files |
|---|---|
| .agents | 1 |
| .claude-plugin | 1 |
| .env.template | 1 |
| .gitattributes | 1 |
| .githooks | 3 |
| .github | 19 |
| .gitignore | 1 |
| .pre-commit-config.yaml | 1 |
| Dockerfile | 1 |
| LICENSE | 1 |
| PRIVACY.md | 1 |
| README.md | 1 |
| benchmarks | 9 |
| docs | 1389 |
| examples | 256 |
| mcpb | 9 |
| plugin | 632 |
| plugins | 617 |
| pyproject.toml | 1 |
| pytest.ini | 1 |
| scripts | 36 |
| server.json | 1 |
| setup_precommit.sh | 1 |
| skills | 809 |
| src | 4750 |
| tests | 1467 |
| uv.lock | 1 |
| web | 2 |

| extension | files |
|---|---|
| (none) | 14 |
| .R | 3 |
| .a3m | 2 |
| .backup | 4 |
| .bat | 1 |
| .cc | 1 |
| .cif | 1 |
| .css | 6 |
| .csv | 2 |
| .doctree | 47 |
| .fasta | 5 |
| .ini | 2 |
| .jpg | 6 |
| .js | 2 |
| .json | 853 |
| .jsonl | 1 |
| .lock | 34 |
| .md | 1624 |
| .nxml | 18 |
| .pdb | 6 |
| .pdf | 2 |
| .png | 5 |
| .po | 1014 |
| .py | 5879 |
| .rst | 237 |
| .sh | 15 |
| .svg | 2 |
| .template | 68 |
| .toml | 37 |
| .tsv | 1 |
| .txt | 53 |
| .vcf | 6 |
| .xlsx | 1 |
| .yaml | 47 |
| .yml | 14 |

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
| `tooluniverse-acmg-variant-classification` | `plugin-tooluniverse-acmg-variant-classification` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-admet-prediction` | `plugin-tooluniverse-admet-prediction` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-adverse-event-detection` | `plugin-tooluniverse-adverse-event-detection` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-adverse-outcome-pathway` | `plugin-tooluniverse-adverse-outcome-pathway` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-aging-senescence` | `plugin-tooluniverse-aging-senescence` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-antibody-engineering` | `plugin-tooluniverse-antibody-engineering` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-binder-discovery` | `plugin-tooluniverse-binder-discovery` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-cancer-classification` | `plugin-tooluniverse-cancer-classification` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-cancer-genomics-tcga` | `plugin-tooluniverse-cancer-genomics-tcga` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-cancer-variant-interpretation` | `plugin-tooluniverse-cancer-variant-interpretation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-cell-line-profiling` | `plugin-tooluniverse-cell-line-profiling` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-chemical-compound-retrieval` | `plugin-tooluniverse-chemical-compound-retrieval` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-chemical-safety` | `plugin-tooluniverse-chemical-safety` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-chemical-sourcing` | `plugin-tooluniverse-chemical-sourcing` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-clinical-data-integration` | `plugin-tooluniverse-clinical-data-integration` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-clinical-guidelines` | `plugin-tooluniverse-clinical-guidelines` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-clinical-risk-scoring` | `plugin-tooluniverse-clinical-risk-scoring` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-clinical-trial-design` | `plugin-tooluniverse-clinical-trial-design` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-clinical-trial-matching` | `plugin-tooluniverse-clinical-trial-matching` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-comparative-genomics` | `plugin-tooluniverse-comparative-genomics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-computational-biophysics` | `plugin-tooluniverse-computational-biophysics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-crispr-screen-analysis` | `plugin-tooluniverse-crispr-screen-analysis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-data-integration-analysis` | `plugin-tooluniverse-data-integration-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-data-wrangling` | `plugin-tooluniverse-data-wrangling` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-dataset-discovery` | `plugin-tooluniverse-dataset-discovery` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-diagnostic-test-evaluation` | `plugin-tooluniverse-diagnostic-test-evaluation` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-disease-research` | `plugin-tooluniverse-disease-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-dose-response` | `plugin-tooluniverse-dose-response` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-drug-interaction` | `plugin-tooluniverse-drug-drug-interaction` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-mechanism-research` | `plugin-tooluniverse-drug-mechanism-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-regulatory` | `plugin-tooluniverse-drug-regulatory` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-repurposing` | `plugin-tooluniverse-drug-repurposing` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-research` | `plugin-tooluniverse-drug-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-synergy` | `plugin-tooluniverse-drug-synergy` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-drug-target-validation` | `plugin-tooluniverse-drug-target-validation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-ecology-biodiversity` | `plugin-tooluniverse-ecology-biodiversity` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-electron-microscopy` | `plugin-tooluniverse-electron-microscopy` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-enzyme-kinetics` | `plugin-tooluniverse-enzyme-kinetics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-epidemiological-analysis` | `plugin-tooluniverse-epidemiological-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-epigenomics` | `plugin-tooluniverse-epigenomics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-epigenomics-chromatin` | `plugin-tooluniverse-epigenomics-chromatin` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-expression-data-retrieval` | `plugin-tooluniverse-expression-data-retrieval` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-fastq-qc` | `plugin-tooluniverse-fastq-qc` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-functional-genomics-screens` | `plugin-tooluniverse-functional-genomics-screens` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gene-disease-association` | `plugin-tooluniverse-gene-disease-association` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gene-enrichment` | `plugin-tooluniverse-gene-enrichment` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gene-regulatory-networks` | `plugin-tooluniverse-gene-regulatory-networks` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gpcr-structural-pharmacology` | `plugin-tooluniverse-gpcr-structural-pharmacology` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gwas-drug-discovery` | `plugin-tooluniverse-gwas-drug-discovery` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gwas-finemapping` | `plugin-tooluniverse-gwas-finemapping` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gwas-snp-interpretation` | `plugin-tooluniverse-gwas-snp-interpretation` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gwas-study-explorer` | `plugin-tooluniverse-gwas-study-explorer` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-gwas-trait-to-gene` | `plugin-tooluniverse-gwas-trait-to-gene` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-hla-immunogenomics` | `plugin-tooluniverse-hla-immunogenomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-image-analysis` | `plugin-tooluniverse-image-analysis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-immune-repertoire-analysis` | `plugin-tooluniverse-immune-repertoire-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-immunology` | `plugin-tooluniverse-immunology` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-immunotherapy-response-prediction` | `plugin-tooluniverse-immunotherapy-response-prediction` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-infectious-disease` | `plugin-tooluniverse-infectious-disease` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-inorganic-physical-chemistry` | `plugin-tooluniverse-inorganic-physical-chemistry` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-kegg-disease-drug` | `plugin-tooluniverse-kegg-disease-drug` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-lipidomics` | `plugin-tooluniverse-lipidomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-literature-deep-research` | `plugin-tooluniverse-literature-deep-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-mendelian-randomization` | `plugin-tooluniverse-mendelian-randomization` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-meta-analysis` | `plugin-tooluniverse-meta-analysis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-metabolomics` | `plugin-tooluniverse-metabolomics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-metabolomics-analysis` | `plugin-tooluniverse-metabolomics-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-metabolomics-pathway` | `plugin-tooluniverse-metabolomics-pathway` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-metagenomics-analysis` | `plugin-tooluniverse-metagenomics-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-microbial-genome-characterization` | `plugin-tooluniverse-microbial-genome-characterization` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-microbiome-research` | `plugin-tooluniverse-microbiome-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-model-organism-genetics` | `plugin-tooluniverse-model-organism-genetics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-molecular-cloning` | `plugin-tooluniverse-molecular-cloning` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-multi-omics-integration` | `plugin-tooluniverse-multi-omics-integration` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-multiomic-disease-characterization` | `plugin-tooluniverse-multiomic-disease-characterization` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-natural-product-dereplication` | `plugin-tooluniverse-natural-product-dereplication` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-network-pharmacology` | `plugin-tooluniverse-network-pharmacology` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-neuroscience` | `plugin-tooluniverse-neuroscience` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-noncoding-rna` | `plugin-tooluniverse-noncoding-rna` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-organic-chemistry` | `plugin-tooluniverse-organic-chemistry` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-pathway-disease-genetics` | `plugin-tooluniverse-pathway-disease-genetics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-peptide-target-deorphanization` | `plugin-tooluniverse-peptide-target-deorphanization` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-pharmacogenomics` | `plugin-tooluniverse-pharmacogenomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-pharmacokinetics` | `plugin-tooluniverse-pharmacokinetics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-pharmacovigilance` | `plugin-tooluniverse-pharmacovigilance` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-phewas` | `plugin-tooluniverse-phewas` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-phylogenetics` | `plugin-tooluniverse-phylogenetics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-plant-genomics` | `plugin-tooluniverse-plant-genomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-polygenic-risk-score` | `plugin-tooluniverse-polygenic-risk-score` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-population-genetics` | `plugin-tooluniverse-population-genetics` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-population-genetics-1000genomes` | `plugin-tooluniverse-population-genetics-1000genomes` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-precision-medicine-stratification` | `plugin-tooluniverse-precision-medicine-stratification` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-precision-oncology` | `plugin-tooluniverse-precision-oncology` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-primer-design` | `plugin-tooluniverse-primer-design` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-product-safety-surveillance` | `plugin-tooluniverse-product-safety-surveillance` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-interactions` | `plugin-tooluniverse-protein-interactions` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-lof-mechanism` | `plugin-tooluniverse-protein-lof-mechanism` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-modification-analysis` | `plugin-tooluniverse-protein-modification-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-sae-variant-interpretation` | `plugin-tooluniverse-protein-sae-variant-interpretation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-structural-annotation-pdb` | `plugin-tooluniverse-protein-structural-annotation-pdb` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-structure-prediction` | `plugin-tooluniverse-protein-structure-prediction` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-structure-retrieval` | `plugin-tooluniverse-protein-structure-retrieval` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-protein-therapeutic-design` | `plugin-tooluniverse-protein-therapeutic-design` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-proteomics-analysis` | `plugin-tooluniverse-proteomics-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-proteomics-data-retrieval` | `plugin-tooluniverse-proteomics-data-retrieval` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-rare-disease-diagnosis` | `plugin-tooluniverse-rare-disease-diagnosis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-rare-disease-genomics` | `plugin-tooluniverse-rare-disease-genomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-regulatory-genomics` | `plugin-tooluniverse-regulatory-genomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-regulatory-variant-analysis` | `plugin-tooluniverse-regulatory-variant-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-residue-functional-mechanism-interpretation` | `plugin-tooluniverse-residue-functional-mechanism-interpretation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-rnaseq-deseq2` | `plugin-tooluniverse-rnaseq-deseq2` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-sequence-analysis` | `plugin-tooluniverse-sequence-analysis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-sequence-retrieval` | `plugin-tooluniverse-sequence-retrieval` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-single-cell` | `plugin-tooluniverse-single-cell` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-small-molecule-discovery` | `plugin-tooluniverse-small-molecule-discovery` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-spatial-omics-analysis` | `plugin-tooluniverse-spatial-omics-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-spatial-transcriptomics` | `plugin-tooluniverse-spatial-transcriptomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-statistical-modeling` | `plugin-tooluniverse-statistical-modeling` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-stem-cell-organoid` | `plugin-tooluniverse-stem-cell-organoid` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-structural-proteomics` | `plugin-tooluniverse-structural-proteomics` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-structural-variant-analysis` | `plugin-tooluniverse-structural-variant-analysis` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-systems-biology` | `plugin-tooluniverse-systems-biology` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-target-research` | `plugin-tooluniverse-target-research` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-toxicology` | `plugin-tooluniverse-toxicology` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-vaccine-design` | `plugin-tooluniverse-vaccine-design` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-variant-analysis` | `plugin-tooluniverse-variant-analysis` | mixed | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-variant-functional-annotation` | `plugin-tooluniverse-variant-functional-annotation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-variant-interpretation` | `plugin-tooluniverse-variant-interpretation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-variant-predictor-dms-validation` | `plugin-tooluniverse-variant-predictor-dms-validation` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |
| `tooluniverse-variant-to-mechanism` | `plugin-tooluniverse-variant-to-mechanism` | llm | tooluniverse-brief-validator | scope, source_ledger, method_plan, work_products, validation_results, conclusions |

## Decisions

- [x] 上游身份固定为 `v1.5.10` @ `6b50abef032a702554e2b34a4f592ee674f12f8f`。
- [x] 130 个 reviewed vendor-bundle Skills 一对一映射为 130 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 130 个 capability 使用统一 evidence-bound brief validator；所有 reviewed 资源按原相对路径逐字节打包为 knowledge refs。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
