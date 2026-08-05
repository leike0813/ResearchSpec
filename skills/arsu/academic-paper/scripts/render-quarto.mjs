#!/usr/bin/env node

import { spawn } from "node:child_process";
import { link, lstat, mkdir, mkdtemp, rm, unlink } from "node:fs/promises";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));

try {
  if (args.probe) {
    process.stdout.write(`${JSON.stringify(await probe())}\n`);
  } else {
    const result = await render(args);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  }
} catch (error) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "quarto_render_failed";
  process.stderr.write(`${JSON.stringify({ ok: false, code, message: error instanceof Error ? error.message : String(error) })}\n`);
  process.exitCode = 1;
}

async function render(options) {
  const source = path.resolve(required(options.source, "--source"));
  const output = path.resolve(required(options.output, "--output"));
  const format = safeFormat(required(options.format, "--format"));
  if (path.extname(source).toLowerCase() !== ".qmd") fail("quarto_source_extension_invalid", "Quarto source must end in .qmd.");
  if (source === output) fail("quarto_destination_invalid", "Output must differ from the source path.");
  await regularFile(source, "quarto_source_invalid", "Quarto source must be a regular file.");
  if (await exists(output)) fail("quarto_destination_exists", "Output already exists and will not be overwritten.");
  if (options.execute && (!options.consentBy?.trim() || Number.isNaN(Date.parse(options.consentAt ?? "")))) {
    fail("quarto_render_consent_required", "--execute requires --consent-by and --consent-at for this formatting subflow.");
  }

  const availability = await probe();
  if (availability.status !== "available") fail(availability.status === "unavailable" ? "quarto_unavailable" : "quarto_status_unknown", availability.reason);

  const outputDir = path.dirname(output);
  await mkdir(outputDir, { recursive: true });
  const stage = await mkdtemp(path.join(outputDir, ".researchspec-quarto-"));
  const stagedOutput = path.join(stage, path.basename(output));
  try {
    const result = await run([
      "render",
      path.basename(source),
      "--to",
      format,
      "--output",
      stagedOutput,
      ...(options.execute ? [] : ["--no-execute"]),
    ], path.dirname(source), Number(options.timeoutMs ?? 120_000));
    if (result.exitCode !== 0) fail("quarto_render_failed", reason(result.stderr || `Quarto exited with code ${String(result.exitCode)}.`));
    await regularFile(stagedOutput, "quarto_output_missing", "Quarto did not create the expected staged output.");
    try {
      await link(stagedOutput, output);
    } catch (error) {
      if (error?.code === "EEXIST") fail("quarto_destination_exists", "Output appeared during delivery and was not overwritten.");
      throw error;
    }
    await unlink(stagedOutput);
    return { ok: true, source, output, format, renderer: "quarto", execution: options.execute ? "consented" : "disabled", quarto: availability };
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

async function probe() {
  const checkedAt = new Date().toISOString();
  try {
    const result = await run(["--version"], undefined, 5_000);
    if (result.exitCode !== 0) return { status: "unknown", checked_at: checkedAt, reason: reason(result.stderr || `Quarto exited with code ${String(result.exitCode)}.`) };
    const version = result.stdout.split(/\r?\n/u).map((line) => line.trim()).find(Boolean);
    return version ? { status: "available", checked_at: checkedAt, version } : { status: "unknown", checked_at: checkedAt, reason: "Quarto returned no version." };
  } catch (error) {
    if (error?.code === "ENOENT") return { status: "unavailable", checked_at: checkedAt, reason: "Quarto executable was not found." };
    return { status: "unknown", checked_at: checkedAt, reason: reason(error instanceof Error ? error.message : String(error)) };
  }
}

async function run(commandArgs, cwd, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.QUARTO_BIN || "quarto", commandArgs, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      const error = Object.assign(new Error(`Quarto command timed out after ${String(timeoutMs)} ms.`), { code: "ETIMEDOUT" });
      child.kill("SIGKILL");
      if (!settled) { settled = true; reject(error); }
    }, timeoutMs);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", (error) => { clearTimeout(timer); if (!settled) { settled = true; reject(error); } });
    child.once("close", (exitCode) => { clearTimeout(timer); if (!settled) { settled = true; resolve({ exitCode: exitCode ?? 1, stdout, stderr }); } });
  });
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--probe" || value === "--execute") parsed[value.slice(2).replaceAll("-", "")] = true;
    else if (value?.startsWith("--")) {
      const next = values[index + 1];
      if (!next || next.startsWith("--")) fail("quarto_argument_missing", `Missing value for ${value}.`);
      parsed[value.slice(2).replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase())] = next;
      index += 1;
    } else fail("quarto_argument_invalid", `Unexpected argument: ${String(value)}`);
  }
  return parsed;
}

function required(value, flag) { if (!value?.trim()) fail("quarto_argument_missing", `${flag} is required.`); return value; }
function safeFormat(value) { if (!/^[a-z0-9][a-z0-9._+-]*$/u.test(value)) fail("quarto_format_invalid", "Unsafe Quarto format ID."); return value; }
function reason(value) { return value.trim().replace(/\s+/gu, " ").slice(0, 500) || "Quarto command failed without details."; }
function fail(code, message) { throw Object.assign(new Error(message), { code }); }
async function exists(file) { try { await lstat(file); return true; } catch (error) { if (error?.code === "ENOENT") return false; throw error; } }
async function regularFile(file, code, message) { try { const info = await lstat(file); if (!info.isFile() || info.isSymbolicLink()) fail(code, message); } catch (error) { if (error?.code === "ENOENT") fail(code, message); throw error; } }
