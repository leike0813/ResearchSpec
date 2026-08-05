import { createHash } from "node:crypto";

export type DocumentFormat = "markdown" | "quarto" | "latex";

export interface ProtectedSpan {
  kind: "frontmatter" | "code" | "math" | "link" | "citation" | "latex-command";
  start: number;
  end: number;
  text: string;
}

export interface SentenceStat {
  index: number;
  text: string;
  words: number;
  start: number;
  end: number;
}

export interface DocumentAnalysis {
  format: DocumentFormat;
  sourceHash: string;
  text: string;
  protectedSpans: ProtectedSpan[];
  sentences: SentenceStat[];
  paragraphCount: number;
  wordCount: number;
  diagnostics: Array<{ code: string; message: string; severity: "warning" | "error" }>;
}

export class DocumentPipelineError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "DocumentPipelineError";
  }
}

export function detectFormat(fileName: string, text = ""): DocumentFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".qmd")) return "quarto";
  if (lower.endsWith(".tex") || lower.endsWith(".latex")) return "latex";
  if (/^\\s*---\\s*\\n[\s\S]*?\\n---\\s*(?:\\n|$)/.test(text) && /(^|\\n)format:\s*(?:html|pdf|docx)/m.test(text)) return "quarto";
  return "markdown";
}

export function analyzeDocument(text: string, fileName = "manuscript.md"): DocumentAnalysis {
  if (typeof text !== "string" || text.length === 0) throw new DocumentPipelineError("empty_document", "Document must not be empty.");
  const format = detectFormat(fileName, text);
  const protectedSpans = collectProtectedSpans(text, format);
  const masked = maskSpans(text, protectedSpans);
  const sentences = splitSentences(masked).map((item, index) => ({ ...item, index, text: restore(item.text, text, protectedSpans) }));
  const words = masked.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9'’-]*/g) ?? [];
  const paragraphs = masked.split(/\n\s*\n/).filter((item) => item.trim().length > 0);
  const diagnostics: DocumentAnalysis["diagnostics"] = [];
  if (format === "latex" && (text.match(/\\begin\{/g)?.length ?? 0) !== (text.match(/\\end\{/g)?.length ?? 0)) {
    diagnostics.push({ code: "unbalanced_environment", message: "LaTeX environment delimiters are unbalanced.", severity: "error" });
  }
  if (sentences.some((sentence) => sentence.words > 45)) diagnostics.push({ code: "long_sentence", message: "One or more sentences exceed 45 words.", severity: "warning" });
  return { format, sourceHash: sha256(text), text, protectedSpans, sentences, paragraphCount: paragraphs.length, wordCount: words.length, diagnostics };
}

export function serializeDocument(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

export function roundTrip(text: string, fileName = "manuscript.md"): string {
  analyzeDocument(text, fileName);
  return serializeDocument(text);
}

export function computePlanHash(analysis: Pick<DocumentAnalysis, "sourceHash" | "protectedSpans" | "sentences">, plan: unknown): string {
  const canonical = JSON.stringify({ source_hash: analysis.sourceHash, protected_spans: analysis.protectedSpans.map(({ kind, start, end, text }) => ({ kind, start, end, text })), sentences: analysis.sentences.map(({ index, words }) => ({ index, words })), plan });
  return sha256(canonical);
}

export function validateCandidate(original: DocumentAnalysis, candidate: string, planHash: string, plan: unknown, fileName = "manuscript.md"): { ok: true; analysis: DocumentAnalysis } | { ok: false; code: string; message: string } {
  if (computePlanHash(original, plan) !== planHash) return { ok: false, code: "stale_plan", message: "The revision plan hash does not match the current analysis." };
  let next: DocumentAnalysis;
  try { next = analyzeDocument(candidate, fileName); }
  catch (error) { return { ok: false, code: error instanceof DocumentPipelineError ? error.code : "candidate_invalid", message: error instanceof Error ? error.message : String(error) }; }
  const originalProtected = original.protectedSpans.map((span) => span.text);
  const candidateProtected = next.protectedSpans.map((span) => span.text);
  for (const value of originalProtected) if (!candidateProtected.includes(value)) return { ok: false, code: "protected_content_changed", message: "A protected source region was changed or removed." };
  return { ok: true, analysis: next };
}

function collectProtectedSpans(text: string, format: DocumentFormat): ProtectedSpan[] {
  const spans: ProtectedSpan[] = [];
  const add = (kind: ProtectedSpan["kind"], regex: RegExp): void => {
    for (const match of text.matchAll(regex)) {
      const start = match.index ?? 0;
      spans.push({ kind, start, end: start + match[0].length, text: match[0] });
    }
  };
  if (/^---\s*\n/.test(text)) {
    const end = text.indexOf("\n---", 4);
    if (end >= 0) spans.push({ kind: "frontmatter", start: 0, end: end + 4, text: text.slice(0, end + 4) });
  }
  add("code", /```[\s\S]*?```|~~~[\s\S]*?~~~/g);
  add("math", /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:equation|align\*?|gather\*?)[^]*?\\end\{(?:equation|align\*?|gather\*?)\}/g);
  add("citation", /[@\\]cite[a-zA-Z*]*(?:\[[^\]]*\])?\{[^}]+\}|\[[^\]]*@[A-Za-z0-9:_-]+[^\]]*\]/g);
  add("link", /!?\[[^\]]*\]\([^)]*\)|<https?:\/\/[^>]+>/g);
  if (format === "latex") add("latex-command", /\\(?:ref|label|cite|url|href|footnote)\b(?:\[[^\]]*\])?(?:\{[^}]*\})+/g);
  return mergeSpans(spans);
}

function maskSpans(text: string, spans: ProtectedSpan[]): string {
  let result = text;
  for (const span of [...spans].sort((a, b) => b.start - a.start)) result = `${result.slice(0, span.start)}${" ".repeat(span.end - span.start)}${result.slice(span.end)}`;
  return result;
}

function restore(masked: string, source: string, spans: ProtectedSpan[]): string {
  const start = masked.search(/\S/);
  if (start < 0) return "";
  const trailingWhitespace = masked.split(/\S/).pop() ?? "";
  const end = masked.length - trailingWhitespace.length;
  let result = masked.slice(start, end);
  for (const span of spans) {
    if (span.start < end && span.end > start) result = `${result.slice(0, Math.max(0, span.start - start))}${source.slice(span.start, span.end)}${result.slice(Math.max(0, span.end - start))}`;
  }
  return result.trim();
}

function splitSentences(text: string): Array<Omit<SentenceStat, "index" | "text"> & { text: string }> {
  const result: Array<Omit<SentenceStat, "index" | "text"> & { text: string }> = [];
  const regex = /[^.!?\n]+(?:[.!?]+|$)/g;
  for (const match of text.matchAll(regex)) {
    const raw = match[0].trim();
    if (!raw) continue;
    const start = (match.index ?? 0) + match[0].indexOf(raw);
    result.push({ text: raw, words: raw.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9'’-]*/g)?.length ?? 0, start, end: start + raw.length });
  }
  return result;
}

function mergeSpans(spans: ProtectedSpan[]): ProtectedSpan[] {
  const sorted = spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const result: ProtectedSpan[] = [];
  for (const span of sorted) {
    const prior = result.at(-1);
    if (prior && span.start < prior.end) {
      if (span.end > prior.end) result[result.length - 1] = { ...prior, end: span.end, text: prior.text + span.text.slice(Math.max(0, prior.end - span.start)) };
    } else result.push(span);
  }
  return result;
}

function sha256(value: string): string { return createHash("sha256").update(value).digest("hex"); }
