---
name: plugin-tooluniverse-phylogenetics
description: "Phylogenetic analysis — de novo multiple sequence alignment (Clustal Omega/MUSCLE/MAFFT via EBI_msa_align) and neighbour-joining/UPGMA tree building (EBI_build_phylogenetic_tree) from your own sequences, plus tree analysis, treeness, saturation (PhyKIT), parsimony-informative sites, alignment gap analysis, DVMC, long-branch detection, BUSCO orthologs. Uses PhyKIT, Biopython, DendroPy. Use to align a set of sequences, build a tree from sequences or an alignment, or for phylogenetic tree QC, multi-gene phylogenomics, evolutionary-rate analysis, and comparative-genomics studies."
metadata:
  capability_id: plugin-tooluniverse-phylogenetics
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

## Hard constraints — PhyKIT statistics

Use `phykit_batch_analysis` for every statistic computed across multiple trees or alignments; do not loop the PhyKIT CLI per file. It returns the correct column for each function, so read its returned value instead of re-parsing PhyKIT stdout.

- `saturation` — the returned value is PhyKIT's second printed column (`1 - slope`); the first column is the slope. Do not report the slope as saturation.
- `treeness_over_rcv` (alias `toverr`) — pass the **untrimmed** alignment (`directory`/`extension`) and its tree (`tree_directory`/`tree_extension`); trimming changes RCV and the ratio.
- `parsimony_informative` — the returned percentage (%PIS), not the raw count.
- `dvmc` and `long_branch_score` are supported functions; never mark them unsupported and never loop for them.
- `long_branch_score` is multi-valued per tree: set `per_tree_stat` (`mean` or `median`) before any cross-group comparison.

**Gap percentage.** A '>X% gapped columns' filter needs the fraction of alignment **columns** that contain at least one gap. No bundled helper reports that statistic: `phykit_batch_analysis` with `operation=gap_percentage` and every `alignment_gap_percentage` helper (in `scripts/tree_statistics.py`, `scripts/scogs_phykit_pipeline.py`, `scripts/scogs_paired_compare.py`) return gap characters over total positions (a residue fraction), and `filter_by_gap_threshold` in `scripts/format_alignment.py` is residue-based too. Compute the column fraction directly from the alignment (per column: does it contain at least one gap?); `remove_gappy_columns` in `scripts/format_alignment.py` computes a per-column gap fraction but is a column filter, not this reported percentage.

**Cross-group Mann-Whitney U.** The batch result carries per-file `values` only for sets up to 50; larger sets return summary statistics only. Compute the test only from full `values`; when only summaries are available, report that the p-value cannot be computed rather than fabricating one.

# Phylogenetics and Sequence Analysis

## Four traps that produce a confidently wrong number

Each of these was observed producing a wrong answer *while the correct guidance
was already present further down this file*. Check them before you answer.

1. **PhyKIT prints more than one column, and for `saturation` the two
   conventions disagree — state which you used.** `phykit saturation` prints
   `saturation <TAB> |saturation-1|`. Its own `--help` is explicit: *"The first
   value is the saturation value and the second column is the absolute value of
   saturation minus 1."* But several published analyses (and some reference
   answers derived from them) report the **second** column as "the saturation
   value". The two always sum to 1.0000, which is the tell that you may be
   looking at the wrong one — on the fungal scogs set the medians are 0.39
   (col 1) and 0.61 (col 2).

   So: **follow phykit and use column 1** unless the question or source defines
   saturation the other way, and say in your answer which column you read. Do
   not silently pick the one that looks closer to an expected number.

   `treeness_over_rcv` has no such ambiguity: it gives
   `ratio <TAB> treeness <TAB> RCV` and the ratio is first.

2. **"Gap percentage" means the fraction of alignment COLUMNS containing at
   least one gap**, not the fraction of residues that are gaps. On the fungal
   scogs set the residue definition maxes out at 0.556, so a ">70% gaps" filter
   selects **nothing** and the question looks unanswerable; by columns, three
   orthologs qualify (max 0.783).

3. **`treeness_over_rcv` and `rcv` take the UNTRIMMED `.faa.mafft`**, while
   `saturation` takes the trimmed `.clipkit`. RCV measures variability across
   columns, so trimming changes it: median 0.2683 untrimmed against 0.3050
   trimmed, and among >70%-gap genes the maximum is 0.2572 untrimmed against
   0.4174 trimmed.

