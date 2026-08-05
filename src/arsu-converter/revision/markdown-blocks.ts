import { createHash } from "node:crypto";

export interface AnchoredMarkdownBlock {
  id: string;
  markerStart: number;
  end: number;
  content: string;
  hash: string;
}

export function parseAnchoredBlocks(text: string): AnchoredMarkdownBlock[] {
  const matches = standaloneBlockMarkers(text);
  if (!matches.length) throw new Error("Draft has no ResearchSpec block markers.");
  const ids = new Set<string>();
  return matches.map((match, index) => {
    const id = match.id;
    if (!id || ids.has(id)) throw new Error(`Draft contains duplicate block marker: ${id ?? ""}`);
    ids.add(id);
    const markerStart = match.index;
    const contentStart = markerStart + match.length;
    const end = matches[index + 1]?.index ?? text.length;
    const content = text.slice(contentStart, end);
    return { id, markerStart, end, content, hash: sha256(normalizeBlock(content)) };
  });
}

function standaloneBlockMarkers(text: string): Array<{ id: string; index: number; length: number }> {
  const markers: Array<{ id: string; index: number; length: number }> = [];
  const bodyStart = markdownBodyStart(text);
  let offset = bodyStart;
  let fence: { marker: "`" | "~"; length: number } | undefined;
  for (const match of text.slice(bodyStart).matchAll(/.*(?:\r?\n|$)/g)) {
    const line = match[0];
    if (!line) continue;
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n|$)/.exec(line);
    if (fenceMatch?.[1]) {
      const marker = fenceMatch[1][0] as "`" | "~";
      if (!fence) {
        fence = { marker, length: fenceMatch[1].length };
        offset += line.length;
        continue;
      }
      if (marker === fence.marker && fenceMatch[1].length >= fence.length && !(fenceMatch[2] ?? "").trim()) {
        fence = undefined;
        offset += line.length;
        continue;
      }
    }
    if (!fence) {
      const markerMatch = /^<!--block:([A-Za-z0-9][A-Za-z0-9._-]*)-->[ \t]*(?:\r?\n|$)/.exec(line);
      if (markerMatch?.[1]) markers.push({ id: markerMatch[1], index: offset, length: markerMatch[0].length });
      else if (/<!--\s*block:/i.test(line)) throw new Error("Draft contains a malformed or non-standalone block marker.");
    }
    offset += line.length;
  }
  return markers;
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
