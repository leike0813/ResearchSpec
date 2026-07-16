import { parse, stringify } from "yaml";

import { sha256 } from "../../core/workspace/write-plan.js";
import type { EducationEvidence } from "../../vendor-audits/education-agent-skills.js";
import type {
  EducationAdmissionDecision,
  EducationEvidenceAdaptationDecision,
  EducationPolicies,
  EducationSafetyDomainDecision,
} from "./policy.js";

const BOUNDARY_START = "<!-- researchspec-education-boundary:start -->";
const BOUNDARY_END = "<!-- researchspec-education-boundary:end -->";

export interface BodyEvidenceMatch {
  evidence_ids: string[];
  start: number;
  end: number;
  unit_type: "sentence" | "list-item" | "table-row" | "paragraph";
  source_text_sha256: string;
}

export interface AdaptedEducationSkill {
  content: string;
  sourceBody: string;
  markedBody: string;
  bodyMatches: BodyEvidenceMatch[];
  unmatchedEvidenceIds: string[];
  markedFrontmatterEvidenceIds: string[];
}

export function adaptEducationSkill(
  source: string,
  admission: EducationAdmissionDecision,
  safety: EducationSafetyDomainDecision,
  evidenceDecisions: EducationEvidenceAdaptationDecision[],
  auditEvidenceById: ReadonlyMap<string, EducationEvidence>,
  policies: EducationPolicies,
): AdaptedEducationSkill {
  if (admission.disposition !== "admitted" || !admission.license) throw new Error(`Cannot adapt excluded Education Skill: ${admission.upstream_skill_id}`);
  const parsed = parseSourceSkill(source, admission.upstream_skill_id);
  const sourceEvidence = Array.isArray(parsed.frontmatter.evidence_sources)
    ? parsed.frontmatter.evidence_sources.map((item) => String(item))
    : [];
  if (sourceEvidence.length !== evidenceDecisions.length) {
    throw new Error(`Education evidence-source count differs from immutable catalog: ${admission.upstream_skill_id}`);
  }
  const markedFrontmatterEvidenceIds: string[] = [];
  const markedEvidenceSources = sourceEvidence.map((citation, index) => {
    const decision = evidenceDecisions[index];
    if (!decision || decision.citation !== citation) throw new Error(`Education evidence-source order differs from immutable catalog: ${admission.upstream_skill_id}`);
    if (decision.frontmatter_disposition === "unmarked") return citation;
    markedFrontmatterEvidenceIds.push(decision.evidence_id);
    return `${policies.policy.evidence.marker_open}${citation}${policies.policy.evidence.marker_close}`;
  });
  const bodyResult = markBodyEvidence(
    parsed.body,
    evidenceDecisions.filter((decision) => decision.body_strategy === "author-year-complete-unit"),
    auditEvidenceById,
    policies.policy.evidence.marker_open,
    policies.policy.evidence.marker_close,
  );
  const frontmatter = normalizeFrontmatter(parsed.frontmatter, admission, markedEvidenceSources, policies);
  const boundary = renderBoundary(safety, policies);
  return {
    content: `---\n${stringify(frontmatter, { lineWidth: 0 }).trimEnd()}\n---\n\n${boundary}\n\n${bodyResult.body}`,
    sourceBody: parsed.body,
    markedBody: bodyResult.body,
    bodyMatches: bodyResult.matches,
    unmatchedEvidenceIds: bodyResult.unmatchedEvidenceIds,
    markedFrontmatterEvidenceIds,
  };
}

export function recoverEducationSourceBody(adaptedSkill: string, markerOpen = "⟦UNRESOLVED⟧", markerClose = "⟦/UNRESOLVED⟧"): string {
  const parsed = parseSourceSkill(adaptedSkill, "generated");
  const start = parsed.body.indexOf(BOUNDARY_START);
  const end = parsed.body.indexOf(BOUNDARY_END);
  if (start !== 1 || !parsed.body.startsWith(`\n${BOUNDARY_START}`) || end < 0) throw new Error("Generated Education Skill boundary block is absent.");
  const original = parsed.body.slice(end + BOUNDARY_END.length + 2);
  return original.split(markerOpen).join("").split(markerClose).join("");
}