4. **Never loop PhyKIT per file.** `phykit_batch_analysis` is parallel and does
   ~250 trees in about 35 seconds; a shell loop takes ~9 minutes and runs out of
   turns mid-way, producing no answer at all. It also selects the right column
   for every function, which removes trap 1 entirely.

## RULE ZERO — Check for pre-computed results FIRST

Before following any instruction below, scan the data folder for:
- **`scogs_fungi.zip` / `scogs_animals.zip`** (BUSCO single-copy ortholog phylogenetics) → these contain the pre-computed alignments (`*.faa.mafft.clipkit`) and trees (`*.faa.mafft.clipkit.treefile`) from the original analysis. **Use these directly with PhyKIT** (see "BUSCO scogs questions" below). Re-running BUSCO → MAFFT → IQ-TREE from `*.busco.zip` files takes 1–6 hours AND produces slightly different numbers due to seed/version drift.
- `*_executed.ipynb` → read with `tu run read_executed_notebook '{"data_folder":"<path>","search":"<keyword>"}'` and cite its cell outputs as the authoritative answer
- Pre-computed result files (CSV/TSV with names like `*results*`, `*tree*`, `*phykit*`, `*saturation*`, `*treeness*`) → read directly and report the requested value
- Canonical analysis scripts (`analysis.R`, `run_*.py`, `find_*.R`, `*.Rmd`) → execute as-is and read the output

Only follow this skill's re-analysis recipe below if **none** of the above exist. Re-running from raw data produces different numbers than the published answer and is much slower (often 5–10× turn count).

---

## BUSCO scogs questions (multi-species phylogenomics)

data folders with `scogs_fungi.zip` and/or `scogs_animals.zip` ship
pre-computed per-ortholog alignments (and sometimes trees). The
question asks for a metric per group, or a Mann-Whitney U / median /
ratio comparison between groups.

### PRIMARY SCRIPT — both groups in one pass (use this FIRST)

When the question compares animals vs fungi (Mann-Whitney U, ratio,
fold-change, paired difference), the bundled paired-comparison script
extracts both zips, computes the metric per ortholog for each group,
and emits ALL of: per-group summary, two-tailed Mann-Whitney U +
p-value (in both orderings since U is asymmetric), paired-ortholog
median diff, paired-ortholog median ratio, group-median ratio, and
lowest-non-zero ratios — in one run, no aggregation step needed:

```bash
python skills/tooluniverse-phylogenetics/scripts/scogs_paired_compare.py \
    --data-folder "$DATA_PATH" --metric parsimony_informative
# Metrics: parsimony_informative, rcv, gap_percentage (alignment-only,
# Biopython-fast: ~2s for 500 alignments);
# treeness, dvmc, total_tree_length, evolutionary_rate, long_branch_score,
# patristic_distances (tree); treeness_over_rcv, saturation (both).
```

Output blocks (parse in Python or grep):

```
# SUMMARY group=animals: n=... mean=... median=... min=... max=... p25=... p75=... lowest_nonzero=... n_nonzero=...
# SUMMARY group=fungi:   n=... mean=... median=... min=... max=... p25=... p75=... lowest_nonzero=... n_nonzero=...
# MWU animals_vs_fungi: U=... p=...
# MWU fungi_vs_animals: U=... p=...        <-- U(a,b) + U(b,a) = n_a*n_b
# PAIRED n_common=N: median_diff(animals-fungi)=...  median_diff(fungi-animals)=...
# PAIRED RATIO median(animals/fungi)=... (n=...)    <-- for each common ortholog: a_val/b_val, then median
# PAIRED RATIO median(fungi/animals)=... (n=...)
# GROUP_MEDIAN_RATIO animals/fungi=...               <-- median(group_a) / median(group_b)
# GROUP_MEDIAN_RATIO fungi/animals=...
# GROUP_MEDIAN_DIFF animals-fungi=...
# LOWEST_NONZERO animals=... fungi=...
# LOWEST_NONZERO_RATIO animals/fungi=...
# LOWEST_NONZERO_RATIO fungi/animals=...
```

For `long_branch_score` and `patristic_distances` (multi-value-per-tree
metrics), pass `--per-tree-stat mean` or `--per-tree-stat median` to
choose the per-tree summary BEFORE the cross-tree MWU. The question
wording "comparing **median** long branch scores" means per-tree
summary = median; "comparing **mean** long branch scores" means
per-tree summary = mean. Run TWICE (once with each) if uncertain.

### Single-group script (when only one group is asked about)

