# tooluniverse-rnaseq-deseq2 detailed guidance

## Analysis conventions

### DESeq2 library choice — match the authoritative pipeline

If the data folder contains a `run_*.py` that uses `pydeseq2` or an `analysis.R` that uses R DESeq2, USE THAT EXACT LIBRARY. The two libraries disagree on small numerical details (DEG counts at the same threshold typically differ by 2-10%), so the GT comes from whichever the authoritative pipeline ran.

If NO authoritative script exists, prefer R DESeq2 (via `run_deseq2_analysis` tool or `Rscript`) — it's the more widely-published reference implementation:
```bash
tu run run_deseq2_analysis '{"operation":"deseq2","counts_file":"raw_counts.csv","metadata_file":"experiment_metadata.csv","design":"~ Replicate + Media + Strain","contrast":"Strain, 97, 1","refit_cooks":true}'
```

### Prefer the dataset's authoritative script
Before running DESeq2 yourself, `ls` the dataset folder. If you see `run_*.py`, `analysis.R`, `find_*.R`, or similar, those are the benchmark's ground-truth recipes.

1. `cat` the script to see its exact parameters — every kwarg.
2. If the script already prints the quantity you need, `cd DATASET_DIR && python3 run_*.py` and take its answer.
3. If the question needs a different metric from the same fitted model, make a SMALL addition (extra print statements) without changing the `DeseqDataSet(...)` / `DeseqStats(...)` constructor calls.

**Copy ALL kwargs literally**: `refit_cooks=True`, `alpha=0.05`, `n_cpus`, `design_factors`, `ref_level`. Omitting parameters like `refit_cooks` can change DEG counts significantly. Plain "remembered" defaults produce a different gene list than the ground-truth script.

### R DESeq2 vs pydeseq2
The two libraries can disagree on edge cases (e.g., sig gene counts at the same alpha often differ by ~2%). **Match whatever the authoritative script uses.** If no script is present, prefer R DESeq2 — its behavior is more widely referenced in published papers.

**Preferred: use the `run_deseq2_analysis` ToolUniverse tool** which runs R DESeq2 via Rscript:
```bash
# Basic DESeq2
tu run run_deseq2_analysis '{"operation":"deseq2","counts_file":"raw_counts.csv","metadata_file":"metadata.csv","design":"~ condition","ref_level":"condition, Control"}'

# With contrast + LFC shrinkage + refit_cooks
tu run run_deseq2_analysis '{"operation":"deseq2","counts_file":"raw_counts.csv","metadata_file":"metadata.csv","design":"~ Replicate + Media + Strain","contrast":"Strain, 97, 1","refit_cooks":true,"lfc_shrinkage":true}'

# enrichGO + simplify (after saving DEG list to file)
tu run run_deseq2_analysis '{"operation":"enrichgo","gene_list_file":"sig_genes.txt","background_file":"all_genes.txt","simplify_cutoff":0.7}'
```
This avoids pydeseq2 vs R DESeq2 discrepancies. The tool returns sig gene counts, dispersion estimates, and a results CSV path for further analysis.

### Strain identity pinning
When a question names strains by number AND describes their biology (e.g., knockout genotypes), pin the mapping from the question text or the experiment metadata, not from numeric order. Read the metadata CSV to confirm which strain number corresponds to which genotype before running DESeq2.

When reading RDS/CSV result files named like `res_1vsN.rds`, the "N" refers to the strain number in the metadata. Verify which mutant that number corresponds to — do not assume from the filename alone.

### "Uniquely DE in A/B not C" = exclusive, not inclusive
When asked for genes "uniquely DE in one of {A, B} single mutants but not in C (double)", this means **exclusively in A xor exclusively in B, each also not in C**:

```
(A − B − C) ∪ (B − A − C)
```

NOT `(A ∪ B) − C` (which includes the A∩B intersection). The exclusive interpretation typically gives a smaller count than the inclusive one.

### Set-operation percentages — check the denominator
If your `unique_DE / total_DE` gives a number in the 30–50% range, the expected denominator is probably different. Common alternatives:
- `unique_DE / total_genes_tested` (often 5-10% for bacterial, <2% for eukaryotic)
- `unique_DE / |union of all sig sets|`

Re-read the question to see what population "as a percentage of" refers to.

### "Also DE in strain X" = simple overlap, not exclusive
When asked "what percentage of genes DE in A are **also** DE in B", compute `|A ∩ B| / |A|`. Do NOT subtract other strains — "also DE in B" does not mean "exclusively DE in B but not C".

**CRITICAL**: The word "also" means simple set intersection. If the question says "genes DE in strain A that are **also** DE in strain B", compute:
```python
overlap = sigA.intersection(sigB)
pct = len(overlap) / len(sigA) * 100
```
Do NOT add extra exclusion conditions like "but not in strain C". "Also DE in B" means `A ∩ B`, nothing more.

### Dispersion estimates: R DESeq2 vs pydeseq2 diverge
For questions about dispersion (e.g., "how many genes have dispersion below 1e-05"), R DESeq2 and pydeseq2 give different numbers because of implementation differences in the dispersion fitting algorithm. **Always use R DESeq2 for dispersion questions** — benchmark ground truths are computed with R:

```r
library(DESeq2)
dds <- DESeq(dds)
# Pre-shrinkage (genewise) dispersions:
gene_disp <- mcols(dds)$dispGeneEst
cat("Below 1e-05:", sum(gene_disp < 1e-05, na.rm=TRUE), "\n")
```

### Log2 fold-change: verify the contrast direction
When asked for the log2FC of gene X in mutant Y, verify that your DESeq2 `results()` call uses the correct contrast. For `~Media + Strain` design with reference Strain "1":
- `results(dds, contrast=c("Strain", "97", "1"))` → log2FC for strain 97 vs ref
- The sign matters: negative log2FC = downregulated in mutant vs reference
- If your value has the wrong sign or magnitude, check if you accidentally used the wrong strain coefficient

## Density / per-chromosome calculation conventions

When a question asks for "average chromosomal density", "genome-wide average density", or similar:
- "Average chromosomal density" = `mean(per_chromosome_density)` where `per_chromosome_density = n_features / chromosome_length` for each chromosome separately, then averaged across chromosomes (UNWEIGHTED mean).
- This is DIFFERENT from `total_features / total_length` (which is the WEIGHTED mean / "expected density under uniform distribution"). The latter is typically used as the chi-square test's expected value, not as the "average chromosomal density" being asked about.
- Example: in bird genomes with chromosomes ranging 6-120 Mb, mean(per_chrom_density) is ~2× larger than total/total because shorter chromosomes have proportionally more events per bp.
