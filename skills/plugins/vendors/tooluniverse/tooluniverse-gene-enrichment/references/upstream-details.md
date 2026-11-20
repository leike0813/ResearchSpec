# tooluniverse-gene-enrichment detailed guidance

## Detailed Documentation

All detailed examples, code blocks, and advanced topics have been moved to `references/`:

- **references/ora_workflow.md** - Complete ORA examples with all databases
- **references/gsea_workflow.md** - Complete GSEA workflow with ranked lists
- **references/enrichr_guide.md** - All 225+ Enrichr libraries and usage
- **references/cross_validation.md** - Multi-source validation strategies
- **references/id_conversion.md** - Gene ID disambiguation and conversion
- **references/tool_parameters.md** - Complete tool parameter reference
- **references/organism_support.md** - Organism-specific configurations
- **references/common_patterns.md** - Detailed use case examples
- **references/troubleshooting.md** - Complete troubleshooting guide
- **references/multiple_testing.md** - Correction methods (BH, Bonferroni, BY)
- **references/report_template.md** - Standard report format

Helper scripts (PRIMARY — see top of file for full usage):
- **scripts/gseapy_enrichment_runner.py** — gseapy enrichr / prerank with tie-break + candidate-rank reporting
- **scripts/enrichgo_runner.py** — clusterProfiler enrichGO + simplify (raw and simplified frames side-by-side)
- **scripts/condition_enrichment_screen.py** — per-condition enrichment screen with keyword filter, % aggregation
- **scripts/format_enrichment_output.py** — markdown formatter for ORA/GSEA results

---

## Analysis conventions

### Tool choice: R clusterProfiler vs gseapy
- **Prefer R clusterProfiler** when the dataset folder contains an `analysis.R` / `find_*.R` script that uses `enrichGO`/`simplify`. Use **`scripts/enrichgo_runner.py`** (see top of file).
- `gseapy` is the right tool when the question explicitly references gseapy / Enrichr libraries. Use **`scripts/gseapy_enrichment_runner.py`**.
- enrichGO + `simplify(cutoff=0.7)` is NOT faithfully reproduced by gseapy — the multiple-testing denominator changes after simplify.

Required R packages: `clusterProfiler`, `org.Hs.eg.db`, `enrichplot`, `DESeq2`. Install via:
```bash
Rscript skills/evals/install_r_packages.R
```

### Simplify (`cutoff=0.7`) drops redundant terms — and changes p.adjust for kept terms
`clusterProfiler::simplify(ego, cutoff=0.7, by="p.adjust", select_fun=min)` removes redundant GO terms. **Critical: a term that survives simplification has a DIFFERENT p.adjust in the simplified table vs the raw `as.data.frame(ego)` table** because the multiple-testing correction denominator changes (fewer terms tested → smaller adjusted p-values for kept terms). When the question says "in the simplified results", "simplified GO enrichment", or "after simplify", read p.adjust from the **simplified** data frame (`as.data.frame(simplify(ego, cutoff=0.7))` or whichever object was assigned), NOT from the raw `ego`. The raw enrichGO p.adjust ≠ the simplified p.adjust for the same GO term.

If the question asks about a specific term (e.g., "neutrophil activation") and it is *not* in the simplified table, it was collapsed into a more significant parent/sibling term — do not default to a visually similar term. Inspect `as.data.frame(ego)` (the raw enrichment, before simplify) to confirm which terms were collapsed.

### Background universe matters
Some datasets provide an explicit background (e.g., `bg_ensembl.txt`, `gencode.v31.primary_assembly.genes.csv`). Use it as `universe=` to `enrichGO` — **do not substitute the DEG-tested genes as background**. Different backgrounds produce meaningfully different adjusted p-values.

### Pre-existing result CSVs vs executed notebooks
Dataset folders may contain pre-computed enrichment-result CSVs alongside the executed notebook. **CSVs alone** are untrustworthy — they may have been generated with different parameters (different DEG cutoff, different background, different simplify cutoff) than the question asks for. Treat plain CSVs as advisory.

**Executed notebooks are different**: an `*_executed.ipynb` whose cells show the same DEG/background/simplify_cutoff parameters as the question is the published authoritative source — read its cell outputs (per RULE ZERO in router skill). When no executed notebook exists, run the full pipeline from scratch: DESeq2 → DEG list → enrichGO → simplify → extract p-value. Use pre-existing `.R` scripts for their parameter choices, not their cached outputs.

---

## Resources

For network-level analysis: [tooluniverse-network-pharmacology](../tooluniverse-network-pharmacology/SKILL.md)
For disease characterization: [tooluniverse-multiomic-disease-characterization](../tooluniverse-multiomic-disease-characterization/SKILL.md)
For spatial omics: [tooluniverse-spatial-omics-analysis](../tooluniverse-spatial-omics-analysis/SKILL.md)
For protein interactions: [tooluniverse-protein-interactions](../tooluniverse-protein-interactions/SKILL.md)

gseapy documentation: https://gseapy.readthedocs.io/
PANTHER API: http://pantherdb.org/services/oai/pantherdb/
STRING API: https://string-db.org/cgi/help?sessionId=&subpage=api
Reactome Analysis: https://reactome.org/AnalysisService/