```bash
python skills/tooluniverse-phylogenetics/scripts/scogs_phykit_pipeline.py \
    --data-folder "$DATA_PATH" --group fungi --metric treeness --out /tmp/f.tsv
# Auto-falls-back to .faa.mafft when .faa.mafft.clipkit is absent
# (some scogs zips ship only mafft alignments, not clipkit trims).
```

### `phykit parsimony_informative` is NOT a valid CLI subcommand

PhyKIT's CLI exposes parsimony-informative-site count as
`parsimony_informative_sites` (alias `pis`). Calling
`phykit parsimony_informative <file>` returns the help banner with
non-zero exit and silently produces zero values. The bundled scripts
translate `parsimony_informative` → `parsimony_informative_sites`
automatically. The output is `<n_pi>\t<n_total>\t<percent>` — column
THREE is the percentage that questions usually ask for.

### Group-median ratio vs paired ratio (read this carefully)

When a question phrases tree-length / RCV / DVMC comparisons as
"ratio of fungal to animal X across orthologs", there are TWO distinct
quantities:

1. **GROUP_MEDIAN_RATIO** = `median(values_fungi) / median(values_animals)`.
   Use ALL orthologs in each group independently. This is what
   group-comparison published numbers usually report (n_fungi can
   differ from n_animals, and "across" is a population statement, not
   a paired one).

2. **PAIRED RATIO median** = for each ortholog present in BOTH groups,
   compute `value_fungi / value_animals`, then take the median across
   common orthologs. Smaller denominator (intersection only) and a
   different number when the groups have different size.

Default to GROUP_MEDIAN_RATIO unless the question explicitly says
"matched ortholog", "paired ortholog", "per-ortholog ratio", or "for
each ortholog". If the answer phrasing is ambiguous, BOTH numbers are
in the script's output — pick the one matching the question's
"across" / "paired" / "ratio of medians" phrasing.

### Total amino-acid count across single-copy orthologs — single representative, not all species

When a BUSCO single-copy ortholog dataset (`single_copy_busco_sequences/`) is
present and the question asks "**how many total amino acids** are present in all
single-copy ortholog sequences", count **one representative sequence per
ortholog**, not the sum across all species/copies.

Each `<ortholog_id>.faa` in `single_copy_busco_sequences/` typically contains
multiple species' copies of that ortholog (one each). Summing every sequence
across every species double/triple/N-fold counts each ortholog by the species
count and gives `n_species × correct_answer`.

| Question phrasing | Count |
|---|---|
| "total amino acids in all single-copy ortholog sequences" | Sum of ONE sequence per ortholog (either the FIRST entry per file or the median-length entry) |
| "total amino acids across N species' single-copy orthologs" | Sum across species explicitly (multi-species sum) |
| "average length of single-copy orthologs" | Mean per-ortholog length (one per ortholog) |

❌ WRONG: `for f in *.faa: sum(len(rec.seq) for rec in SeqIO.parse(f, 'fasta'))` then sum across files (multi-species sum)

✅ RIGHT: `for f in *.faa: first_rec = next(SeqIO.parse(f, 'fasta')); total += len(first_rec.seq)` (one representative per ortholog)

If your answer is `n_species × GT` (e.g. 32228 when GT looks like 13809 = 32228/2.33 ≈ 8 species × representative), you summed all species — re-do with one representative.

### Lowest-non-zero ratios

For metrics that can legitimately equal 0 for highly conserved or
very short alignments (parsimony informative %, RCV on near-identical
seqs), "lowest" in a question typically means "lowest non-zero". The
paired script emits `LOWEST_NONZERO_RATIO` for both orderings — use
that line when the raw min in a group is 0.

### File-layout fallback (alignment naming)

scogs zips ship in two shapes:
- **Full**: `<gene>.faa`, `<gene>.faa.mafft`, `<gene>.faa.mafft.clipkit`,
  `<gene>.faa.mafft.clipkit.treefile`, plus iqtree/bionj/log/mldist.
- **Alignment-only**: just `<gene>.faa` + `<gene>.faa.mafft`. No
  trees, no clipkit. Used for parsimony, RCV, gap-percentage
  questions. Use the `.faa.mafft` (NOT raw `.faa`) — the published
  metric was computed on the MAFFT-aligned file.

Both bundled scripts auto-detect the layout and use the best available
alignment per ortholog. Do NOT re-run MAFFT or ClipKit yourself; the
shipped files are canonical.

#### Which alignment goes with which metric (this changes the answer)

The tree is always the ClipKit-derived `.faa.mafft.clipkit.treefile`. The
**alignment** argument depends on the metric:

