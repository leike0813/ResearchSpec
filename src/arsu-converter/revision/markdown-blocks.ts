import { createHash } from "node:crypto";

export interface AnchoredMarkdownBlock {
  id: string;
  markerStart: number;
  end: number;
  content: string;
  hash: string;
}

export function parseAnchoredBlocks(text: string): AnchoredMarkdownBlock[] {
  const marker = /^<!--block:([A-Za-z0-9][A-Za-z0-9._-]*)-->[ \t]*(?:\r?\n|$)/gm;
  const matches = [...text.matchAll(marker)];
  const markerOccurrences = text.match(/<!--\s*block:/gi)?.length ?? 0;
  if (matches.length !== markerOccurrences) throw new Error("Draft contains a malformed or non-standalone block marker.");
  if (!matches.length) throw new Error("Draft has no ResearchSpec block markers.");
  const ids = new Set<string>();
  return matches.map((match, index) => {
    const id = match[1];
    if (!id || ids.has(id)) throw new Error(`Draft contains duplicate block marker: ${id ?? ""}`);
    ids.add(id);
    const markerStart = match.index ?? 0;
    const contentStart = markerStart + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const content = text.slice(contentStart, end);
    return { id, markerStart, end, content, hash: sha256(normalizeBlock(content)) };
  });
}

export function splitMarkdownBlocks(value: string): string[] {
  const normalized = value.replaceAll("\r\n", "\n").trim();
  if (!normalized) throw new Error("Inserted draft text is empty.");
  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | undefined;
  const flush = () => {
    if (current.length) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
  };
  for (const line of lines) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) fence = fence ? undefined : fenceMatch[1]?.[0];
    if (!fence && /^(?: {0,3}(?:=+|-+)\s*$|<[^!][^>]*>\s*$|\[\^[^\]]+\]:)/.test(line)) throw new Error("Inserted text contains an unsupported ambiguous Markdown block shape.");
    if (!fence && !line.trim()) { flush(); continue; }
    if (!fence && /^#{1,6}\s+/.test(line)) { flush(); current.push(line); flush(); continue; }
    current.push(line);
  }
  if (fence) throw new Error("Inserted text contains an unclosed code fence.");
  flush();
  return blocks;
}

export function markdownBodyStart(text: string): number {
  if (!text.startsWith("---")) return 0;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? 0 : text.indexOf("\n", end + 4) + 1;
}

export function markdownSectionHeadings(text: string): string[] {
  const headings: string[] = [];
  let fence: string | undefined;
  for (const line of text.replaceAll("\r\n", "\n").split("\n")) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) { fence = fence ? undefined : fenceMatch[1]?.[0]; continue; }
    if (fence) continue;
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]?.replace(/\s+#+\s*$/, "").trim();
    if (heading) headings.push(heading);
  }
  return headings;
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeBlock(value: string): string {
  return value.replaceAll("\r\n", "\n").replace(/^\n+|\n+$/g, "");
}
