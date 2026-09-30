import assert from "node:assert/strict";
import { test } from "node:test";

import { adaptReviewedContent } from "../src/vendor-converters/tooluniverse/semantic-adaptations.js";

const adapt = (content: string, skillId = "tooluniverse-pharmacovigilance", relativePath = "TOOLS_REFERENCE.md"): string =>
  adaptReviewedContent(skillId, relativePath, content);

void test("rewrites legacy FAERS search and count parameters and clamps search limits", () => {
  const search = adapt('tu.tools.FAERS_search_reports_by_drug_and_reaction(drug_name="LIPITOR", reaction="myalgia", limit=1000)');
  assert.match(search, /FAERS_search_reports_by_drug_and_reaction\(medicinalproduct="LIPITOR", reactionmeddrapt="myalgia", limit=100\)/);
  const count = adapt("tu.tools.FAERS_count_reactions_by_drug_event(drug=drug_name, event=event)");
  assert.match(count, /FAERS_count_reactions_by_drug_event\(medicinalproduct=drug_name, reactionmeddraverse=event\)/);
  const countLimit = adapt('tu.tools.FAERS_count_death_related_by_drug(medicinalproduct="X", limit=2000)');
  assert.match(countLimit, /limit=1000\)/);
  const shorthand = adapt('FAERS_count_reactions_by_drug_event(drug_name=drug, limit=50)');
  assert.equal(shorthand, 'FAERS_count_reactions_by_drug_event(medicinalproduct=drug, limit=50)');
  const table = adapt('| `FAERS_count_reactions_by_drug_event` | `drug` | `drug_name` |\n| `FAERS_search_adverse_event_reports` | Event lookup | `drug_name`, `reaction` |');
  assert.ok(table.includes('| `drug` | `medicinalproduct` |'));
  assert.ok(table.includes('`FAERS_search_reports_by_drug_and_reaction` | Event lookup | `medicinalproduct`, `reactionmeddrapt`'));
  assert.equal(adapt(table), table);
});

void test("leaves FAERS analytics and non-FAERS drug_name arguments intact", () => {
  const analytics = adapt('tu.tools.FAERS_calculate_disproportionality(operation="calculate_disproportionality", drug_name="IBUPROFEN", adverse_event="X")');
  assert.match(analytics, /drug_name="IBUPROFEN"/);
  const fda = adapt('tu.tools.FDA_get_warnings_and_cautions_by_drug_name(drug_name="x")');
  assert.match(fda, /FDA_get_warnings_and_cautions_by_drug_name\(drug_name="x"\)/);
});

void test("rewrites legacy keys inside a tu run FAERS dictionary", () => {
  const quote = String.fromCharCode(34);
  const out = adapt("tu run FAERS_count_reactions_by_drug_event '{" + quote + "drug_name" + quote + ": " + quote + "metformin" + quote + ", " + quote + "event" + quote + ": " + quote + "nausea" + quote + "}'");
  assert.match(out, /"medicinalproduct": "metformin"/);
  assert.match(out, /"reactionmeddraverse": "nausea"/);
});

void test("repairs FAERS envelope reads only for the variable that holds each result", () => {
  const src = [
    'events = tu.tools.FAERS_count_reactions_by_drug_event(medicinalproduct="M")',
    "index = {e['reaction']: e for e in events}",
    "for event in events:",
    "    print(event['reaction'])",
    'deaths = tu.tools.FAERS_count_death_related_by_drug(medicinalproduct="M")',
    "death_count = deaths.get('meta', {}).get('total', 0)",
    "other = audit.get('meta', {}).get('total', 0)",
    'details = tu.tools.FAERS_search_adverse_event_reports(medicinalproduct="m", limit=3)',
    "fatal = details.get('death_count', 0)",
    "serious = details.get('serious_count', 0)",
  ].join("\n");
  const out = adapt(src);
  assert.match(out, /startswith\('death criterion met'\)/);
  assert.match(out, /for e in events\.get\('results', \[\]\)/);
  assert.match(out, /for event in events\.get\('results', \[\]\)/);
  assert.match(out, /e\['term'\]/);
  assert.match(out, /event\['term'\]/);
  assert.match(out, /for r in details\.get\('reports', \[\]\) if r\.get\('seriousnessdeath'\) == '1'/);
  assert.match(out, /for r in details\.get\('reports', \[\]\) if r\.get\('serious'\) == '1'/);
  assert.ok(out.includes("other = audit.get('meta', {}).get('total', 0)"));
});

void test("retires the EBI eQTL Catalogue route in the epigenomics-chromatin Skill", () => {
  const para = adapt("**eQTL_list_datasets** / **eQTL_get_associations**: EBI eQTL Catalogue. Use `dataset_id`.", "tooluniverse-epigenomics-chromatin", "SKILL.md");
  assert.doesNotMatch(para, /Use `dataset_id`/);
  assert.match(para, /GTEx/);
  const table = adapt("| eQTLs | GTEx_get_single_tissue_eqtls | eQTL_get_associations (EBI) |", "tooluniverse-epigenomics-chromatin", "SKILL.md");
  assert.doesNotMatch(table, /eQTL_get_associations/);
  assert.match(table, /GTEx_query_eqtl/);
});

