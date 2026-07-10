import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ArsuConverterError } from "../types.js";
import { readContractAnchors } from "./io.js";
import { compactMarkerId } from "./markers.js";
import { getReplacementTemplate, hasReplacementTemplate, REPLACEMENT_PROFILE_ID } from "./templates.js";
import type {
  AnchorMatchRecord,
  AnchorMatchSpan,
  AnchorReplacementPlan,
  ContractAnchor,
} from "./types.js";

interface TextWindow {
  label: string;
  start: number;
  end: number;
  text: string;
  diagnostics: string[];
}

interface SnippetMatch {
  start: number;
  end: number;
}

export async function buildAnchorReplacementPlan(
  repoRoot: string,
  sourceRoot: string,
  sourceCommit: string,
): Promise<AnchorReplacementPlan> {
  const anchorFile = await readContractAnchors(repoRoot);
  const records: AnchorMatchRecord[] = [];
  const spansBySource = new Map<string, AnchorMatchSpan[]>();

  for (const anchor of anchorFile.anchors) {
    const replacementMode = anchor.severity === "diagnostic" ? "diagnostic" : "replace";
    const diagnostics: string[] = [];
    const sourceFile = path.join(sourceRoot, anchor.source_path);
    let text = "";
    try {
      text = await readFile(sourceFile, "utf8");
    } catch (error) {
      diagnostics.push(`source file missing or unreadable: ${formatError(error)}`);
      records.push(buildRecord(anchor, false, replacementMode, false, diagnostics));
      continue;
    }

    if (replacementMode === "replace" && !hasReplacementTemplate(anchor.template_id)) {
      diagnostics.push(`missing replacement template: ${anchor.template_id}`);
      records.push(buildRecord(anchor, false, replacementMode, false, diagnostics));
      continue;
    }

    const match = matchAnchor(anchor, text);
    diagnostics.push(...match.diagnostics);
    if (!match.span) {
      records.push(buildRecord(anchor, false, replacementMode, false, diagnostics));
      continue;
    }

    if (replacementMode === "replace") {
      const list = spansBySource.get(anchor.source_path) ?? [];
      list.push({ anchor, start: match.span.start, end: match.span.end });
      spansBySource.set(anchor.source_path, list);
    }

    const beforeText = text.slice(match.span.start, match.span.end);
    records.push(buildRecord(anchor, true, replacementMode, false, diagnostics, beforeText));
  }

  const overlapErrors = validateNoOverlaps(spansBySource);
  const missingBlocking = records
    .filter((record) => record.replacement_mode === "replace" && !record.matched)
    .map((record) => record.anchor_id);
  if (missingBlocking.length > 0 || overlapErrors.length > 0) {
    throw new ArsuConverterError(
      "anchor_match_failed",
      "ARSU contract anchor matching failed before generated output was touched.",
      [...missingBlocking.map((id) => `missing blocking anchor: ${id}`), ...overlapErrors],
    );
  }

  const matchedAnchors = records.filter((record) => record.matched).length;
  const replaceableAnchors = records.filter((record) => record.replacement_mode === "replace").length;
  const diagnosticAnchors = records.filter((record) => record.replacement_mode === "diagnostic").length;
  return {
    profile_id: REPLACEMENT_PROFILE_ID,
    coverage_policy: "required_and_recommended",
    source_commit: sourceCommit,
    total_anchors: records.length,
    replaceable_anchors: replaceableAnchors,
    diagnostic_anchors: diagnosticAnchors,
    matched_anchors: matchedAnchors,
    replaced_anchors: 0,
    diagnostic_matched: records.filter((record) => record.replacement_mode === "diagnostic" && record.matched).length,
    missing_blocking: missingBlocking,
    missing_diagnostic: records
      .filter((record) => record.replacement_mode === "diagnostic" && !record.matched)
      .map((record) => record.anchor_id),
    records,
    spans_by_source: spansBySource,
  };
}

export function matchAnchor(anchor: ContractAnchor, text: string): { span?: SnippetMatch; diagnostics: string[] } {
  const diagnostics: string[] = [];
  const failed: string[] = [];
  for (const window of selectWindows(text, anchor.match_hints.headings ?? [])) {
    const attempt = matchWithinWindow(anchor, window);
    if (attempt.span) {
      diagnostics.push(...window.diagnostics);
      return { span: attempt.span, diagnostics };
    }
    failed.push(...attempt.diagnostics.map((item) => `${window.label}: ${item}`));
  }

  diagnostics.push(...failed);
  return { diagnostics };
}

function buildRecord(
  anchor: ContractAnchor,
  matched: boolean,
  replacementMode: AnchorMatchRecord["replacement_mode"],
  replaced: boolean,
  diagnostics: string[],
  beforeText?: string,
): AnchorMatchRecord {
  const template = getReplacementTemplate(anchor.template_id);
  return {
    anchor_id: anchor.id,
    marker_id: compactMarkerId(anchor.id),
    source_path: anchor.source_path,
    owner_skill: anchor.owner_skill,
    contract_category: anchor.contract_category,
    severity: anchor.severity,
    template_id: anchor.template_id,
    semantic_role: template?.semantic_role,
    researchspec_targets: template?.researchspec_targets ?? [],
    replacement_shape: template?.replacement_shape,
    matched,
    replacement_mode: replacementMode,
    replaced,
    output_paths: [],
    before_sha256: beforeText ? sha256Text(beforeText) : undefined,
    before_text: beforeText,
    diagnostics,
  };
}

