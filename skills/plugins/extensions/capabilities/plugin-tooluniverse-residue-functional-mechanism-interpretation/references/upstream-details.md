# tooluniverse-residue-functional-mechanism-interpretation detailed guidance

(col, 0.5), 1, 0.5, facecolor=region_colors.get(a.get("region", "other"), "#cccccc"),
    ))
    if a.get("is_core"):
        ax_anno.add_patch(plt.Rectangle((col, 0.0), 1, 0.5, facecolor="black"))
ax_anno.set_xlim(0, len(positions))
ax_anno.set_ylim(0, 1)
ax_anno.set_yticks([0.25, 0.75])
ax_anno.set_yticklabels(["core", "region"])
ax_anno.set_xlabel("Residue position")

# Callout row — per-hotspot mechanism boxes linked to clusters by brackets
for cluster, mechanism, top_features in hotspot_results:
    cluster_cols = [positions.index(p) for p in cluster if p in positions]
    if not cluster_cols:
        continue
    c_left, c_right = min(cluster_cols), max(cluster_cols)
    center = (c_left + c_right) / 2
    ax_heat.plot([c_left, c_right + 1], [0, 0], "k-", lw=2)
    label_lines = [f"MECHANISM: {mechanism}"] + [f"  {fl}" for fl in top_features[:3]]
    ax_callouts.text(center, 0.5, "\n".join(label_lines),
                     ha="center", va="center", fontsize=7,
                     bbox=dict(facecolor="white", edgecolor="black"))
    ax_callouts.plot([center, center], [0, -0.3], "k-", lw=0.5)
ax_callouts.set_xlim(0, len(positions))
ax_callouts.set_ylim(0, 1)
ax_callouts.axis("off")

fig.colorbar(im, ax=ax_heat, label="DMS effect (ΔΔG kcal/mol)")
plt.savefig("dms_hotspots_annotated.png", dpi=200, bbox_inches="tight")
```

**Three cell-color rules to get right:**
- Real measurement → diverging colour
- WT cell → boxed (the black outline above), value-cell colour = centre
- Not measured → distinct colour (e.g. light grey, not white — white reads
  as "neutral" against the diverging palette)

**Long proteins**: for >300 residues, split into multiple horizontal panels
(one panel per domain) rather than shrinking column width — the per-residue
detail disappears below ~3 pixels per column.

**Reproducing a published panel**: verify *its* track alignment before
treating it as ground truth. Published DMS panels do carry registration
errors (the KRAS Fig 1i in the original paper is shifted +2 relative to its
own sequence — see `tooluniverse-protein-structural-annotation-pdb` pitfalls).

---

## Interpretation table — what the mechanism call means downstream

| Mechanism | Implication |
|---|---|
| **catalytic** | Direct enzyme function — mutations abolish activity |
| **ligand-binding** | Substrate / cofactor / ion / nucleotide binding — mutations alter substrate specificity or affinity |
| **interface** | Protein-protein interaction surface — mutations may disrupt complex formation (consider PPI inhibitor design) |
| **structural-core** | Fold stability — mutations destabilize protein (consider rescuing with chaperones; harder to drug) |
| **PTM** | Regulation site (phospho, acetyl, ubiquitin, glycosylation) — mutations alter signaling rather than activity |
| **regulatory** | Allosteric site / autoinhibitory residue — mutations bias conformational equilibrium |
| **mixed** | Multiple evidence types disagree — needs case-by-case analysis |
| **unknown** | No mechanism could be assigned — possibly novel function or wrong reference structure |

---

## Honest limitations

1. **Wrong PDB → wrong call**. If your PDB doesn't include the relevant ligand
   or partner, the structural evidence layer is blind to that mechanism. Pick
   the structure that contains the right complex.
2. **UniProt annotations are sparse for non-model proteins**. Active sites are
   well-curated for canonical enzymes; novel proteins may have no annotated
   features and the skill falls back to structural + SAE only.
3. **Single-position clusters limit statistical evidence**. Descriptive
   ranking still works but permutation p-values can't (n=1).
4. **SAE feature labels are interpretive hints, not ground truth**. Labels
   come from how features activate across UniRef90, not per-protein expert
   curation. Treat "category: ligand-binding" as a hypothesis weight, not a
   proof.
5. **Hotspots ≠ druggable sites**. A catalytic residue is a critical residue
   but not necessarily a good drug target (allosteric pockets often are
   better). This skill explains why a residue is critical, not whether it's a
   good target.
6. **The mechanism call is a synthesis of evidence, not a measurement**.
   Don't quote the category as a fact — quote the evidence and the call as a
   reasoned conclusion.

---

## Cross-references

| Tool / Skill | Role |
|---|---|
| `MaveDB_get_effect_matrix` | DMS matrix input |
| `tooluniverse-protein-structural-annotation-pdb` (or `Structure_annotate_per_residue` directly) | Structural evidence |
| `UniProt_get_function_by_accession` | UniProt features (active sites, binding sites, PTMs, disulfides) |
| `ESM_get_region_sae_features` | Step 4 Path A — aggregate SAE features over a contiguous cluster in 1 Forge call (preferred) |
| `ESM_get_sae_features` | Step 4 Path B — only if you already have a precomputed full DMS SAE tensor |
| `ESM_describe_sae_feature` | Label SAE features in Step 4 |
| `tooluniverse-variant-predictor-dms-validation` | Sibling skill: validate a predictor before trusting its scores |
| (heatmap visualization is now Step 7 of this skill) | annotated DMS panel with per-hotspot callouts |
| `alphafold_get_prediction` | pLDDT context if no experimental PDB available |