function normalizeFrontmatter(
  source: Record<string, unknown>,
  admission: EducationAdmissionDecision,
  evidenceSources: string[],
  policies: EducationPolicies,
): Record<string, unknown> {
  const description = typeof source.description === "string" ? source.description.trim() : "";
  if (!description) throw new Error(`Education Skill description is absent: ${admission.upstream_skill_id}`);
  const normalizedKeys = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "evidence_sources",
  ]);
  const educationalMetadata = Object.fromEntries(
    Object.entries(source).filter(([key]) => !normalizedKeys.has(key)),
  );
  return {
    name: admission.generated_skill_id,
    description,
    license: policies.policy.license.expression,
    compatibility: "Static educational guidance using user-provided context and only tools explicitly chosen by the invoking Agent. ResearchSpec installs files only and does not contact services, handle credentials, collect learner data, or grant workflow authority.",
    metadata: {
      vendor: policies.policy.vendor_id,
      "vendor-release": policies.policy.release,
      "upstream-skill-id": admission.upstream_skill_id,
      "source-sha256": admission.source_sha256,
      "researchspec-role": "semantic-helper",
    },
    ...educationalMetadata,
    evidence_sources: evidenceSources,
  };
}

function renderBoundary(safety: EducationSafetyDomainDecision, policies: EducationPolicies): string {
  const lines = [
    BOUNDARY_START,
    `> **ResearchSpec evidence boundary:** ${policies.policy.evidence.rule}`,
    ...safety.boundary_keys.map((key) => `> **ResearchSpec ${boundaryLabel(key)} boundary:** ${policies.policy.safety.boundaries[key]}`),
    BOUNDARY_END,
  ];
  return lines.join("\n");
}

function boundaryLabel(key: EducationSafetyDomainDecision["boundary_keys"][number]): string {
  if (key === "learning-analytics") return "learning analytics";
  return key;
}

function markBodyEvidence(
  body: string,
  decisions: EducationEvidenceAdaptationDecision[],
  auditEvidenceById: ReadonlyMap<string, EducationEvidence>,
  markerOpen: string,
  markerClose: string,
): { body: string; matches: BodyEvidenceMatch[]; unmatchedEvidenceIds: string[] } {
  if (body.includes(markerOpen) || body.includes(markerClose)) throw new Error("Education source body already contains reserved unresolved markers.");
  const units = bodyUnits(body);
  const evidenceByUnit = new Map<string, { unit: TextUnit; evidenceIds: Set<string> }>();
  const unmatchedEvidenceIds: string[] = [];
  for (const decision of decisions) {
    const evidence = auditEvidenceById.get(decision.evidence_id);
    if (!evidence) throw new Error(`Education body adaptation references absent audit evidence: ${decision.evidence_id}`);
    const matches = units.filter((unit) => unitMatchesEvidence(unit.text, evidence));
    if (!matches.length) {
      unmatchedEvidenceIds.push(decision.evidence_id);
      continue;
    }
    for (const unit of matches) {
      const key = `${String(unit.start)}:${String(unit.end)}`;
      const entry = evidenceByUnit.get(key) ?? { unit, evidenceIds: new Set<string>() };
      entry.evidenceIds.add(decision.evidence_id);
      evidenceByUnit.set(key, entry);
    }
  }
  const matches = [...evidenceByUnit.values()]
    .map(({ unit, evidenceIds }): BodyEvidenceMatch => ({
      evidence_ids: [...evidenceIds].sort(compareText),
      start: unit.start,
      end: unit.end,
      unit_type: unit.type,
      source_text_sha256: sha256(unit.text),
    }))
    .sort((left, right) => left.start - right.start);
  let marked = body;
  for (const match of [...matches].reverse()) {
    marked = `${marked.slice(0, match.start)}${markerOpen}${marked.slice(match.start, match.end)}${markerClose}${marked.slice(match.end)}`;
  }
  return { body: marked, matches, unmatchedEvidenceIds: unmatchedEvidenceIds.sort(compareText) };
}

interface TextUnit {
  start: number;
  end: number;
  text: string;
  type: BodyEvidenceMatch["unit_type"];
}

function bodyUnits(body: string): TextUnit[] {
  const units: TextUnit[] = [];
  const paragraphPattern = /(?:^|\n\n+)([\s\S]*?)(?=\n\n+|$)/g;
  for (const match of body.matchAll(paragraphPattern)) {
    const text = match[1] ?? "";
    if (!text) continue;
    const full = match[0] ?? text;
    const prefixLength = full.length - text.length;
    const start = (match.index ?? 0) + prefixLength;
    const lines = lineUnits(text, start);
    if (lines) {
      units.push(...lines);
      continue;
    }
    const segments = sentenceUnits(text, start);
    if (segments.length) units.push(...segments);
    else units.push({ start, end: start + text.length, text, type: "paragraph" });
  }
  const normalized = units.map(trimTextUnit).filter((unit) => unit.end > unit.start);
  assertNonOverlapping(normalized);
  return normalized;
}

