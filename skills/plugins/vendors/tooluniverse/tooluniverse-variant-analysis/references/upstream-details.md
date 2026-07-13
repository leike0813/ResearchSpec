# tooluniverse-variant-analysis detailed guidance

## Common Use Patterns

```python
# Quick summary
report = variant_analysis_pipeline("input.vcf", output_file="report.md")

# Filtered analysis
report = variant_analysis_pipeline("input.vcf",
    filters=FilterCriteria(min_vaf=0.1, min_depth=20, pass_only=True))

# Annotated report (top 50 variants with ClinVar/gnomAD/CADD)
report = variant_analysis_pipeline("input.vcf", annotate=True, max_annotate=50)
```

**pandas vs python_implementation**: Use python_implementation for parsing/classification/annotation, then convert to DataFrame for custom aggregations:

```python
vcf_data = parse_vcf("input.vcf")
passing, _ = filter_variants(vcf_data.variants, criteria)
df = variants_to_dataframe(passing, sample="TUMOR")
```

---

## Limitations

- **VCF annotation required for mutation classification**: If VCF has no ANN/CSQ/FUNCOTATION in INFO, mutation types will be "unknown" until ToolUniverse annotation is applied
- **Multi-allelic variants**: Parser takes first ALT allele for type classification
- **ToolUniverse annotation rate**: API-based, limited to ~100 variants per batch by default to respect rate limits
- **gnomAD tool**: Returns basic metadata only (not full allele frequencies); use MyVariant.info for gnomAD AF
- **Large VCFs**: Pure Python parser streams line-by-line; cyvcf2 is recommended for files with >100K variants

---

## Reference Documentation

- **references/vcf_filtering.md**: Complete filter options and examples
- **references/mutation_classification_guide.md**: Detailed mutation type classification rules
- **references/annotation_guide.md**: ToolUniverse annotation workflows with examples
- **references/sv_cnv_analysis.md**: Complete SV/CNV interpretation workflow

---

## Additional Resources

- **Primary scripts** (use these FIRST — see top of this file):
  - `scripts/gatk_haplotypecaller_pipeline.py` — BWA + HaplotypeCaller + SNP/indel counter
  - `scripts/coding_variant_filter.py` — per-sample exome variant counter with intronic/UTR exclusion
  - `scripts/variant_fraction.py` — VAF + coding-denominator fraction calculator
- General-purpose scripts: `scripts/parse_vcf.py`, `scripts/filter_variants.py`, `scripts/annotate_variants.py`
- Quick start recipes and MCP examples: `QUICK_START.md`

---

## Analysis Conventions

### Multi-row Excel headers (trio / CHIP variant tables)
Clinical variant export spreadsheets often have **2-row headers** (a category row like `Variant Info` / `Flags` / `Father (185-PF)` / `RefSeq Genes 110, NCBI` above a sub-label row like `Chr:Pos` / `Variant Allele Freq` / `Sequence Ontology (Combined)`). Parse with `pd.read_excel(path, header=[0,1])` and address columns via tuples, e.g. `df[('Father (185-PF)', 'Variant Allele Freq')]`. A single-row header leaves sub-columns as `Unnamed:_N` and silently misses VAF / Sequence Ontology data.

### "Fraction of variants annotated as X" — denominator is coding variants

When a question asks what fraction of variants at some VAF / filter threshold are annotated with a Sequence Ontology term (e.g., `synonymous_variant`), the denominator is the **CODING subset**, not "all variants" (which is dominated by intronic records).

```python
CODING = {
    "synonymous_variant", "missense_variant", "splice_region_variant",
    "stop_gained", "stop_lost", "start_lost",
    "frameshift_variant", "inframe_insertion", "inframe_deletion",
}
NON_CODING = {  # explicitly excluded
    "intron_variant", "3_prime_UTR_variant", "5_prime_UTR_variant",
    "upstream_gene_variant", "downstream_gene_variant", "intergenic_variant",
}
```

Note `splice_region_variant` IS coding (affects coding sequence at splice boundaries) — include it.

❌ WRONG: `count(VAF<0.3 AND synonymous) / count(VAF<0.3)` — denominator pollutes with intronic/UTR
✅ RIGHT: `count(VAF<0.3 AND synonymous) / count(VAF<0.3 AND CODING)` — denominator restricted to coding

Filter via `df[df['Sequence Ontology (Combined)'].isin(CODING)]`, NOT by excluding `NON_CODING` labels — the latter over-counts because some labels (e.g. `5_prime_UTR_premature_start_codon_gain_variant`) aren't in either set.

**Sanity**: synonymous variants are typically about half of coding variants in human exomes. If your "synonymous fraction" is much lower than ~0.4, your denominator likely still includes intronic/UTR — restrict to CODING and recompute.

Bundled tool: `tu run coding_variant_fraction '{"file":"variants.xlsx","vaf_threshold":0.3,"annotation":"synonymous_variant","header_rows":2}'` — handles 2-row headers and the CODING allowlist automatically.
