#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const EXTRACTION_ROOT = path.join(ROOT, "authoring", "ars");
const UPSTREAM_ROOT = path.join(ROOT, "vendor", "ars");
const OUTPUT = path.join(EXTRACTION_ROOT, "extraction-index.json");
const DEFAULT_MILESTONES = [
  "m1-research",
  "m2-writing",
  "m3-integrity-review",
  "m4-revision-finalize",
  "m5-side-branches",
];
const ARTIFACT_SUFFIXES = new Set([".md", ".py", ".json"]);

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const requested = args.filter((arg) => !arg.startsWith("--"));
const milestones = requested.length > 0
  ? requested
  : DEFAULT_MILESTONES.filter((name) => existsSync(path.join(EXTRACTION_ROOT, name, "review-notes.md")));

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function parseHeader(text) {
  const match = text.match(/<!--([\s\S]*?)-->/);
  if (!match) return undefined;
  const body = text.slice((match.index ?? 0) + match[0].length).replace(/^\n+/, "");
  const headerLines = match[1].replace(/\r\n/g, "\n").split("\n");
  const parsed = { header: match[1], body, lines: headerLines };
  let mode = "";
  for (const raw of headerLines) {
    const line = raw.trim();
    if (line.startsWith("工件类型:")) {
      parsed.kind = line.slice(line.indexOf(":") + 1).trim();
      mode = "";
    } else if (line.startsWith("能力/包 ID:")) {
      parsed.id = line.slice(line.indexOf(":") + 1).trim();
      mode = "";
    } else if (line.startsWith("来源对照（source mapping）:") || line.startsWith("来源对照")) {
      mode = "source";
    } else if (line.startsWith("变更台账（ledger）:") || line.startsWith("变更台账")) {
      mode = "ledger";
    } else if (line.startsWith("说明:")) {
      mode = "note";
    } else if (mode === "source" && line.startsWith("- ")) {
      (parsed.sources ??= []).push(line.slice(2).trim());
    } else if (mode === "ledger" && /^\d+\.\s/.test(line)) {
      (parsed.ledger ??= []).push(line.replace(/^\d+\.\s*/, "").trim());
    }
  }
  return parsed;
}

function parseArtifactId(rawId) {
  const text = rawId?.trim() ?? "";
  const match = text.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/s);
  return match ? { artifact_id: match[1], name: match[2].trim() } : { artifact_id: "", name: text };
}

function parseUpstreamSource(rawSource) {
  const fileMatch = rawSource.match(/^vendor\/ars\/(.+\.(?:md|py|json))/);
  if (!fileMatch) return { status: "unparsed", raw: rawSource };
  const upstreamFile = fileMatch[1];
  const upstreamPath = path.join(UPSTREAM_ROOT, ...upstreamFile.split("/"));
  const ranges = [...rawSource.matchAll(/L(\d+)-(\d+)/g)];
  const range = ranges.at(-1);
  return {
    status: "parsed",
    raw: rawSource,
    upstream_file: upstreamFile,
    ...(range ? { start_line: Number(range[1]), end_line: Number(range[2]) } : {}),
    upstream_path: path.relative(ROOT, upstreamPath),
  };
}

function verifyArtifact(parsed) {
  const sourceLine = (parsed.sources ?? []).find((line) => line.startsWith("vendor/ars/"));
  if (!sourceLine) {
    return { status: "skip", detail: "no vendor/ars source mapping" };
  }
  const source = parseUpstreamSource(sourceLine);
  if (source.status !== "parsed") return { status: "error", detail: source.raw };
  if (!existsSync(source.upstream_path)) {
    return { status: "error", detail: `upstream file missing: ${source.upstream_path}` };
  }
  const upstreamText = readFileSync(source.upstream_path, "utf8");
  const expectedText = source.start_line
    ? `${upstreamText.split("\n").slice(source.start_line - 1, source.end_line).join("\n")}\n`
    : upstreamText;
  const actualHash = sha256(parsed.body);
  const expectedHash = sha256(expectedText);
  return {
    status: actualHash === expectedHash ? "pass" : "fail",
    detail: actualHash === expectedHash
      ? `sha256 match · ${parsed.body.split("\n").length} artifact lines vs ${expectedText.split("\n").length} upstream slice lines`
      : "sha256 mismatch",
    actual_sha256: actualHash,
    expected_sha256: expectedHash,
  };
}

function collectArtifacts(milestoneNames) {
  const artifacts = [];
  for (const milestone of [...milestoneNames].sort()) {
    const milestoneDir = path.join(EXTRACTION_ROOT, milestone);
    if (!existsSync(path.join(milestoneDir, "review-notes.md"))) {
      throw new Error(`Milestone review notes are missing: ${milestone}`);
    }
    const files = [];
    const walk = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(target);
        else if (entry.isFile() && ARTIFACT_SUFFIXES.has(path.extname(entry.name)) && entry.name !== "review-notes.md") files.push(target);
      }
    };
    walk(milestoneDir);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (!text.includes("ARS 提取工件")) continue;
      const parsed = parseHeader(text);
      if (!parsed) throw new Error(`Artifact header is malformed: ${file}`);
      const id = parseArtifactId(parsed.id);
      const verification = verifyArtifact(parsed);
      artifacts.push({
        milestone,
        path: path.relative(ROOT, file).split(path.sep).join("/"),
        relative_path: path.relative(milestoneDir, file).split(path.sep).join("/"),
        kind: parsed.kind ?? "unknown",
        artifact_id: id.artifact_id,
        name: id.name,
        sources: parsed.sources ?? [],
        ledger: parsed.ledger ?? [],
        sha256: sha256(parsed.body),
        verification,
      });
    }
  }
  return artifacts.sort((left, right) => left.path.localeCompare(right.path));
}

function buildIndex() {
  const artifacts = collectArtifacts(milestones);
  const summary = Object.fromEntries(
    milestones.map((milestone) => {
      const items = artifacts.filter((item) => item.milestone === milestone);
      return [milestone, {
        total: items.length,
        pass: items.filter((item) => item.verification.status === "pass").length,
        fail: items.filter((item) => item.verification.status === "fail").length,
        error: items.filter((item) => item.verification.status === "error").length,
        skip: items.filter((item) => item.verification.status === "skip").length,
      }];
    }),
  );
  const statuses = artifacts.reduce((acc, item) => {
    acc[item.verification.status] = (acc[item.verification.status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    schema_version: "1",
    source: "vendor/ars",
    extraction_root: "authoring/ars",
    milestone_count: milestones.length,
    artifact_count: artifacts.length,
    verification_summary: statuses,
    milestones: summary,
    artifacts,
  };
}

const index = buildIndex();
if (index.verification_summary.fail > 0 || index.verification_summary.error > 0) {
  process.stderr.write(`Extraction verification is not clean: ${JSON.stringify(index.verification_summary)}\n`);
  process.exitCode = 1;
}
if (checkOnly) {
  if (!existsSync(OUTPUT)) {
    process.stderr.write(`Extraction index is missing: ${OUTPUT}\n`);
    process.exitCode = 1;
  } else {
    const current = readFileSync(OUTPUT, "utf8");
    const expected = `${JSON.stringify(index, null, 2)}\n`;
    if (current !== expected) {
      process.stderr.write("Extraction index is stale; run `pnpm extraction:index`.\n");
      process.exitCode = 1;
    }
  }
} else {
  writeFileSync(OUTPUT, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}
