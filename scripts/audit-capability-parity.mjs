#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "yaml";

const ROOT = process.cwd();
const SKILLS = path.join(ROOT, "skills", "capabilities");
const ARS_INDEX = JSON.parse(readFileSync(path.join(ROOT, "authoring", "ars", "extraction-index.json"), "utf8"));
const PAPER_HUMANIZER_INDEX = JSON.parse(readFileSync(path.join(ROOT, "authoring", "paper-humanizer", "extraction-index.json"), "utf8"));
const REVISION_MASTER_INDEX = JSON.parse(readFileSync(path.join(ROOT, "authoring", "revision-master", "extraction-index.json"), "utf8"));
const PATENT_INDEX = JSON.parse(readFileSync(path.join(ROOT, "authoring", "patent-disclosure-skill", "extraction-index.json"), "utf8"));
function extractionIndex(provenance = {}) {
  const ids = provenance.extraction_artifact_ids ?? [];
  if (ids.some((id) => id.startsWith("PD-"))) return PATENT_INDEX;
  if (ids.some((id) => id.startsWith("RM-"))) return REVISION_MASTER_INDEX;
  if (ids.some((id) => id.startsWith("PH-"))) return PAPER_HUMANIZER_INDEX;
  return ARS_INDEX;
}

const FLOW_HEADINGS = /phase boundary|enforcement|quick start|trigger conditions|trigger keywords|mode selection|mode spectrum|does not trigger|quick mode|socratic mode activation|changelog|pattern protection|cross-model|tools:|model:|frontmatter|related skills|routing discipline/i;
const STOP = new Set(["the","a","an","and","or","of","to","in","for","on","with","is","are","be","as","that","this","it","its","from","by","at","not","no","must","shall","never","always","each","every","any","all","when","if","then","your","you","their","they","source","sources"]);

function normalize(text) { return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }

function significantTokens(text) {
  return [...new Set(normalize(text).split(" ").filter((t) => t.length > 3 && !STOP.has(t)))];
}