function matchWithinWindow(anchor: ContractAnchor, window: TextWindow): { span?: SnippetMatch; diagnostics: string[] } {
  const diagnostics: string[] = [];
  for (const keyword of anchor.match_hints.keywords ?? []) {
    if (!window.text.toLowerCase().includes(keyword.toLowerCase())) {
      diagnostics.push(`keyword not found: ${keyword}`);
      return { diagnostics };
    }
  }

  const snippetMatches: SnippetMatch[] = [];
  for (const snippet of anchor.match_hints.snippets ?? []) {
    const match = findSnippet(window.text, snippet);
    if (!match) {
      diagnostics.push(`snippet not found: ${snippet}`);
      return { diagnostics };
    }
    snippetMatches.push({
      start: window.start + match.start,
      end: window.start + match.end,
    });
  }

  if (anchor.severity === "diagnostic") {
    if (snippetMatches.length === 0) return { span: { start: window.start, end: window.end }, diagnostics };
    const basis = snippetMatches[0];
    return { span: expandRangeToLineBounds(window.text, window.start, basis.start, basis.end), diagnostics };
  }

  const scope = anchor.replacement_scope;
  if (!scope) return { diagnostics: ["replacement scope is missing"] };
  const startMatches = findAllSnippets(window.text, scope.start_snippet);
  const endMatches = scope.end_snippet === scope.start_snippet
    ? startMatches
    : findAllSnippets(window.text, scope.end_snippet);
  if (startMatches.length !== 1) {
    return { diagnostics: [`replacement start boundary matched ${String(startMatches.length)} times`] };
  }
  if (endMatches.length !== 1) {
    return { diagnostics: [`replacement end boundary matched ${String(endMatches.length)} times`] };
  }
  const start = startMatches[0];
  const end = endMatches[0];
  if (end.end < start.start) return { diagnostics: ["replacement boundaries are reversed"] };
  return {
    span: expandRangeToLineBounds(
      window.text,
      window.start,
      window.start + start.start,
      window.start + end.end,
    ),
    diagnostics,
  };
}

function selectWindows(text: string, headings: string[]): TextWindow[] {
  if (headings.length === 0) return [{ label: "full-file", start: 0, end: text.length, text, diagnostics: [] }];
  const headingList = collectHeadings(text);
  const windows: TextWindow[] = [];
  for (const wanted of headings) {
    const heading = headingList.find((item) => item.title === wanted);
    if (!heading) continue;
    const next = headingList.find((item) => item.start > heading.start && item.level <= heading.level);
    const end = next?.start ?? text.length;
    windows.push({ label: `heading:${wanted}`, start: heading.start, end, text: text.slice(heading.start, end), diagnostics: [] });
  }
  windows.push({
    label: "full-file",
    start: 0,
    end: text.length,
    text,
    diagnostics: windows.length === 0 ? [`heading hint not found, searched full file: ${headings.join(" | ")}`] : [],
  });
  return windows;
}

function collectHeadings(text: string): Array<{ level: number; title: string; start: number }> {
  const headings: Array<{ level: number; title: string; start: number }> = [];
  const re = /^(#{1,6})\s+(.+?)\s*$/gm;
  for (const match of text.matchAll(re)) {
    if (typeof match.index !== "number") continue;
    headings.push({ level: match[1].length, title: match[2], start: match.index });
  }
  return headings;
}

function findSnippet(text: string, snippet: string): SnippetMatch | null {
  const pattern = snippet
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join("\\s+");
  const match = new RegExp(pattern, "i").exec(text);
  if (!match || typeof match.index !== "number") return null;
  return { start: match.index, end: match.index + match[0].length };
}

function findAllSnippets(text: string, snippet: string): SnippetMatch[] {
  const pattern = snippet
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join("\\s+");
  const matches: SnippetMatch[] = [];
  const re = new RegExp(pattern, "gi");
  for (const match of text.matchAll(re)) {
    if (typeof match.index !== "number") continue;
    matches.push({ start: match.index, end: match.index + match[0].length });
  }
  return matches;
}

function expandRangeToLineBounds(windowText: string, windowStart: number, absoluteStart: number, absoluteEnd: number): SnippetMatch {
  const localStart = absoluteStart - windowStart;
  const localEnd = absoluteEnd - windowStart;
  const lineStart = windowText.lastIndexOf("\n", Math.max(0, localStart - 1)) + 1;
  const nextNewline = windowText.indexOf("\n", localEnd);
  const lineEnd = nextNewline === -1 ? windowText.length : nextNewline + 1;
  return {
    start: windowStart + lineStart,
    end: windowStart + lineEnd,
  };
}

function validateNoOverlaps(spansBySource: Map<string, AnchorMatchSpan[]>): string[] {
  const errors: string[] = [];
  for (const [sourcePath, spans] of spansBySource) {
    const sorted = [...spans].sort((left, right) => left.start - right.start || left.end - right.end);
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      if (current.start < previous.end) {
        errors.push(`overlapping anchors in ${sourcePath}: ${previous.anchor.id} overlaps ${current.anchor.id}`);
      }
    }
  }
  return errors;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