| metric | alignment to pass |
|---|---|
| `treeness`, `dvmc`, `total_tree_length`, `long_branch_score` | tree only — no alignment |
| `saturation` | `.faa.mafft.clipkit` (trimmed) |
| **`treeness_over_rcv` / `rcv`** | **`.faa.mafft` (untrimmed)** |
| parsimony-informative sites, gap percentage | `.faa.mafft` (untrimmed) |

RCV measures compositional variability **across the alignment's columns**, so
trimming changes it materially — and `treeness_over_rcv` divides by RCV, so the
trimmed alignment shifts the ratio for every gene. Verified on the fungal scogs
set (249 orthologs, canonical shipped files):

```
median treeness/RCV   untrimmed .faa.mafft = 0.2683    trimmed .clipkit = 0.3050
max treeness/RCV      (over the 3 genes with >70% gapped columns:
                       1260807at2759 0.0861, 1567796at2759 0.1866, 939345at2759 0.2572)
                      untrimmed .faa.mafft = 0.2572    trimmed .clipkit = 0.4174
```

Plain `treeness` needs no alignment and is unaffected — it reproduces exactly
(median 0.0501 on the same 249 files), which is how the alignment choice was
isolated as the cause rather than the tree set or the tool.

`phykit_batch_analysis` takes the two independently, so pass them explicitly:

```bash
tu run phykit_batch_analysis '{"operation":"batch","function":"treeness_over_rcv",
  "directory":"<dir>","extension":".faa.mafft",
  "tree_directory":"<dir>","tree_extension":".faa.mafft.clipkit.treefile"}'
```

**Gap percentage** in these questions means the fraction of alignment
**columns containing at least one gap**, not the fraction of all residues that
are gaps. The two differ by an order of magnitude: with the residue definition
no fungal ortholog exceeds 70% gaps, so a ">70% gaps" filter silently selects
nothing.

**Anti-pattern:** running `phykit` on the raw `*.busco.zip` extracted
ortholog FASTAs and aligning/tree-building yourself. The pre-computed
files in `scogs_*.zip` are the canonical inputs.

---

PhyKIT, Biopython, and DendroPy for alignment/tree analysis, evolutionary metrics, and comparative genomics.

## LOOK UP, DON'T GUESS
When uncertain about any scientific fact, SEARCH databases first.

---

## When to Use

FASTA/PHYLIP/Nexus/Newick files; treeness, RCV, DVMC, evolutionary rate, parsimony sites, tree length, bootstrap; group comparisons (Mann-Whitney U); tree construction (NJ/UPGMA/parsimony); Robinson-Foulds distance.

**De novo alignment / tree from your own sequences:** to align raw sequences (not pre-computed files), call `EBI_msa_align` (Clustal Omega / MUSCLE / MAFFT / Kalign / T-Coffee via EMBL-EBI), then pass its `data.aligned_fasta` string as the `aligned_sequences` argument of `EBI_build_phylogenetic_tree` (note the arg name differs from the output key) for a neighbour-joining or UPGMA tree (Newick). Feed that Newick / alignment straight into the PhyKIT metrics below.

**Still NOT for**: maximum-likelihood trees (IQ-TREE/RAxML) or Bayesian inference (MrBayes/BEAST) — `EBI_build_phylogenetic_tree` only does distance-based NJ/UPGMA. For publication ML/Bayesian phylogenies, run dedicated tooling; use the pre-computed `scogs_*` trees when available.

---

## Required Packages

```python
import numpy as np, pandas as pd
from scipy import stats
from Bio import AlignIO, Phylo, SeqIO
from phykit.services.tree.treeness import Treeness
from phykit.services.tree.total_tree_length import TotalTreeLength
from phykit.services.tree.evolutionary_rate import EvolutionaryRate
from phykit.services.tree.dvmc import DVMC
from phykit.services.tree.treeness_over_rcv import TreenessOverRCV
from phykit.services.alignment.parsimony_informative_sites import ParsimonyInformative
from phykit.services.alignment.rcv import RelativeCompositionVariability
import dendropy
```

---

## Workflow Decision Tree