function parseHeadings(markdown) {
  const headings = [];
  for (const line of markdown.split("\n")) {
    const m = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (m) headings.push({ level: m[1].length, title: m[2].replace(/`/g, "").trim(), line });
  }
  return headings;
}

function extractRules(markdown) {
  const rules = [];
  for (const line of markdown.split("\n")) {
    if (/\b(MUST|must|SHALL|shall|never|NEVER|always|ALWAYS)\b/.test(line) && line.length < 400) {
      const clean = line.replace(/^[-*#>\s\d.]+/, "").trim();
      if (clean && clean.length > 20) rules.push(clean);
    }
  }
  return rules;
}

function headingCovered(title, skillText) {
  const tokens = significantTokens(title).filter((t) => !/v\d/i.test(t));
  if (tokens.length === 0) return true;
  const skillTokens = new Set(significantTokens(skillText));
  const hit = tokens.filter((t) => skillTokens.has(t)).length;
  return hit / tokens.length >= 0.55;
}

function ruleCovered(rule, skillText) {
  const tokens = significantTokens(rule);
  if (tokens.length < 3) return true;
  const skillTokens = new Set(significantTokens(skillText));
  const hit = tokens.filter((t) => skillTokens.has(t)).length;
  return hit / tokens.length >= 0.45;
}

function auditPackage(packageDir) {
  const manifest = parse(readFileSync(path.join(packageDir, "manifest.yaml"), "utf8"));
  const skill = readFileSync(path.join(packageDir, "SKILL.md"), "utf8");
  const provenance = manifest.provenance ?? {};
  const artifactIds = provenance.extraction_artifact_ids ?? [];
  const index = extractionIndex(provenance);
  const byId = new Map(index.artifacts.map((a) => [a.artifact_id, a]));
  const knowledgeArtifactIds = [...new Set(artifactIds)].filter((id) => byId.get(id)?.kind === "knowledge-pack");
  const knowledgeRefs = manifest.knowledge_refs ?? [];
  const sourceIds = provenance.origin === "vendor-derived"
    ? [...new Set(artifactIds)].filter((id) => byId.get(id)?.kind === "capability").slice(0, 1)
    : [...new Set(artifactIds)].filter((id) => {
        const item = byId.get(id);
        return item && item.path.endsWith(".md") && !item.path.includes("/knowledge/");
      });
  const sourceBodies = [];
  for (const id of sourceIds) {
    const item = byId.get(id);
    const text = readFileSync(item.path, "utf8");
    const body = text.includes("-->") ? text.slice(text.indexOf("-->") + 3).trim() : text;
    sourceBodies.push(body);
  }
  const upstream = sourceBodies.join("\n\n");
  const headings = parseHeadings(upstream).filter((h) => !FLOW_HEADINGS.test(h.title));
  const covered = headings.filter((h) => headingCovered(h.title, skill)).length;
  const rules = extractRules(upstream);
  const semanticRules = rules.filter((r) => !FLOW_HEADINGS.test(r));
  const rulesCovered = semanticRules.filter((r) => ruleCovered(r, skill)).length;
  const outputUpstream = /output format|output shape|report format|deliverable format/i.test(upstream);
  const outputSkill = /## Output Format|## Output Shape|Output Format/i.test(skill);
  return {
    capability_id: manifest.capability_id,
    maturity: manifest.maturity ?? "skeleton",
    skill_lines: skill.split("\n").length,
    knowledge_refs: knowledgeRefs.length,
    knowledge_artifacts: knowledgeArtifactIds.length,
    knowledge_coverage: knowledgeArtifactIds.length ? Math.min(1, knowledgeRefs.length / knowledgeArtifactIds.length) : 1,
    knowledge_refs_referenced: knowledgeRefs.length ? knowledgeRefs.filter((item) => skill.includes(item.path)).length / knowledgeRefs.length : 1,
    knowledge_refs_unreferenced: knowledgeRefs.filter((item) => !skill.includes(item.path)).map((item) => item.knowledge_id),
    upstream_sections: headings.length,
    covered_sections: covered,
    section_coverage: headings.length ? covered / headings.length : 1,
    upstream_rules: semanticRules.length,
    covered_rules: rulesCovered,
    rule_coverage: semanticRules.length ? rulesCovered / semanticRules.length : 1,
    uncovered_sections: headings.filter((h) => !headingCovered(h.title, skill)).map((h) => h.title),
    uncovered_rules: semanticRules.filter((r) => !ruleCovered(r, skill)).slice(0, 30),
    output_format_preserved: !outputUpstream || outputSkill,
    flow_sections_retained: parseHeadings(skill).filter((h) => FLOW_HEADINGS.test(h.title)).map((h) => h.title),
  };
}

function main() {
  const packages = readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(SKILLS, entry.name))
    .sort();
  const results = packages.map(auditPackage);
  const summary = {
    total: results.length,
    operational: results.filter((r) => r.maturity === "operational").length,
    avg_section_coverage: results.reduce((s, r) => s + r.section_coverage, 0) / Math.max(1, results.length),
    avg_rule_coverage: results.reduce((s, r) => s + r.rule_coverage, 0) / Math.max(1, results.length),
    below_section_threshold: results.filter((r) => r.section_coverage < 0.7).map((r) => r.capability_id),
    below_rule_threshold: results.filter((r) => r.rule_coverage < 0.6).map((r) => r.capability_id),
    output_missing: results.filter((r) => !r.output_format_preserved).map((r) => r.capability_id),
    knowledge_below_threshold: results.filter((r) => r.knowledge_coverage < 1 || r.knowledge_refs_referenced < 1).map((r) => r.capability_id),
    flow_retained: results.filter((r) => r.flow_sections_retained.length > 0).map((r) => ({ capability_id: r.capability_id, headings: r.flow_sections_retained })),
  };
  const output = { schema_version: "1", thresholds: { section_coverage: 0.7, rule_coverage: 0.6, output_format: true, knowledge_coverage: 1, knowledge_refs_referenced: 1 }, summary, packages: results };
  const outputPath = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : path.join(ROOT, "artifacts", "generated", "capability-parity-report.json");
  if (outputPath) writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
  const failed = summary.below_section_threshold.length + summary.below_rule_threshold.length + summary.output_missing.length + summary.flow_retained.length + summary.knowledge_below_threshold.length;
  if (failed > 0) process.exitCode = 1;
}

main();
