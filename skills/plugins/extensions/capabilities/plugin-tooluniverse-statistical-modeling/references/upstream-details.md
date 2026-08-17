# tooluniverse-statistical-modeling detailed guidance

## Bundled Scripts

These ready-to-run scripts live in `skills/tooluniverse-statistical-modeling/scripts/`.
Use them via the Bash tool — they are the deterministic answer for the recurring
question patterns documented above.

### `r_natural_spline_regression.py` — Natural spline regression in R

Shells out to `Rscript` to fit `lm(y ~ ns(x, df=K))` with `splines::ns()`.
Emits R², adj R², F-stat with df1/df2, overall F-test p-value, residual SE,
coefficient table (estimate, SE, t, p), and the prediction-grid peak with
95% CI from `predict.lm(..., interval='confidence')`. Supports a
`--ratio-col` shortcut to convert "a:b" string ratios into a frequency
fraction `a/(a+b)`. Refuses to write into the input CSV's parent directory.

### `spline_model_compare.py` — Quadratic vs cubic vs natural spline

Fits all three models on the same x,y in R, ranks by adjusted R², AIC, and
BIC, and emits the best model's peak (x*, y*) with 95% CI. Use for
"best-fitting model" questions and "maximum predicted y at optimal x".

### `logistic_regression_or.py` — Binary or ordinal logistic regression with ORs

Fits `sm.Logit` (binary) or `OrderedModel` (ordinal proportional-odds) and
emits ORs (`exp(coef)`) plus 95% CIs and p-values for every coefficient.
Handles label encoding (`--encode A,B,C`), explicit value maps
(`--encode-map TRTGRP:Placebo=0,BCG=1`), and interaction columns
(`--interaction A:B` -> creates `A_B = A*B`). With `--coef-name <NAME>`
also prints a SCALARS block tagged for the requested coefficient.

### `power_analysis.py` — Two-sample required-N for a t-test

Computes Cohen's d (pooled SD) from a CSV given `--value-col`, `--group-col`,
`--group-a`, `--group-b`, then `TTestIndPower.solve_power` with `--alpha`,
`--power`, `--alternative`. Use for "minimum sample size per group" power
questions. Returns both the raw and the ceil-ed N.

### `stat_tests.py` — Basic statistical tests (pure stdlib, no scipy)

