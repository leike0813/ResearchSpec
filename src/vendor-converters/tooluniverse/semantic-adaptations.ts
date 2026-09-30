/**
 * Reviewed-content semantic adaptations for the ToolUniverse vendor converter.
 *
 * The converter runs reviewed Markdown and Python artifacts through adaptReviewedContent before
 * frontmatter and progressive-disclosure conversion. The rules close the v1.3.1 -> v1.5.4 contract
 * drift recorded in audits/tooluniverse/v1.5.4-8ec5d4b/05-semantic-review.md, and each is scoped to a
 * tool family, file, or skill.
 */

const FAERS_CALL_PATTERN = /(?:\btu\.tools\.)?\b(FAERS_[A-Za-z0-9_]+)\s*\(/g;
const FAERS_RUN_PATTERN = /\btu run (FAERS_[A-Za-z0-9_]+) (['"])(\{[^{}]*\})\2/g;
const FAERS_ASSIGNMENT_PATTERN = /(?:^|\n)\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*tu\.tools\.(FAERS_[A-Za-z0-9_]+)\(/g;
const FOR_IN_PATTERN = /\bfor\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+/g;
const FAERS_ANALYTICS_PATTERN = /^FAERS_(?:calculate|filter|stratify|analyze|compare|rollup|count_additive)_/;
const FAERS_SEARCH_PATTERN = /^FAERS_search_/;

const SEARCH_LIMIT_MAX = 100;
const COUNT_LIMIT_MAX = 1000;

const QUOTES = ["'", '"'];

const ADMET_SKILL = "tooluniverse-admet-prediction";
const PHYLOGENETICS_SKILL = "tooluniverse-phylogenetics";
const REGULATORY_VARIANT_SKILL = "tooluniverse-regulatory-variant-analysis";

export function adaptReviewedContent(skillId: string, relativePath: string, content: string): string {
  if (skillId === "tooluniverse-drug-drug-interaction" && ["ddi_pipeline.py", "python_implementation.py", "ddi_working_example.py"].includes(relativePath)) {
    let updated = adaptFaersToolCalls(content).replaceAll('event_name="drug interaction"', 'reactionmeddraverse="drug interaction"');
    updated = updated
      .replace("if result.get('data'):", "if result.get('total_reports_matching_query') is not None:")
      .replace("count = result['data'].get('count', 0)", "count = result['total_reports_matching_query']")
      .replace("if result.get('status') == 'success':\n            data = result.get('data', {})\n            count = data.get('count', 0)", "if result.get('total_reports_matching_query') is not None:\n            count = result['total_reports_matching_query']")
      .replace("adverse_events = {}", "adverse_events = {drug_a: None, drug_b: None}")
      .replace("adverse_events[drug] = 0", "adverse_events[drug] = None")
      .replace("faers_total = sum(report.get('clinical_evidence', {}).values())", "faers_counts = list(report.get('clinical_evidence', {}).values())\n        if any(value is None for value in faers_counts):\n            return None, 'UNKNOWN'\n        faers_total = sum(faers_counts)")
      .replace('if severity == "MAJOR":', 'if severity == "UNKNOWN":\n            recommendations.append("Evidence incomplete; do not infer low risk from unavailable FAERS data.")\n        elif severity == "MAJOR":')
      .replace("faers_count = report['clinical_evidence'].get('faers_count', 0)", "faers_count = report['clinical_evidence'].get('faers_count')")
      .replace("if faers_count > 100:", "if faers_count is not None and faers_count > 100:")
      .replace("elif faers_count > 10:", "elif faers_count is not None and faers_count > 10:")
      .replace("    if risk_score >= 70:", "    if faers_count is None:\n        risk_score = None\n        severity = 'UNKNOWN'\n    elif risk_score >= 70:");
    if (relativePath === "ddi_working_example.py") updated = updated
      .replace("    report['risk_score'] = risk_score\n", "")
      .replace("    report['severity'] = severity", "    report['risk_score'] = risk_score\n    report['severity'] = severity")
      .replace("report['clinical_evidence'].get('faers_count', 0)", "report['clinical_evidence'].get('faers_count')");
    return updated;
  }
  if (!relativePath.endsWith(".md")) return content;
  let adapted = adaptFaersToolCalls(content);
  adapted = adaptFaersParameterTables(adapted);
  adapted = adaptFaersRunDictionaries(adapted);
  adapted = adaptFaersEnvelopeReads(adapted);
  adapted = adaptRetiredEqtlRoutes(adapted);
  adapted = adaptReactomeEnrichmentFields(adapted);
  if (skillId === "tooluniverse-drug-repurposing" && relativePath === "REFERENCE.md") {
    adapted = adapted
      .replace("total_reports = sum(r['count'] for r in all_reactions.get('results', []))", "total_reports = all_reactions.get('total_reports_matching_query')")
      .replace("death_ratio = death_count / max(total_reports, 1)", "death_ratio = death_count / total_reports if total_reports else None  # reported-death share, not a fatality risk");
  }
  if (skillId === "tooluniverse-pharmacovigilance" && relativePath === "TOOLS_REFERENCE.md") {
    for (const arm of ["a", "b"]) adapted = adapted.replace("events_" + arm + "_dict[event].get('prr')", "tu.tools.FAERS_calculate_disproportionality(operation='calculate_disproportionality', drug_name=drug_" + arm + ", adverse_event=event).get('metrics', {}).get('PRR', {}).get('value')");
    const start = adapted.indexOf("def detect_emerging_signals(");
    const end = adapted.indexOf("\n```", start);
    if (start >= 0 && end > start) adapted = adapted.slice(0, start) + [
      "def detect_emerging_signals(tu, drug_name, threshold_prr=3.0):",
      "    counts = tu.tools.FAERS_count_reactions_by_drug_event(medicinalproduct=drug_name, limit=100)",
      "    signals = []",
      "    for row in counts.get('results', []):",
      "        metrics = tu.tools.FAERS_calculate_disproportionality(",
      "            operation='calculate_disproportionality', drug_name=drug_name, adverse_event=row['term'])",
      "        prr = metrics.get('metrics', {}).get('PRR', {}).get('value')",
      "        if prr is not None and prr >= threshold_prr:",
      "            page = tu.tools.FAERS_search_reports_by_drug_and_reaction(",
      "                medicinalproduct=drug_name, reactionmeddrapt=row['term'], limit=100)",
      "            signals.append({'event': row['term'], 'prr': prr, 'reaction_count': row['count'],",
      "                'total_matching_reports': page.get('total_available'), 'truncated': page.get('truncated'),",
      "                'page_serious_count': sum(str(r.get('serious')) == '1' for r in page.get('reports', [])),",
      "                'page_death_criterion_count': sum(str(r.get('seriousnessdeath')) == '1' for r in page.get('reports', []))})",
      "    return sorted(signals, key=lambda x: x['prr'], reverse=True)",
    ].join("\n") + adapted.slice(end);
  }
  if (skillId === ADMET_SKILL) adapted = adaptAdmetRuntimeBoundary(adapted);
  if (skillId === PHYLOGENETICS_SKILL && relativePath === "SKILL.md") adapted = adaptPhylogeneticsStatistics(adapted);
  if (skillId === REGULATORY_VARIANT_SKILL) adapted = adaptRegulatoryVariantEvidence(adapted);
  if (relativePath === "SKILL.md") adapted = adaptServiceBoundaries(skillId, adapted);
  if (relativePath === "SKILL.md" && (/\bFAERS/.test(content) || skillId === "tooluniverse-drug-drug-interaction") && !adapted.includes("## FAERS evidence contract")) {
    const end = adapted.indexOf("\n---\n", 4) + 5;
    adapted = adapted.slice(0, end) + "\n\n## FAERS evidence contract\n\nDetailed searches return `reports`, `count`, `total_available`, and `truncated`; `count` is one page, never the total. Use `medicinalproduct` and at most 100 reports per request. For a reaction-specific search use `FAERS_search_reports_by_drug_and_reaction` with `reactionmeddrapt`; drug-only searches use `FAERS_search_adverse_event_reports`. Serious-only searches require `serious='Yes'`.\n\nCount tools return `results` with `term/count` rows; read `total_reports_matching_query` for the report denominator and preserve null as unknown. Reaction-row sums can double-count reports. Counts are spontaneous reporting frequencies, not incidence, causal proof, or population risk. Obtain PRR/ROR/IC through `FAERS_calculate_disproportionality`, not count rows. Analytics retain `drug_name`/`adverse_event`. Death-criterion counts do not establish that the drug caused a death; page-level serious or death counts are explicitly partial and cannot form a whole-query rate.\n" + adapted.slice(end);
  }
  return adapted;
}

/** Rename FAERS parameters to the v1.5.4 schema and clamp search `limit` values, per tool call. */
function adaptFaersToolCalls(content: string): string {
  if (!content.includes("FAERS_")) return content;
  const pattern = new RegExp(FAERS_CALL_PATTERN.source, "g");
  let out = "";
  let cursor = 0;
  let match = pattern.exec(content);
  while (match !== null) {
    const open = match.index + match[0].length - 1;
    const close = matchingParen(content, open);
    if (close < 0) { match = pattern.exec(content); continue; }
    const args = content.slice(open + 1, close);
    let tool = match[1];
    if (tool === "FAERS_search_reports_by_drug_and_reaction" && !/\b(?:reaction|reactionmeddrapt)\s*=/.test(args)) tool = "FAERS_search_adverse_event_reports";
    else if (tool === "FAERS_search_adverse_event_reports" && /\b(?:reaction|reactionmeddrapt)\s*=/.test(args)) tool = "FAERS_search_reports_by_drug_and_reaction";
    const prefix = match[0].slice(0, match[0].indexOf(match[1]));
    out += content.slice(cursor, match.index) + prefix + tool + "(" + rewriteFaersArgs(tool, args);
    cursor = close;
    pattern.lastIndex = close + 1;
    match = pattern.exec(content);
  }
  return out + content.slice(cursor);
}

function rewriteFaersArgs(tool: string, args: string): string {
  const analytics = FAERS_ANALYTICS_PATTERN.test(tool);
  const search = FAERS_SEARCH_PATTERN.test(tool);
  const limitMax = search ? SEARCH_LIMIT_MAX : COUNT_LIMIT_MAX;
  const edits: Array<{ start: number; end: number; text: string }> = [];
  let index = 0;
  let depth = 0;
  let quote = "";
  while (index < args.length) {
    const char = args[index];
    if (quote !== "") {
      if (char === "\\") { index += 2; continue; }
      if (char === quote) quote = "";
      index += 1;
      continue;
    }
    if (char === "'" || char === '"') { quote = char; index += 1; continue; }
    if (char === "(" || char === "[" || char === "{") { depth += 1; index += 1; continue; }
    if (char === ")" || char === "]" || char === "}") { depth -= 1; index += 1; continue; }
    if (depth === 0) {
      const nameMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(args.slice(index));
      if (nameMatch !== null) {
        const name = nameMatch[1];
        const afterName = index + name.length;
        if (!analytics && (name === "drug_name" || name === "drug")) edits.push({ start: index, end: afterName, text: "medicinalproduct" });
        else if (search && name === "reaction") edits.push({ start: index, end: afterName, text: "reactionmeddrapt" });
        else if (!analytics && !search && name === "event") edits.push({ start: index, end: afterName, text: "reactionmeddraverse" });
        const equals = index + nameMatch[0].length;
        if (name === "limit" && !analytics) {
          const valueMatch = /^(\s*)(\d+)/.exec(args.slice(equals));
          if (valueMatch !== null && Number(valueMatch[2]) > limitMax) {
            const digitsStart = equals + valueMatch[1].length;
            edits.push({ start: digitsStart, end: digitsStart + valueMatch[2].length, text: String(limitMax) });
          }
        }
        index = equals;
        continue;
      }
    }
    index += 1;
  }
  let out = args;
  for (const edit of edits.reverse()) out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  return out;
}

/** Keep parameter tables and wrong/correct examples consistent with the adapted calls. */
function adaptFaersParameterTables(content: string): string {
  return content.split("\n").map((line) => {
    if (!line.trimStart().startsWith("|")) return line;
    const tool = /`(FAERS_[A-Za-z0-9_]+)`/.exec(line)?.[1];
    if (!tool || FAERS_ANALYTICS_PATTERN.test(tool)) return line;
    const cells = line.split("|");
    const last = cells.length - 2;
    if (last < 2) return line;
    let parameters = cells[last].replace(/`(?:drug_name|drug)`/g, "`medicinalproduct`");
    if (FAERS_SEARCH_PATTERN.test(tool)) {
      if (tool === "FAERS_search_adverse_event_reports" && /`reaction`/.test(parameters)) cells[1] = cells[1].replace(tool, "FAERS_search_reports_by_drug_and_reaction");
      parameters = parameters.replace(/`reaction`/g, "`reactionmeddrapt`");
    } else parameters = parameters.replace(/`event`/g, "`reactionmeddraverse`");
    cells[last] = parameters;
    return cells.join("|");
  }).join("\n");
}

/** Rewrite legacy JSON keys inside a `tu run FAERS_...` argument dictionary. */
function adaptFaersRunDictionaries(content: string): string {
  if (!content.includes("tu run FAERS_")) return content;
  return content.replace(FAERS_RUN_PATTERN, (_all: string, tool: string, quote: string, dictionary: string): string => {
    const analytics = FAERS_ANALYTICS_PATTERN.test(tool);
    const search = FAERS_SEARCH_PATTERN.test(tool);
    let body = dictionary;
    if (!analytics) {
      body = body.replace(/(["'])drug_name\1(\s*:)/g, "$1medicinalproduct$1$2");
      body = body.replace(/(["'])drug\1(\s*:)/g, "$1medicinalproduct$1$2");
      if (search) body = body.replace(/(["'])reaction\1(\s*:)/g, "$1reactionmeddrapt$1$2");
      else body = body.replace(/(["'])event\1(\s*:)/g, "$1reactionmeddraverse$1$2");
      body = body.replace(/("limit"\s*:\s*)(\d+)/g, (_value: string, prefix: string, digits: string): string => prefix + String(Math.min(Number(digits), search ? SEARCH_LIMIT_MAX : COUNT_LIMIT_MAX)));
    }
    return "tu run " + tool + " " + quote + body + quote;
  });
}

/** Map variables assigned from a FAERS call to the tool they hold. */
function faersAssignments(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const pattern = new RegExp(FAERS_ASSIGNMENT_PATTERN.source, "g");
  let match = pattern.exec(content);
  while (match !== null) { map.set(match[1], match[2]); match = pattern.exec(content); }
  return map;
}

function replaceAllLiteral(content: string, from: string, to: string): string {
  return from === "" ? content : content.split(from).join(to);
}

/**
 * Repair reads of the FAERS v1.5.4 envelopes, scoped to the exact variable that holds each result so
 * an unrelated `meta.total` elsewhere is never rewritten. `FAERS_search_*` returns
 * `{reports, count, total_available, ...}`; the count family returns `{results: [{term, count}]}`.
 * `meta.serious_count`, `meta.total`, `serious_count`, and `death_count`
 * exist in neither envelope.
 */
function adaptFaersEnvelopeReads(content: string): string {
  if (!content.includes("tu.tools.FAERS_")) return content;
  let out = content;
  for (const [variable, tool] of faersAssignments(content)) {
    for (const quote of QUOTES) {
      const meta = variable + ".get(" + quote + "meta" + quote + ", {})";
      if (tool === "FAERS_count_seriousness_by_drug_event") {
        out = replaceAllLiteral(out, meta + ".get(" + quote + "serious_count" + quote + ", 0)",
          "next((r['count'] for r in " + variable + ".get('results', []) if r.get('term') == 'Serious'), 0)");
      }
      if (tool === "FAERS_count_death_related_by_drug") {
        out = replaceAllLiteral(out, meta + ".get(" + quote + "total" + quote + ", 0)",
          "next((r['count'] for r in " + variable + ".get('results', []) if str(r.get('term', '')).startswith('death criterion met')), 0)");
      }
      if (FAERS_SEARCH_PATTERN.test(tool)) {
        out = replaceAllLiteral(out, variable + ".get(" + quote + "serious_count" + quote + ", 0)",
          "sum(1 for r in " + variable + ".get('reports', []) if r.get('serious') == '1')");
        out = replaceAllLiteral(out, variable + ".get(" + quote + "death_count" + quote + ", 0)",
          "sum(1 for r in " + variable + ".get('reports', []) if r.get('seriousnessdeath') == '1')");
      }
    }
  }
  return adaptFaersEnvelopeIteration(out);
}

/**
 * Iterate a FAERS envelope variable through its collection and key rows by `term`:
 * `<var>.get('results', [])` for count tools, `<var>.get('reports', [])` for search tools.
 */
function adaptFaersEnvelopeIteration(content: string): string {
  const collections = new Map<string, string>();
  for (const [variable, tool] of faersAssignments(content)) {
    if (FAERS_SEARCH_PATTERN.test(tool)) collections.set(variable, "reports");
    else if (!FAERS_ANALYTICS_PATTERN.test(tool)) collections.set(variable, "results");
  }
  if (collections.size === 0) return content;
  const loopVariables = new Set<string>();
  let out = "";
  let cursor = 0;
  FOR_IN_PATTERN.lastIndex = 0;
  let match = FOR_IN_PATTERN.exec(content);
  while (match !== null) {
    const valueStart = match.index + match[0].length;
    let variable = "";
    let collection = "";
    for (const [candidate, candidateCollection] of collections) {
      if (content.startsWith(candidate, valueStart) && !/[\w.]/.test(content[valueStart + candidate.length] ?? "")) { variable = candidate; collection = candidateCollection; break; }
    }
    if (variable === "") { match = FOR_IN_PATTERN.exec(content); continue; }
    if (collection === "results") loopVariables.add(match[1]);
    out += content.slice(cursor, valueStart) + variable + ".get('" + collection + "', [])";
    cursor = valueStart + variable.length;
    FOR_IN_PATTERN.lastIndex = cursor;
    match = FOR_IN_PATTERN.exec(content);
  }
  out += content.slice(cursor);
  for (const loopVariable of loopVariables) {
    for (const quote of QUOTES) {
      out = replaceAllLiteral(out, loopVariable + "[" + quote + "reaction" + quote + "]", loopVariable + "['term']");
      out = replaceAllLiteral(out, loopVariable + ".get(" + quote + "reaction" + quote + ")", loopVariable + ".get('term')");
    }
  }
  return out;
}

/** The EBI eQTL Catalogue tools are retired (broken_apis); replace their route and fallback. */
function adaptRetiredEqtlRoutes(content: string): string {
  if (!content.includes("eQTL_list_datasets") && !content.includes("eQTL_get_associations")) return content;
  let out = content;
  out = out.replace(
    /\*\*eQTL_list_datasets\*\*\s*\/\s*\*\*eQTL_get_associations\*\*:[^\n]*/g,
    "**eQTL evidence:** use the GTEx tools above. Report their tissue and study coverage; when they cannot cover the question, request an independently available, user-authorized source.",
  );
  out = out.replace(/\|\s*eQTL_get_associations\s*\(EBI\)\s*\|/g, "| GTEx_query_eqtl |");
  out = out.replace(/eQTL_get_associations\s*\(EBI\)/g, "GTEx_query_eqtl");
  return out;
}

/** Add `entities_coverage` to past-rename Reactome enrichment response descriptions. */
function adaptReactomeEnrichmentFields(content: string): string {
  if (!content.includes("ReactomeAnalysis_pathway_enrichment") || !content.includes("entities_found")) return content;
  return content.split("\n").map((line) => {
    if (!line.includes("ReactomeAnalysis_pathway_enrichment") || !line.includes("entities_found") || line.includes("entities_coverage")) return line;
    const anchor = line.includes("entities_total") ? "entities_total" : "entities_found";
    return line.replace(anchor, anchor + ", entities_coverage");
  }).join("\n");
}

/** Turn the upstream ADMET install/doctor instruction into an unmet-prerequisite boundary. */
function adaptAdmetRuntimeBoundary(content: string): string {
  return content.replace(
    /ADMETAI tools run a local model, so they need the `ml` extra:[\s\S]*?`tooluniverse-doctor` to confirm which optional groups are installed\./,
    [
      "ADMETAI tools run a local model, so they need the `ml` extra installed in the environment the target Agent is already authorized to use.",
      "",
      "**Hard constraint:** ResearchSpec never installs dependencies or probes the environment. Do not run `uv pip install 'tooluniverse[ml]'` or `tooluniverse-doctor` on the user's behalf; report a missing `ml` extra as an unmet prerequisite instead.",
      "",
      "Without it the tools still appear in `tu list` (the config loads) but fail at",
      "call time with `ADMETModel requires 'admet-ai' package`.",
    ].join("\n"),
  );
}

/**
 * Front-load the PhyKIT statistics constraints so the progressive-disclosure split cannot move them
 * behind the retained Skill body. The long upstream explanation stays in place.
 */
const PHYLOGENETICS_CONSTRAINTS = [
  "## Hard constraints — PhyKIT statistics",
  "",
  "Use `phykit_batch_analysis` for every statistic computed across multiple trees or alignments; do not loop the PhyKIT CLI per file. It returns the correct column for each function, so read its returned value instead of re-parsing PhyKIT stdout.",
  "",
  "- `saturation` — the returned value is PhyKIT's second printed column (`1 - slope`); the first column is the slope. Do not report the slope as saturation.",
  "- `treeness_over_rcv` (alias `toverr`) — pass the **untrimmed** alignment (`directory`/`extension`) and its tree (`tree_directory`/`tree_extension`); trimming changes RCV and the ratio.",
  "- `parsimony_informative` — the returned percentage (%PIS), not the raw count.",
  "- `dvmc` and `long_branch_score` are supported functions; never mark them unsupported and never loop for them.",
  "- `long_branch_score` is multi-valued per tree: set `per_tree_stat` (`mean` or `median`) before any cross-group comparison.",
  "",
  "**Gap percentage.** A '>X% gapped columns' filter needs the fraction of alignment **columns** that contain at least one gap. No bundled helper reports that statistic: `phykit_batch_analysis` with `operation=gap_percentage` and every `alignment_gap_percentage` helper (in `scripts/tree_statistics.py`, `scripts/scogs_phykit_pipeline.py`, `scripts/scogs_paired_compare.py`) return gap characters over total positions (a residue fraction), and `filter_by_gap_threshold` in `scripts/format_alignment.py` is residue-based too. Compute the column fraction directly from the alignment (per column: does it contain at least one gap?); `remove_gappy_columns` in `scripts/format_alignment.py` computes a per-column gap fraction but is a column filter, not this reported percentage.",
  "",
  "**Cross-group Mann-Whitney U.** The batch result carries per-file `values` only for sets up to 50; larger sets return summary statistics only. Compute the test only from full `values`; when only summaries are available, report that the p-value cannot be computed rather than fabricating one.",
].join("\n");

function adaptPhylogeneticsStatistics(content: string): string {
  if (content.includes("Use `phykit_batch_analysis` for every statistic")) return content;
  content = content
    .replace("**column 1** per phykit's docs; some sources report col 2 — say which you used", "**column 2** (`1 - slope`), matching the batch implementation; state the definition used")
    .replace("For larger\nsets, compute the statistic from the per-group summaries the tool returns rather\nthan re-deriving every value by hand.", "For larger\nsets, use the authorized paired-comparison script for complete values or report\nthat the rank test is unavailable. Means and medians cannot reconstruct its p-value.");
  const frontmatter = /^---\n[\s\S]*?\n---\n/.exec(content);
  if (frontmatter === null) return PHYLOGENETICS_CONSTRAINTS + "\n\n" + content;
  return content.slice(0, frontmatter[0].length) + "\n" + PHYLOGENETICS_CONSTRAINTS + "\n" + content.slice(frontmatter[0].length);
}

/** Scope a sequence-based model output to a hypothesis, not confirmed causality. */
function adaptRegulatoryVariantEvidence(content: string): string {
  return content
    .replace(
      /an independent,\s*causal-mechanism source rather than more correlational annotation/g,
      "a mechanistic model hypothesis rather than more correlational annotation; it suggests a mechanism and is not confirmed causality",
    )
    .replace(/gives a \*mechanistic\* answer/g, "gives a *mechanistic* hypothesis (model-based, not confirmed causality)");
}

interface ServiceGuard {
  readonly skillId: string;
  readonly satisfied: RegExp;
  readonly note: string;
}

/**
 * Paid or external-service content keeps an explicit authorization boundary, inserted after the H1
 * and before the progressive-disclosure split. A guard whose `satisfied` marker is already
 * present is a no-op.
 */
const SERVICE_GUARDS: readonly ServiceGuard[] = [
  {
    skillId: "tooluniverse-protein-structure-prediction",
    satisfied: /does not configure that provider/,
    note: "**Hard constraint:** paid `Boltz_*` calls require the target Agent's own authorized `BOLTZ_API_KEY`. ResearchSpec does not configure that provider, store the key, or grant consent for paid or external model services; every submission still needs the upstream cost estimate, the user's explicit confirmation, and a caller-supplied `idempotency_key`.",
  },
  {
    skillId: "tooluniverse-variant-interpretation",
    satisfied: /ResearchSpec never configures or stores that endpoint/,
    note: "**Hard constraint:** the Folklore MCP is opt-in and uses only the target Agent's own `FOLKLORE_MCP_URL`; no patient, phenotype, or family data may be sent. ResearchSpec never configures or stores that endpoint.",
  },
  {
    skillId: "tooluniverse-literature-deep-research",
    satisfied: /ResearchSpec never stores their credentials or endpoints/,
    note: "**Hard constraint:** the Noodle and Exa MCPs are opt-in discovery aids configured only through the target Agent's own settings. Their output is not evidence of causality, validity, or data quality; verify any surfaced item against a real source. ResearchSpec never stores their credentials or endpoints.",
  },
  {
    skillId: "tooluniverse-regulatory-genomics",
    satisfied: /does not configure the AlphaGenome/,
    note: "**Hard constraint:** the AlphaGenome, Evo2, and `gi_*` (Genomic Intelligence) tools are opt-in hosted services that use only the target Agent's own authorized keys (`ALPHA_GENOME_API_KEY`, `NVIDIA_API_KEY`) and `GENOMIC_INTELLIGENCE_MCP_URL`. ResearchSpec does not configure the AlphaGenome provider, store any key or endpoint, or run these services; their predictions are hypotheses to validate against annotation evidence, not confirmed regulatory effects.",
  },
  {
    skillId: "tooluniverse-regulatory-variant-analysis",
    satisfied: /does not configure the AlphaGenome/,
    note: "**Hard constraint:** the AlphaGenome Atlas and live `AlphaGenome_*` operations are opt-in hosted services that use only the target Agent's own authorized `ALPHA_GENOME_API_KEY`. ResearchSpec does not configure the AlphaGenome provider or store the key. AVI_SCORE and other model outputs are hypotheses to corroborate, not confirmed causality.",
  },
];

function adaptServiceBoundaries(skillId: string, content: string): string {
  let out = content;
  for (const guard of SERVICE_GUARDS) {
    if (guard.skillId !== skillId || guard.satisfied.test(out)) continue;
    const anchor = /^# .+$/m.exec(out);
    if (anchor === null) continue;
    const insertAt = anchor.index + anchor[0].length;
    out = out.slice(0, insertAt) + "\n\n" + guard.note + out.slice(insertAt);
  }
  return out;
}

function matchingParen(content: string, openIndex: number): number {
  let depth = 0;
  let quote = "";
  for (let index = openIndex; index < content.length; index += 1) {
    const char = content[index];
    if (quote !== "") {
      if (char === "\\") { index += 1; continue; }
      if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") { depth -= 1; if (depth === 0) return index; }
  }
  return -1;
}
