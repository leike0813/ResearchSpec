#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import MarkdownIt from "markdown-it";

const anchor = process.env.ARSU_ANCHOR ?? "v3.22.2-7de1c9d";
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), "audits", "arsu", anchor, "artifacts", "arsu-mode-gap-semantic-review.html");
const source = path.resolve(path.dirname(output), "..", "05-semantic-review.md");
const markdown = existsSync(source) ? readFileSync(source, "utf8") : "# ARSU 语义审阅\n\n[NOT-COMPLETED] 本锚点的 Agent 语义审阅尚未完成。";
const body = new MarkdownIt({ html: false, linkify: false }).render(markdown);
writeFileSync(output, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARSU 语义审阅</title>
<style>body{max-width:1200px;margin:2rem auto;padding:0 1rem;font:16px/1.7 system-ui,sans-serif;color:#243044}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd3dc;padding:.5rem;text-align:left;vertical-align:top}pre{overflow:auto;background:#f3f5f8;padding:1rem}code{overflow-wrap:anywhere}a{color:#245da8}</style>
</head><body>${body}</body></html>\n`, "utf8");
process.stdout.write(`wrote ${output}\n`);