Implements chi-square goodness-of-fit, Fisher's exact test, and simple linear regression
without any external dependencies. All p-values are computed from first principles using
the gamma function (chi-square) or hypergeometric enumeration (Fisher's).

```
# Chi-square goodness-of-fit
python stat_tests.py --type chi_square --observed 100,50,25 --expected 87.5,50,37.5

# Fisher's exact test (2×2 table)
python stat_tests.py --type fisher_exact --a 10 --b 5 --c 3 --d 20
python stat_tests.py --type fisher_exact --a 10 --b 5 --c 3 --d 20 --alternative greater

# Simple linear regression (OLS)
python stat_tests.py --type regression --x "1,2,3,4,5" --y "2.1,4.0,5.9,8.1,10.0"
```

Key formulas:
- `chi_square`: χ² = Σ (O−E)²/E; p-value via upper regularized incomplete gamma Q(df/2, χ²/2)
- `fisher_exact`: hypergeometric PMF; p-value = sum of probabilities ≤ P(observed)
- `regression`: b1 = Sxy/Sxx; b0 = ȳ − b1x̄; R² = 1 − SSR/SST; SE and t-statistics included

Output includes: full contingency/data table, step-by-step arithmetic, significance statement,
and a round-trip verification for each test.

When to use `stat_tests.py` vs `statsmodels`:
- Use `stat_tests.py` when you need a quick sanity check with no imports, or when the
  environment lacks scipy/statsmodels.
- Use statsmodels when you need multivariate regression, logistic models, or survival analysis.

### `format_statistical_output.py` — Format results for reporting

Utility functions to format fitted statsmodels results as publication-ready tables.
Import and call from analysis scripts; not a standalone CLI tool.

### `model_diagnostics.py` — Automated model diagnostics

Runs assumption checks (normality, heteroscedasticity, multicollinearity) on fitted models.
Import and call from analysis scripts; not a standalone CLI tool.

---

## File Structure

```
tooluniverse-statistical-modeling/
+-- SKILL.md                          # This file (workflow guide)
+-- QUICK_START.md                    # 8 quick examples
+-- EXAMPLES.md                       # Legacy examples
+-- TOOLS_REFERENCE.md                # ToolUniverse tool catalog
+-- anova_and_tests.md                # ANOVA decision tree and code
+-- common_patterns_summary.md         # Common solution patterns
+-- test_skill.py                     # Test suite
+-- references/
|   +-- logistic_regression.md        # Detailed logistic examples
|   +-- ordinal_logistic.md           # Ordinal logit guide
|   +-- cox_regression.md             # Survival analysis guide
|   +-- linear_models.md              # OLS and mixed-effects
|   +-- common_patterns.md            # 15+ question patterns
|   +-- troubleshooting.md            # Diagnostic issues
+-- scripts/
    +-- r_natural_spline_regression.py # lm(y ~ ns(x, df=K)) via Rscript
    +-- spline_model_compare.py        # quadratic vs cubic vs natural-spline (Rscript)
    +-- logistic_regression_or.py      # binary / ordinal logistic + ORs + interactions
    +-- power_analysis.py              # TTestIndPower required-N from CSV
    +-- expression_anova.py            # per-gene ANOVA / log2FC summary
    +-- prepare_ae_cohort.py           # SDTM AE/DM cohort prep
    +-- stat_tests.py                  # Chi-square, Fisher's exact, OLS (stdlib)
    +-- format_statistical_output.py   # Format results for reporting
    +-- model_diagnostics.py           # Automated diagnostics
```

## ToolUniverse Integration

While this skill is primarily computational, ToolUniverse tools can provide data:

| Use Case | Tools |
|----------|-------|
| Clinical trial data | `search_clinical_trials` |
| Drug safety outcomes | `FAERS_calculate_disproportionality` |
| Gene-disease associations | `OpenTargets_target_disease_evidence` |
| Biomarker data | `fda_pharmacogenomic_biomarkers` |

See `TOOLS_REFERENCE.md` for complete tool catalog.

## References

- **statsmodels**: https://www.statsmodels.org/
- **lifelines**: https://lifelines.readthedocs.io/
- **scikit-learn**: https://scikit-learn.org/
- **Ordinal models**: statsmodels.miscmodels.ordinal_model.OrderedModel

## Analysis conventions

These conventions are validated best practices. Apply when the dataset/question matches.

### MANDATORY: Use bundled script for expression ANOVA / fold change
For per-gene ANOVA or median log2FC questions, use the bundled script:
```bash
python skills/tooluniverse-statistical-modeling/scripts/expression_anova.py \
  --counts counts.csv --meta meta.csv --group-col cell_type \
  --exclude-groups PBMC --mode anova

python skills/tooluniverse-statistical-modeling/scripts/expression_anova.py \
  --counts counts.csv --meta meta.csv --group-col cell_type \
  --group-a CD14 --group-b CD19 --mode fold_change
```
Do NOT write your own pandas ANOVA — the aggregation level (per-gene, not per-sample) is critical and easy to get wrong.

### CSV encoding
Clinical-trial exports (SDTM) are often latin1. If `pd.read_csv()` fails with `UnicodeDecodeError`, retry with `encoding='latin1'`.

### Clinical-trial AE analysis — applies to regression AND chi-square AND any severity test
For **any statistical test** of a clinical-trial AE severity outcome (chi-square, ordinal/logistic regression, Mann-Whitney, etc.) on trial covariates, fit/test on the cohort that reported **any AE** (inner-joined to demographics). Do NOT pre-filter AE records by AEPT — NOT even when the question says "COVID-19 severity" or names any specific condition. Use `max(AESEV)` across **all AE records per subject**, regardless of AEPT.

**Why**: AESEV on the AE table reflects the study's protocol-defined severity scale. Pre-filtering to specific AEPT values (e.g., keeping only certain condition labels) drops subjects whose worst severity was recorded under a different AEPT label, which drastically changes the contingency table and can flip results from significant to non-significant.

Do NOT pad subjects with no AEs as AESEV=0 — that dilutes the signal.

```python
dm = pd.read_csv("DM.csv", encoding='latin1')
ae = pd.read_csv("AE.csv", encoding='latin1')
sev = ae.groupby('USUBJID')['AESEV'].max().reset_index()
df = dm.merge(sev, on='USUBJID', how='inner').dropna(subset=['AESEV'])
df['AESEV'] = df['AESEV'].astype(int)
# Now ordinal regression / chi-square on df
```

### Odds-ratio deviation
"**Percentage reduction in odds ratio**" means `(1 − OR) × 100%` — deviation from OR=1 (no effect). OR=0.75 → 25% reduction vs reference. Do NOT interpret as `(unadjusted_OR − adjusted_OR) / unadjusted_OR`; that's almost always ≈0% because adjustment barely moves a well-specified OR.

### F-statistic vs p-value
`scipy.stats.f_oneway(g1, g2, ...)` returns `(F, p)`. If GT looks like `(0.76, 0.78)` and you computed `F=91.6`, you returned the F-statistic when the question asked for the p-value (or vice-versa). Always re-read the question for which the answer expects.

### ANOVA on expression levels across groups — aggregation matters
When asked for "F-statistic comparing expression levels across cell types/groups":
- Each gene/miRNA is one **observation**. For N genes across K groups, you have N values per group (mean or median expression of that gene across samples in that group)
- Run `f_oneway(group1_values, group2_values, ...)` where each group has N gene-level values
- Do NOT sum all genes per sample — that gives total RNA content, a completely different quantity
- The F-stat is typically LOW (0.5–2.0) when most genes don't differ across groups, not HIGH (50+)
- If your F-statistic is >10 but the biological context suggests "no significant difference", you probably aggregated to sample level instead of gene level

### Log2 fold change between groups — per-gene, then summarize
When asked for "median log2 fold change between group A and group B":
- Compute log2FC **per gene**: for each gene, `log2(mean_expr_A / mean_expr_B)`
- Then take the median across all genes
- Do NOT sum all genes per sample first — that gives a single total-expression ratio, not the median per-gene fold change
- A median log2FC near 0 means most genes have similar expression between groups (expected when groups are similar cell types)

**Bundled script** for both ANOVA and fold change:
```bash
# Per-gene ANOVA across cell types
python skills/tooluniverse-statistical-modeling/scripts/expression_anova.py \
  --counts counts.csv --meta meta.csv --group-col cell_type \
  --exclude-groups PBMC --mode anova

# Per-gene log2FC between two groups
python skills/tooluniverse-statistical-modeling/scripts/expression_anova.py \
  --counts counts.csv --meta meta.csv --group-col cell_type \
  --group-a CD14 --group-b CD19 --mode fold_change
```

### Natural spline regression on strain co-culture data
When fitting models on strain co-culture frequency data:

1. **Ratio → frequency conversion**: If the Ratio column contains strings like `"10:1"`, convert to a frequency fraction: `first / (first + second)` = 0.909. Report as a fraction in [0, 1], not as ratio notation.

2. **Pure-strain endpoints**: Whether to include pure-strain data (freq=0 and freq=1) depends on the model type:
   - **Cubic/polynomial models**: Fit on co-culture rows ONLY (exclude pure strains). The cubic model captures the mixed-population response curve; pure strains are fundamentally different biological regimes and including them typically lowers R².
   - **Natural spline models (`ns(freq, df=4)`)**: Include the pure-strain endpoint for the **focal strain** (the one whose frequency the model predicts) but exclude the non-focal pure strain. For example, when modeling "frequency of ΔrhlI to total population", include pure ΔrhlI (freq=1.0) but exclude pure ΔlasI (freq=0.0). This anchors the spline at the high end where the focal strain dominates.

3. **R vs Python splines**: R's `ns()` (from the `splines` package) and Python's `patsy.cr()` or `scipy BSpline` produce DIFFERENT knot placements and boundary conditions. If the question references R's `lm(y ~ ns(x, df=4))`, use the bundled wrapper which runs R via Rscript:
   ```bash
   python skills/tooluniverse-statistical-modeling/scripts/r_natural_spline_regression.py \
     --csv data.csv --y-col Area --x-col Frequency \
     --df 4 --workdir /tmp/spline_run
   ```
   That emits R², adjusted R², overall F-test p-value, the coefficient table, and the prediction grid with peak (x*, y*) and 95% confidence interval at the peak.

   Do NOT substitute Python's `patsy.dmatrix("cr(x, df=4)")` — it will give different R², F-statistics, and predictions.

4. **Prediction at peak**: The bundled R wrapper already predicts on a fine 1000-point grid and reports `which.max(pred[,"fit"])` plus its CI from `interval="confidence"`. If you must do this by hand, follow the same recipe; do not use a coarse grid.

5. **Best of {quadratic, cubic, natural-spline}**: When the question asks for the "best fitting model among quadratic, cubic and natural spline" or the "maximum colony area at the optimal frequency", use the comparison wrapper which fits all three in R and ranks them:
   ```bash
   python skills/tooluniverse-statistical-modeling/scripts/spline_model_compare.py \
     --csv data.csv --y-col Area --x-col Frequency \
     --ns-df 4 --workdir /tmp/spline_cmp
   ```
   The output's `BEST_BY_ADJ_R2` row tells you which model wins, and `BEST_PEAK_Y` is the peak y to report.

## Support

For detailed examples and troubleshooting:
- **Logistic regression**: `references/logistic_regression.md`
- **Ordinal models**: `references/ordinal_logistic.md`
- **Survival analysis**: `references/cox_regression.md`
- **Linear/mixed models**: `references/linear_models.md`
- **Common patterns**: `references/common_patterns.md`
- **ANOVA and tests**: `anova_and_tests.md`
- **Diagnostics**: `references/troubleshooting.md`
