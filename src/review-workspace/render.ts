import MarkdownIt from "markdown-it";

import type { ReviewBlock } from "./v2.js";

type BlockKind = ReviewBlock["kind"];
type ImageIds = Readonly<Record<string, string>>;
type Piece = { kind: "text"; text: string; marks: ReviewBlock["runs"][number]["marks"] } | { kind: "formula" | "image" | "citation"; text: string; resource: string | null };

function block(id: string, kind: BlockKind, text: string, sourcePath: string | null, options: Partial<Pick<ReviewBlock, "level" | "resource_id" | "note" | "runs">> = {}): ReviewBlock {
  return { id, kind, text, runs: options.runs ?? [], level: options.level ?? null, source_path: sourcePath, resource_id: options.resource_id ?? null, note: options.note ?? null };
}

const nextId = (blocks: ReviewBlock[]): string => "b" + String(blocks.length + 1);
const asString = (value: unknown): string => typeof value === "string" ? value : "";

function emitPieces(blocks: ReviewBlock[], pieces: Piece[], kind: BlockKind, sourcePath: string | null, imageIds: ImageIds, level: number | null = null): void {
  let runs: ReviewBlock["runs"] = [];
  const flush = () => {
    if (runs.length === 0) return;
    const text = runs.map((run) => run.text).join("");
    blocks.push(block(nextId(blocks), kind, text, sourcePath, { runs, level }));
    runs = [];
  };
  for (const piece of pieces) {
    if (piece.kind === "text") { runs.push({ text: piece.text, marks: piece.marks }); continue; }
    flush();
    if (piece.kind === "image") {
      const asset = piece.resource ? imageIds[piece.resource] : undefined;
      if (asset) blocks.push(block(nextId(blocks), "image", piece.text || "图片", sourcePath, { resource_id: asset }));
      else blocks.push(block(nextId(blocks), "raw-source", piece.text || `![图片](${piece.resource ?? ""})`, sourcePath, { note: "图片资源未捕获" }));
    } else blocks.push(block(nextId(blocks), piece.kind, piece.text, sourcePath, { resource_id: piece.resource }));
  }
  flush();
}

function splitCitations(text: string, marks: ReviewBlock["runs"][number]["marks"]): Piece[] {
  const pieces: Piece[] = [];
  const pattern = /\[@([A-Za-z0-9_.:-]+)(?:[^\]]*)\]/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) pieces.push({ kind: "text", text: text.slice(last, match.index), marks });
    pieces.push({ kind: "citation", text: match[0], resource: match[1] ?? null });
    last = match.index + match[0].length;
  }
  if (last < text.length) pieces.push({ kind: "text", text: text.slice(last), marks });
  return pieces;
}

function markdownInline(tokens: ReturnType<typeof markdown.parse>): Piece[] {
  const pieces: Piece[] = [];
  const marks: ReviewBlock["runs"][number]["marks"] = [];
  for (const token of tokens) {
    if (token.type === "strong_open") { marks.push("strong"); continue; }
    if (token.type === "em_open") { marks.push("emphasis"); continue; }
    if (token.type === "link_open") { marks.push("link"); continue; }
    if (token.type === "strong_close" || token.type === "em_close" || token.type === "link_close") { marks.pop(); continue; }
    if (token.type === "image") { pieces.push({ kind: "image", text: token.content, resource: token.attrGet("src") }); continue; }
    if (token.type === "math_inline") { pieces.push({ kind: "formula", text: token.content, resource: null }); continue; }
    if (token.type === "softbreak" || token.type === "hardbreak") { pieces.push({ kind: "text", text: "\n", marks: [...marks] }); continue; }
    if (token.type === "text" || token.type === "code_inline" || token.type === "html_inline") pieces.push(...splitCitations(token.content, token.type === "code_inline" ? ["code"] : [...marks]));
  }
  return pieces;
}

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: true });
markdown.inline.ruler.before("escape", "review_math_inline", (state, silent) => {
  if (state.src[state.pos] !== "$" || state.src[state.pos + 1] === "$") return false;
  let end = state.pos + 1;
  while ((end = state.src.indexOf("$", end)) > state.pos) {
    if (state.src[end - 1] !== "\\" && state.src.slice(state.pos + 1, end).trim()) break;
    end += 1;
  }
  if (end < 0) return false;
  if (!silent) state.push("math_inline", "math", 0).content = state.src.slice(state.pos + 1, end);
  state.pos = end + 1;
  return true;
});

export function reviewBlocksFromMarkdown(source: string, sourcePath: string, imageIds: ImageIds = {}): ReviewBlock[] {
  const blocks: ReviewBlock[] = [];
  const footnotes: Array<{ id: string; text: string }> = [];
  const withoutFootnotes = source.replace(/^\[\^([^\]]+)\]:\s*(.*)$/gm, (_whole, id: string, text: string) => { footnotes.push({ id, text }); return ""; });
  const parts = withoutFootnotes.split(/\$\$([\s\S]*?)\$\$/g);
  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex] ?? "";
    if (partIndex % 2 === 1) { blocks.push(block(nextId(blocks), "formula", part.trim(), sourcePath)); continue; }
    const tokens = markdown.parse(part, {});
    let kind: BlockKind | null = null;
    let level: number | null = null;
    for (const token of tokens) {
      if (token.type === "heading_open") { kind = "heading"; level = Number(token.tag.slice(1)); continue; }
      if (token.type === "paragraph_open") { kind = "paragraph"; level = null; continue; }
      if (token.type === "th_open" || token.type === "td_open") { kind = "table-cell"; level = null; continue; }
      if (token.type === "fence" || token.type === "code_block") { blocks.push(block(nextId(blocks), "code", token.content, sourcePath)); continue; }
      if (token.type === "inline" && kind) emitPieces(blocks, markdownInline(token.children ?? []), kind, sourcePath, imageIds, level);
    }
  }
  for (const item of footnotes) blocks.push(block(nextId(blocks), "footnote", `${item.id}: ${item.text}`, sourcePath));
  if (blocks.length === 0) blocks.push(block("b1", "raw-source", source, sourcePath, { note: "未能解析正文" }));
  return blocks;
}

