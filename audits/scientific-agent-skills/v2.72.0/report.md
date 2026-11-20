# Scientific Agent Skills v2.72.0 Source Audit

Source: [Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) at immutable revision `526ebce143bc326f44471554e33d66a19c840360` (release `v2.72.0`). The JSON audit records source observations and review evidence; it does not establish production eligibility.

The source inventory covers 177 Skills, 2,025 Skill-tree files and 21,303,142 bytes. Of these, 172 are candidates and five are excluded at the audit scope level. Ten records remain blocked for review. The inventory reports 176 Skills with references, 121 with scripts (522 script files), and 43 with assets. Categories, per-Skill resource counts, license evidence, and ANZSRC Field codes are recorded in `skill-audit.json`.

Compared with v2.70.0, this revision adds 14 Skills and removes `docx`, `pdf`, `pptx` and `xlsx`. The four removed Skills were excluded in the prior audit. Existing hard authority exclusions are retained where scope remains equivalent; the five current exclusions are `arbor`, `autoskill`, `fictiv`, `get-available-resources` and `pi-agent`. Deleted Skill relationships are absent. The 14 new Skills and their Fields and source-level review recommendations are described in `new-candidate-review.md`; those recommendations do not decide production admission.

## Security evidence

The historical upstream report is `docs/security-report.json`, generated `2026-09-28T09:31:50+00:00`. Its 162 stored scan rows retain their prior content hashes and total 658 findings; no new scan was run. The report has no row for 15 current Skills: the 14 additions and `fictiv`. The audit preserves historical severity and finding counts for scanned Skills and marks missing rows as unreported. Its 155 tabulated Skill findings sum to the per-Skill records; 28 are critical and four high. Scanner labels are observations, not safety or admission decisions. The manual source reviews and confirmed maintainer decisions are recorded in the accompanying review files and `artifacts/maintainer-decisions.json`.

## Audit limits

The audit inventories source resources without executing upstream or scientific scripts. Content-license status is per Skill and does not cover separately licensed runtime packages, databases, or fixtures unless its evidence says so. ANZSRC Fields are classification metadata only. Findings and recommendations describe source evidence and review state; production policies and admission decisions remain separate.

## Review records

- [Incremental source and admission record](artifacts/incremental-review.json)
- [Candidate inventory](artifacts/source-inventory.json) and [new candidate review](new-candidate-review.md)
- [Maintainer actions](artifacts/maintainer-decisions.json) and [supplemental security review](manual-security-supplement.md)
- [New local analysis review](manual-security-new-local.md) and [new analysis review](manual-security-new-analysis.md)

## Production license reconciliation

The upstream README identifies each Skill's license declaration as controlling. The reviewed production bundle records 50 MIT, ten Apache-2.0, seven BSD-3-Clause and one Matplotlib-licensed Skill. The standard texts are supplied under `LICENSES/`. The linked upstream texts are retained from Matplotlib blob `ec51537db27dd4d9c9ed3cd39fd96485f3cfddea` and SymPy blob `68911b22b5d974019fd781220a87a9e2e13c210f`. The pacsomatic package uses the Skill's own MIT notice. Each extension carries the same license and attribution as its raw Skill.