function lineUnits(text: string, base: number): TextUnit[] | null {
  const lines = text.split("\n");
  const classified = lines.map((line) => {
    const trimmed = line.trimStart();
    if (/^(?:[-*+]|\d+[.)])\s+/.test(trimmed)) return "list-item" as const;
    if (/^\|.*\|$/.test(trimmed)) return "table-row" as const;
    return null;
  });
  if (!classified.some(Boolean)) return null;
  const units: TextUnit[] = [];
  let offset = 0;
  let current: TextUnit | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const type = classified[index];
    if (type) {
      if (current) units.push(current);
      const contentStart = type === "list-item"
        ? line.match(/^\s*(?:[-*+]|\d+[.)])\s+/)?.[0].length ?? 0
        : line.indexOf("|") + 1 + (line.slice(line.indexOf("|") + 1).startsWith(" ") ? 1 : 0);
      const contentEnd = type === "table-row"
        ? Math.max(contentStart, line.lastIndexOf("|") - (line.slice(0, line.lastIndexOf("|")).endsWith(" ") ? 1 : 0))
        : line.length;
      current = {
        start: base + offset + contentStart,
        end: base + offset + contentEnd,
        text: line.slice(contentStart, contentEnd),
        type,
      };
    } else if (current) {
      if (line.trim()) {
        current.end = base + offset + line.length;
        current.text = text.slice(current.start - base, current.end - base);
      }
    } else if (line.trim()) {
      const sentence = sentenceUnits(line, base + offset);
      units.push(...(sentence.length ? sentence : [{ start: base + offset, end: base + offset + line.length, text: line, type: "paragraph" as const }]));
    }
    offset += line.length + (index < lines.length - 1 ? 1 : 0);
  }
  if (current) units.push(current);
  return units;
}

function sentenceUnits(text: string, base: number): TextUnit[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
  return [...segmenter.segment(text)].flatMap((segment): TextUnit[] => {
    const leading = segment.segment.match(/^\s*/)?.[0].length ?? 0;
    const trailing = segment.segment.match(/\s*$/)?.[0].length ?? 0;
    const content = segment.segment.slice(leading, segment.segment.length - trailing);
    if (!content.trim()) return [];
    const start = base + segment.index + leading;
    return [{ start, end: start + content.length, text: content, type: "sentence" }];
  });
}

function unitMatchesEvidence(text: string, evidence: EducationEvidence): boolean {
  const normalizedText = normalizeIdentity(text);
  const years = evidence.parsed_identity.years;
  if (years.length && !years.some((year) => text.includes(year))) return false;
  const authorTokens = identityAuthorTokens(evidence.parsed_identity.authors);
  if (!authorTokens.length) return false;
  return authorTokens.some((token) => normalizedText.includes(token));
}

function identityAuthorTokens(authors: string): string[] {
  const chunks = authors.split(/(?:,|&|\band\b|\bet al\.?)/i).map((item) => item.trim()).filter(Boolean);
  const values = new Set<string>();
  for (const chunk of chunks) {
    const normalizedChunk = normalizeIdentity(chunk);
    if (normalizedChunk.length >= 4) values.add(normalizedChunk);
    const last = normalizedChunk.split(" ").filter(Boolean).at(-1);
    if (last && last.length >= 4) values.add(last);
  }
  const full = normalizeIdentity(authors);
  if (full.length >= 6) values.add(full);
  return [...values].sort((left, right) => right.length - left.length || compareText(left, right));
}

function normalizeIdentity(value: string): string {
  return value.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();
}

function parseSourceSkill(source: string, label: string): { frontmatter: Record<string, unknown>; body: string } {
  if (!source.startsWith("---\n")) throw new Error(`Education Skill has no frontmatter: ${label}`);
  const end = source.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`Education Skill frontmatter is not closed: ${label}`);
  const value = parse(source.slice(4, end)) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Education Skill frontmatter is not an object: ${label}`);
  return { frontmatter: value as Record<string, unknown>, body: source.slice(end + 5) };
}

function assertNonOverlapping(units: TextUnit[]): void {
  const ordered = [...units].sort((left, right) => left.start - right.start || left.end - right.end);
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (previous && current && current.start < previous.end) throw new Error("Education body-unit parser produced overlapping units.");
  }
}

function trimTextUnit(unit: TextUnit): TextUnit {
  const leading = unit.text.match(/^\s*/)?.[0].length ?? 0;
  const trailing = unit.text.match(/\s*$/)?.[0].length ?? 0;
  const start = unit.start + leading;
  const end = unit.end - trailing;
  return { ...unit, start, end, text: unit.text.slice(leading, unit.text.length - trailing) };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