type PandocNode = { t: string; c?: unknown };
const isNode = (value: unknown): value is PandocNode => typeof value === "object" && value !== null && "t" in value && typeof (value as PandocNode).t === "string";
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function pandocInline(nodes: unknown[], notes: string[] = []): Piece[] {
  const pieces: Piece[] = [];
  const walk = (node: unknown, marks: ReviewBlock["runs"][number]["marks"] = []) => {
    if (!isNode(node)) return;
    if (node.t === "Str") { pieces.push(...splitCitations(asString(node.c), marks)); return; }
    if (node.t === "Space" || node.t === "SoftBreak" || node.t === "LineBreak") { pieces.push({ kind: "text", text: node.t === "Space" ? " " : "\n", marks }); return; }
    if (node.t === "Code") { pieces.push({ kind: "text", text: asString(asArray(node.c)[1]), marks: [...marks, "code"] }); return; }
    if (node.t === "Math") { pieces.push({ kind: "formula", text: asString(asArray(node.c)[1]), resource: null }); return; }
    if (node.t === "Span") {
      const value = asArray(node.c);
      const classes = asArray(asArray(value[0])[1]);
      if (classes.includes("math")) {
        const raw = pandocInline(asArray(value[1]), notes).map((part) => part.text).join("");
        pieces.push({ kind: "formula", text: raw.replace(/^\\[([]/, "").replace(/\\[)\]]$/, ""), resource: null });
      } else for (const child of asArray(value[1])) walk(child, marks);
      return;
    }
    if (node.t === "Image") { const value = asArray(node.c); pieces.push({ kind: "image", text: pandocInline(asArray(value[1]), notes).map((part) => part.text).join(""), resource: asString(asArray(value[2])[0]) }); return; }
    if (node.t === "Cite") { pieces.push({ kind: "citation", text: pandocInline(asArray(asArray(node.c)[1]), notes).map((part) => part.text).join("") || "[引用]", resource: (asArray(asArray(node.c)[0])[0] as { citationId?: string } | undefined)?.citationId ?? "" }); return; }
    if (node.t === "Note") {
      const content = asArray(node.c).filter(isNode).flatMap((item) => pandocInline(asArray(item.c), notes)).map((part) => part.text).join("");
      notes.push(content);
      pieces.push({ kind: "citation", text: "[脚注 " + String(notes.length) + "]", resource: "note-" + String(notes.length) });
      return;
    }
    const mark = node.t === "Strong" ? "strong" : node.t === "Emph" ? "emphasis" : node.t === "Link" ? "link" : null;
    const children = node.t === "Link" ? asArray(asArray(node.c)[1]) : asArray(node.c);
    for (const child of children) walk(child, mark ? [...marks, mark] as typeof marks : marks);
  };
  for (const node of nodes) walk(node);
  return pieces;
}

export function reviewBlocksFromPandocAst(ast: unknown, sourcePath: string, imageIds: ImageIds = {}, fallbacks: Array<{ text: string; source_path: string; note: string }> = []): ReviewBlock[] {
  const root = ast as { blocks?: unknown[] };
  if (!Array.isArray(root?.blocks)) throw new Error("Pandoc JSON has no blocks.");
  const blocks: ReviewBlock[] = [];
  const notes: string[] = [];
  const walk = (node: unknown, inTable = false) => {
    if (!isNode(node)) { for (const child of asArray(node)) walk(child, inTable); return; }
    const value = asArray(node.c);
    if (node.t === "Header") { emitPieces(blocks, pandocInline(asArray(value[2]), notes), "heading", sourcePath, imageIds, Number(value[0])); return; }
    if (node.t === "Para" || node.t === "Plain") { emitPieces(blocks, pandocInline(value, notes), inTable ? "table-cell" : "paragraph", sourcePath, imageIds); return; }
    if (node.t === "CodeBlock") { blocks.push(block(nextId(blocks), "code", asString(value[1]), sourcePath)); return; }
    if (node.t === "RawBlock") { blocks.push(block(nextId(blocks), "raw-source", asString(value[1]), sourcePath, { note: "原始内容" })); return; }
    if (node.t === "Table") { for (const child of value) walk(child, true); return; }
    for (const child of value) walk(child, inTable);
  };
  for (const item of root.blocks) walk(item);
  for (const [index, text] of notes.entries()) blocks.push(block(nextId(blocks), "footnote", String(index + 1) + ": " + text, sourcePath));
  for (const fallback of fallbacks) blocks.push(block(nextId(blocks), "raw-source", fallback.text, fallback.source_path, { note: fallback.note }));
  if (blocks.length === 0) throw new Error("Rendered document has no visible blocks; provide a raw-source fallback.");
  return blocks;
}
