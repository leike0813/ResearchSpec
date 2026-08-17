# tooluniverse-phylogenetics detailed guidance

Computing the metric across all genes and then taking max returns the global max, which is wrong.

### Animals vs fungi — long branch score aggregation

PhyKIT's `long_branch_score -v` outputs per-taxon LB scores (one row
per leaf in the tree). For per-tree summaries:
1. Per-tree: run `phykit long_branch_score -v <tree>` → list of
   per-taxon scores.
2. Per-tree summary: collapse to ONE number per tree using either
   the **mean** or the **median** of those per-taxon scores.
3. Per-group summary: aggregate per-tree numbers (median/mean/MWU U +
   p-value).

**Match the per-tree summary to the question phrasing:**

| Question says... | Use `--per-tree-stat ...` |
|---|---|
| "mean long branch scores" | `mean` |
| "median long branch scores" | `median` |
| "average long branch score" (ambiguous) | run BOTH and pick the one matching numbers/units |

The bundled `scogs_paired_compare.py --metric long_branch_score
--per-tree-stat {mean,median}` does steps 1+2 for both groups in one
pass and emits the cross-group MWU U + p-value directly.

Common error: averaging the four animal species and four fungal
species directly without going through the per-tree step — this
conflates species LB and ortholog LB and yields the wrong delta.

### Treeness/RCV: use the right input file

`phykit toverr` (a.k.a. `treeness_over_rcv`) takes BOTH alignment and tree. Use the **trimmed** alignment (`*.faa.mafft.clipkit`) paired with its **treefile** (`*.faa.mafft.clipkit.treefile`), not the raw `.faa.mafft`. ClipKit-trimmed alignments are what produced the canonical tree, so the RCV must be computed on the same trimmed alignment for the ratio to match published numbers.

### Parsimony informative sites
- Exclude **gap-only columns** before counting — a column that is all gaps is not informative.
- A site is parsimony informative when ≥2 different non-gap characters each appear in ≥2 taxa.
- Use Biopython `AlignIO` or the AMAS tool to iterate columns and count.

### Treeness (RCV ratio)
Treeness = sum of internal branch lengths / total tree length. Internal branches are those that do not lead to a leaf (tip).

### PhyKIT usage
PhyKIT (`pip install phykit`) provides command-line functions for tree and alignment statistics. Common functions:
- `phykit treeness <tree_file>` — outputs treeness (RCV) value
- `phykit saturation <alignment_file> -t <tree_file>` — outputs saturation value
- `phykit dvmc <tree_file>` — degree of violation of the molecular clock
- `phykit long_branch_score <tree_file>` — long-branch score (LBS)
- `phykit alignment_length <alignment_file>` — alignment length
- `phykit parsimony_informative <alignment_file>` — count parsimony informative sites

When running PhyKIT on multiple gene trees/alignments, **use the bundled batch script**:

```bash
# Treeness across all trees
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir scogs_fungi --function treeness --ext .treefile --stat median

# Saturation with paired alignment+tree
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir alignments --function saturation --tree-dir trees \
  --ext .fa --tree-ext .treefile --stat median

# Long branch score (mean per tree, then median across trees)
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir trees --function long_branch_score --ext .treefile \
  --per-tree-stat mean --stat median

# DVMC
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir trees --function dvmc --ext .treefile --stat all

# Gap percentage across all alignments
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir alignments --function gap_percentage --ext .fa

# Evolutionary rate (median across trees)
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir trees --function evolutionary_rate --ext .treefile --stat median

# Mean patristic distance per tree, then mean across trees
python skills/tooluniverse-phylogenetics/scripts/phykit_batch.py \
  --dir trees --function patristic_distances --ext .treefile --stat mean
```

**Preferred: use the `phykit_batch_analysis` ToolUniverse tool** instead of running PhyKIT manually:
```bash
# Via CLI
tu run phykit_batch_analysis '{"operation":"batch","function":"treeness","directory":"/path/to/trees","extension":".treefile"}'

# Via SDK
tu.run_one_function({"name": "phykit_batch_analysis", "arguments": {"operation": "batch", "function": "saturation", "directory": "/path/to/alignments", "extension": ".fa", "tree_directory": "/path/to/trees"}})

# Gap percentage
tu run phykit_batch_analysis '{"operation":"gap_percentage","directory":"/path/to/alignments","extension":".fa"}'
```

Key rules:
1. **Process ALL files** — don't stop at a subset. The tool handles this automatically
2. **Gap percentage**: total gaps / total positions across all alignments (not per-file average)
3. **Long branch score**: each tree produces per-taxon scores → summarize per tree (mean) → then summarize across trees (median). Use `"per_tree_stat":"mean"`
4. **Fungi vs animal comparisons**: match genes by ortholog ID (filename stem), not by file order. Run the tool on each organism's directory separately, then compare medians

## References

`references/sequence_alignment.md`, `references/tree_building.md`, `references/parsimony_analysis.md`, `scripts/tree_statistics.py`
- PhyKIT: https://jlsteenwyk.com/PhyKIT/
- Biopython Phylo: https://biopython.org/wiki/Phylo
- DendroPy: https://dendropy.org/
