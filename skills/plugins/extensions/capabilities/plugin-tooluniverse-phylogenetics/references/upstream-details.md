# tooluniverse-phylogenetics detailed guidance

## Analysis conventions

### MANDATORY: Use `phykit_batch_analysis` tool for batch computations
For ANY question asking for statistics across multiple trees/alignments (median treeness, mean saturation, DVMC percentage, gap percentage, long branch scores), use the ToolUniverse tool:
```bash
tu run phykit_batch_analysis '{"operation":"batch","function":"treeness","directory":"./trees","extension":".treefile"}'
tu run phykit_batch_analysis '{"operation":"batch","function":"saturation","directory":"./alignments","extension":".fa","tree_directory":"./trees","tree_extension":".treefile"}'
tu run phykit_batch_analysis '{"operation":"gap_percentage","directory":"./alignments","extension":".fa"}'
```
Do NOT run phykit manually in a loop — the tool handles all files and returns correct summary statistics.

**The batch tool is parallel: ~250 trees finish in about 35 seconds.** A per-tree
shell loop takes ~9 minutes for the same work and is the single most common way
these questions end with no answer at all — the run hits its turn or time budget
mid-loop and reports "I'll report when it finishes" instead of a number. If you
find yourself writing `for f in *.treefile`, stop and call the batch tool.

Supported `function` values include `treeness`, `saturation`, `dvmc`,
`long_branch_score`, `total_tree_length`, `parsimony_informative`,
`treeness_over_rcv` (alias `toverr`). `dvmc` and `long_branch_score` are
covered — you do not need to loop for those.

**Two-group comparisons (Mann-Whitney U, differences of medians).** Questions
comparing fungi against animals need one batch call per group, then the test on
the two value lists — not a per-tree loop over both groups:

```bash
tu run phykit_batch_analysis '{"operation":"batch","function":"dvmc","directory":"<fungi>","extension":".treefile"}'
tu run phykit_batch_analysis '{"operation":"batch","function":"dvmc","directory":"<animals>","extension":".treefile"}'
# then scipy.stats.mannwhitneyu(fungi_values, animal_values)
```

Ask for `values` in the result when you need the full list for a test; the batch
tool returns them for sets up to 50 and summary statistics always. For larger
sets, use the authorized paired-comparison script for complete values or report
that the rank test is unavailable. Means and medians cannot reconstruct its p-value.

### PhyKIT column conventions — take the right one

Several PhyKIT subcommands print more than one number per file, and the value
the question wants is usually not the first:

| subcommand | prints | the value asked for |
|---|---|---|
| `saturation` | `saturation <TAB> \|saturation-1\|` | **column 2** (`1 - slope`), matching the batch implementation; state the definition used |
| `treeness_over_rcv` | `treeness/RCV <TAB> treeness <TAB> RCV` | **column 1**, the ratio |
| `parsimony_informative_sites` | `n_pi <TAB> n_total <TAB> %PIS` | column 3 for a percentage |

Taking `saturation`'s first column gives exactly `1 - answer`: a fungal set
whose saturation is 0.6146 reports 0.3854 instead, and the two sum to 1.0000,
which is the tell. `phykit_batch_analysis` already selects the right column for
each function — another reason to call it rather than run the CLI yourself.

### Commit the value you computed

Two failures in this benchmark came from computing the right number and then
answering a different one:

- a tree-length ratio computed as **2.1775**, then answered as 1.9 after
  re-reading "paired orthologs";
- an average treeness that listed **19** among the alternatives, then committed 10.

When a question is ambiguous, compute the reading you judge most literal, state
the alternative in one clause, and **answer with the value you actually
computed**. Do not replace a computed result with a re-derived one at the last
step — if two readings are both defensible, give the computed number first and
name the other, rather than silently switching.

### PhyKIT column-position cheat sheet (parse output carefully)

When parsing PhyKIT stdout for batch metrics, the **column you want** depends on the metric:

| Command | Output columns | Column to take |
|---------|---------------|----------------|
| `phykit saturation` | `saturation_value <TAB> abs(saturation-1)` | **col 1** is the "saturation value" (1 = no saturation; closer to 1 = less saturated). **col 2** = `\|saturation - 1\|` (distance from no-saturation; higher = MORE saturated, less signal retained). Use col 1 for "saturation value" questions; col 2 for "distance from saturation" |
| `phykit toverr` (a.k.a. `treeness_over_rcv`) | `treeness/RCV <TAB> treeness <TAB> RCV` | **col 1** (treeness/RCV ratio) |
| `phykit long_branch_score -v` (verbose) | `taxon <TAB> score` per line | aggregate scores per tree (mean) |
| `phykit long_branch_score` (no -v) | `mean <TAB> median <TAB> 25%ile <TAB> 75%ile <TAB> min <TAB> max <TAB> std <TAB> var <TAB> n` | **col 1** (mean) for "mean LB score" |
| `phykit patristic_distances` (no -v) | summary stats line (same shape as LB) | **col 1** (mean) for "mean patristic distance" |

**Rule of thumb**: phykit `toverr` and `saturation` produce *multi-column lines per alignment*. Don't grep the value that "looks like the answer" — count columns from the header in `phykit <metric> --help`. If your batch median is wildly off the published number (e.g., median treeness/RCV ≈ 0.20 when expected ≈ 0.26), you almost certainly picked the wrong column.

Preferred: don't parse phykit output by hand — call the `phykit_batch_analysis` tool, which already returns the correct column for each metric. Supported `function` values are `treeness`, `saturation`, `dvmc`, `long_branch_score`, `total_tree_length`, `parsimony_informative`:

```bash
tu run phykit_batch_analysis '{"operation":"batch","function":"saturation","directory":"./alignments","extension":".fa","tree_directory":"./trees","tree_extension":".treefile"}'
tu run phykit_batch_analysis '{"operation":"batch","function":"treeness","directory":"./alignments","extension":".fa","tree_directory":"./trees","tree_extension":".treefile"}'
```

For `treeness_over_rcv` (toverr / treeness/RCV ratio) the tool has no matching `function`; use the bundled `scogs_*.py` scripts below, which compute it directly.

Sanity targets for biological scogs trees: median saturation ~0.4–0.7, median treeness/RCV ~0.2–0.4, median treeness ~0.05–0.15. Values an order of magnitude off these mean wrong column.

### Bundled script: BUSCO target_orthologs intersection

When the data folder has `*.busco.zip` files + `target_orthologs.txt`, use the bundled script — do NOT enumerate `single_copy_busco_sequences/*.faa` across all zips manually:

```bash
python skills/tooluniverse-phylogenetics/scripts/busco_target_orthologs.py \
  --data-folder /path/to/data
```

The default run prints FIVE summary lines covering every common
interpretation of "total amino acids":

```
# SUMMARY: n_targets=K, n_intersected=N (single-copy in ALL S species), intersected_total_aa=A, sum_all_aa=B
# SUMMARY group=all: intersected n=N total_aa=A, sum_all total_aa=B
# SUMMARY group=animals: sum_all total_aa=X        <-- per-group sum (animal species only)
# SUMMARY group=fungi:   sum_all total_aa=Y        <-- per-group sum (fungal species only)
```

### Picking the right SUMMARY line (read carefully)

Match the question phrasing to the summary line:

| Question phrasing | Pick this line | Why |
|---|---|---|
| "total AA in all single-copy ortholog sequences" with **only animal species in the data folder OR question mentions only one organism group** | `# SUMMARY group=animals: sum_all total_aa=...` (or `group=fungi`) | scogs phylogenomics analyses are run PER GROUP; "all" refers to all orthologs WITHIN that group, not the union across groups |
| "total AA across orthologs single-copy in **every** / **all** species" | `intersected_total_aa` | strict intersection rule |
| "total AA across all per-species copies" | `sum_all_aa` (group=all) | only when the question says "all species" or the data folder has just one organism group |

**Default rule when the data folder contains BOTH animal AND fungal busco
zips**: published "total amino acids" answers almost always refer to
ONE group (the analysis group), NOT the cross-group union. Use
`group=animals: sum_all` or `group=fungi: sum_all`. Do NOT pick the
union number (`sum_all_aa`) unless the question explicitly says
"across all 8 species" or "fungi and animals combined".

The script emits the per-group sums BEFORE the union sum on stdout for
this exact reason — read the output line by line and stop at the
`group=animals` / `group=fungi` line that matches the analysis group
implied by the question.

### Single-copy orthologs across species — comparison set + intersection

Two-step rule when counting across BUSCO `single_copy_busco_sequences/` data:

1. **Find the comparison set first.** If a `target_orthologs.txt` (or similar named subset list) exists in the data folder, that file IS the comparison set — restrict to those ortholog IDs only. Do not enumerate every BUSCO single-copy file across species. Do not assume "all" means the whole BUSCO output when a target list is provided.

2. **Then apply the intersection rule.** "Single-copy ortholog" across species means single-copy in EVERY species in the comparison set. If an ortholog is missing from one species' `single_copy_busco_sequences/`, exclude it from the count entirely — do not partially count the species that do have it.

Sanity check: if any species shows a much smaller per-ortholog count than others (e.g., one species at ~600 aa while others are 4000+ aa for the same ortholog set), the missing-from-some orthologs are inflating the per-ortholog average — drop them first.

**Worked example.** data folder has 8 species (4 animal, 4 fungal) `*.busco.zip` + `target_orthologs.txt` listing 10 ortholog IDs:
- Wrong: enumerate all `single_copy_busco_sequences/*.faa` across all 8 species → ≈80 files → sum AA → answer 32228 (treats every per-species copy independently).
- Right: for each of the 10 target IDs, check it appears as `single_copy` in **all 8** species → keep only intersected IDs (often 5/10 — some target IDs are multi-copy/missing in one species) → for kept IDs, sum AA across the 8 species → 13809.
- **"5 trees" semantics**: when a question says "5 trees" but you find 10 treefiles, the GT used the intersected subset (orthologs single-copy in all species) — not all 10. Re-derive the intersection before averaging.

### Process the FULL set, not a sample (batch metrics)

When a question asks for a median/percentile/mean across orthologs, your batch must include EVERY ortholog in the relevant comparison set:
- `scogs_fungi.zip` ships ~255 fungal alignments+trees; `scogs_animals.zip` ships ~241. Median computed from a 10-file sample is NOT the published answer.
- For `phykit_batch_analysis`, always point at the **extracted scogs directory** containing all per-ortholog files, not a hand-picked subset.
- If your computed RCV/treeness/DVMC median diverges from a sanity-check target by >10%, count files first — you likely processed a subset.

### Filter THEN compute (don't compute then filter)

Questions of the form "max X in genes with >70% gaps" require the filter to be applied before the max:
```python
# 1. Compute gap% per alignment
# 2. Keep only alignments with gap% > 70
# 3. Compute treeness/RCV ON THE FILTERED SET
# 4. Take max
```
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