void test("turns the ADMET local-model install into an unmet-prerequisite boundary", () => {
  const src = "ADMETAI tools run a local model, so they need the `ml` extra:\n\n```bash\nuv pip install 'tooluniverse[ml]'\n```\n\nWithout it the tools still appear in `tu list` (the config loads) but fail at\ncall time with `ADMETModel requires 'admet-ai' package`. Run\n`tooluniverse-doctor` to confirm which optional groups are installed.";
  const out = adapt(src, "tooluniverse-admet-prediction", "SKILL.md");
  assert.doesNotMatch(out, /```bash/);
  assert.doesNotMatch(out, /Run\n`tooluniverse-doctor` to confirm/);
  assert.match(out, /Hard constraint/);
});

void test("adds the Reactome coverage field to enrichment response descriptions", () => {
  const line = "| `ReactomeAnalysis_pathway_enrichment` | `identifiers` | `{data: {pathways: [{pathway_id, entities_found}]}}` |";
  const out = adapt(line, "tooluniverse-network-pharmacology", "TOOL_REFERENCE.md");
  assert.match(out, /entities_found, entities_coverage/);
});

void test("front-loads the PhyKIT statistics constraints into the phylogenetics Skill", () => {
  const src = "---\nname: tooluniverse-phylogenetics\n---\n\n# Phylogenetics\n\nbody";
  const out = adapt(src, "tooluniverse-phylogenetics", "SKILL.md");
  assert.match(out, /Use `phykit_batch_analysis` for every statistic/);
  assert.match(out, /untrimmed/);
  assert.match(out, /`toverr`/);
  assert.match(out, /residue fraction/);
  assert.match(out, /No bundled helper reports that statistic/);
  assert.match(out, /p-value cannot be computed/);
  assert.ok(out.indexOf("Hard constraints") < out.indexOf("# Phylogenetics"));
  assert.equal(adapt(out, "tooluniverse-phylogenetics", "SKILL.md"), out);
});

void test("scopes a sequence-model output to a hypothesis, not confirmed causality", () => {
  const out = adapt("since it comes from an independent, causal-mechanism source rather than more correlational annotation", "tooluniverse-regulatory-variant-analysis", "SKILL.md");
  assert.doesNotMatch(out, /causal-mechanism source/);
  assert.match(out, /not confirmed causality/);
});

void test("adds opt-in provider-authorization boundaries for hosted services", () => {
  const boltz = adapt("# Protein Structure Prediction\n\nBoltz_estimate_structure_binding_cost", "tooluniverse-protein-structure-prediction", "SKILL.md");
  assert.match(boltz, /does not configure that provider/);
  const genomics = adapt("# Regulatory Genomics\n\nAlphaGenome_atlas_lookup_variant", "tooluniverse-regulatory-genomics", "SKILL.md");
  assert.match(genomics, /does not configure the AlphaGenome/);
  const variant = adapt("# Regulatory Variant Interpretation\n\nAlphaGenome_atlas_lookup_variant", "tooluniverse-regulatory-variant-analysis", "SKILL.md");
  assert.match(variant, /does not configure the AlphaGenome/);
});

void test("adaptation is idempotent", () => {
  const src = 'tu.tools.FAERS_search_reports_by_drug_and_reaction(drug_name="X", limit=500)';
  const once = adapt(src, "tooluniverse-drug-repurposing", "EXAMPLES.md");
  assert.equal(adapt(once, "tooluniverse-drug-repurposing", "EXAMPLES.md"), once);
});

void test("DDI example conversion consumes FAERS report totals and preserves missing evidence", () => {
  const source = 'result = self.tu.tools.FAERS_count_reactions_by_drug_event(drug_name=drug_a, event_name="drug interaction")\ncount = result[\'data\'].get(\'count\', 0)\nfaers_total = sum(report.get(\'clinical_evidence\', {}).values())';
  const result = adapt(source, "tooluniverse-drug-drug-interaction", "ddi_pipeline.py");
  assert.match(result, /medicinalproduct=drug_a/);
  assert.match(result, /reactionmeddraverse=/);
  assert.ok(result.includes("count = result['total_reports_matching_query']"));
  assert.ok(result.includes("return None, 'UNKNOWN'"));
  assert.equal(adapt(result, "tooluniverse-drug-drug-interaction", "ddi_pipeline.py"), result);
  const working = adapt("    report['risk_score'] = risk_score\n\n    if risk_score >= 70:\n        severity = 'MAJOR'\n    report['severity'] = severity\n    print(report['clinical_evidence'].get('faers_count', 0))", "tooluniverse-drug-drug-interaction", "ddi_working_example.py");
  assert.ok(working.indexOf("risk_score = None") < working.indexOf("report['risk_score'] = risk_score"));
  assert.ok(!working.includes("get('faers_count', 0)"));
  assert.equal(adapt(working, "tooluniverse-drug-drug-interaction", "ddi_working_example.py"), working);
});