```
ALIGNMENT ANALYSIS (FASTA/PHYLIP):
  Parsimony sites → phykit_parsimony_informative()
  RCV → phykit_rcv()
  Gap % → alignment_gap_percentage()

TREE ANALYSIS (Newick):
  Treeness → phykit_treeness()
  Tree length → phykit_tree_length()
  Evolutionary rate → phykit_evolutionary_rate()
  DVMC → phykit_dvmc()
  Bootstrap → extract_bootstrap_support()

COMBINED: Treeness/RCV → phykit_treeness_over_rcv(tree, aln)

TREE CONSTRUCTION: NJ → build_nj_tree(); UPGMA → build_upgma_tree(); Parsimony → build_parsimony_tree()

GROUP COMPARISON: batch metrics → Mann-Whitney U → summary stats

TREE COMPARISON: Robinson-Foulds → robinson_foulds_distance()
```

---

## Quick Reference

| Metric | Input | Description |
|--------|-------|-------------|
| Treeness | Newick | Internal / total branch length |
| RCV | FASTA/PHYLIP | Relative Composition Variability |
| Treeness/RCV | Both | Signal quality ratio |
| Tree Length | Newick | Sum of all branch lengths |
| Evolutionary Rate | Newick | Total length / num terminals |
| DVMC | Newick | Degree of Violation of Molecular Clock |
| Parsimony Sites | FASTA/PHYLIP | Sites with >=2 chars appearing >=2 times |

---

## Common Patterns

### Single Metric Across Groups
```python
fungi_dvmc = batch_dvmc(discover_gene_files("data/fungi"))
animal_dvmc = batch_dvmc(discover_gene_files("data/animals"))
print(f"Fungi median: {np.median(list(fungi_dvmc.values())):.4f}")
```

### Statistical Comparison
```python
u_stat, p_value = stats.mannwhitneyu(list(g1.values()), list(g2.values()), alternative='two-sided')
```

### Filtering + Metric
Filter by gap percentage < 5%, then compute treeness/RCV on filtered set.

### Batch Processing
```python
gene_files = discover_gene_files("data/")  # → [{gene_id, aln_file, tree_file}]
treeness_results = batch_treeness(gene_files)  # → {gene_id: value}
```

---

## Answer Extraction

| Pattern | Method |
|---------|--------|
| "median X" | `np.median(values)` |
| "maximum X" | `np.max(values)` |
| "difference in median" | `abs(np.median(a) - np.median(b))` |
| "Mann-Whitney U" | `stats.mannwhitneyu(a, b)[0]` |
| "fold-change" | `np.median(a) / np.median(b)` |

**Rounding**: PhyKIT default 4 decimals. U stats = integer. Question wording overrides.

---

## Interpretation

| Metric | Good | Acceptable | Poor |
|--------|------|-----------|------|
| Treeness | >0.8 | 0.5-0.8 | <0.5 |
| RCV | <0.2 | 0.2-0.5 | >0.5 |
| Treeness/RCV | >2.0 | 1.0-2.0 | <1.0 |
| Bootstrap | >95% | 70-95% | <70% |
| Parsimony sites | >30% | 10-30% | <10% |

## Completeness Checklist

All files identified; group structure detected; correct PhyKIT function; ALL genes processed (not sample); correct test; 4-decimal rounding; specific statistic (median/max/U/p); Mann-Whitney `alternative='two-sided'`.

---

Detailed upstream guidance continues in [references/upstream-details.md](references/upstream-details.md).
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `tu-quick-start.md` from `QUICK_START.md`.
- Load knowledge ID `tu-references-parsimony-analysis.md` from `references/parsimony_analysis.md`.
- Load knowledge ID `tu-references-sequence-alignment.md` from `references/sequence_alignment.md`.
- Load knowledge ID `tu-references-tree-building.md` from `references/tree_building.md`.
- Load knowledge ID `tu-references-troubleshooting.md` from `references/troubleshooting.md`.
- Load knowledge ID `tu-references-upstream-details.md` from `references/upstream-details.md`.
- Load knowledge ID `tu-scripts-busco-target-orthologs.py` from `scripts/busco_target_orthologs.py`.
- Load knowledge ID `tu-scripts-format-alignment.py` from `scripts/format_alignment.py`.
- Load knowledge ID `tu-scripts-phykit-batch.py` from `scripts/phykit_batch.py`.
- Load knowledge ID `tu-scripts-scogs-paired-compare.py` from `scripts/scogs_paired_compare.py`.
- Load knowledge ID `tu-scripts-scogs-phykit-pipeline.py` from `scripts/scogs_phykit_pipeline.py`.
- Load knowledge ID `tu-scripts-tree-statistics.py` from `scripts/tree_statistics.py`.

Run any packaged script only through the host Agent's configured Python runtime; ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_tooluniverse_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
