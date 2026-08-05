import { spawn } from "node:child_process";
import { link, lstat, mkdir, mkdtemp, rm, unlink } from "node:fs/promises";
import path from "node:path";

import { QuartoFormatIdSchema } from "../../core/contracts/stable-specs.js";

export interface QuartoCommandOptions {
  cwd?: string;
  timeoutMs: number;
}

export interface QuartoCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type QuartoCommandRunner = (
  command: string,
  args: readonly string[],
  options: QuartoCommandOptions,
) => Promise<QuartoCommandResult>;

export type QuartoProbeResult =
  | { status: "available"; checked_at: string; version: string }
  | { status: "unavailable"; checked_at: string; reason: string }
  | { status: "unknown"; checked_at: string; reason: string };

export interface QuartoRenderConsent {
  execute: true;
  confirmed_by: string;
  confirmed_at: string;
}

export interface QuartoRenderInput {
  sourcePath: string;
  destinationPath: string;
  format: string;
  execute?: boolean;
  renderConsent?: QuartoRenderConsent;
  command?: string;
  timeoutMs?: number;
  checkedAt?: string;
  runner?: QuartoCommandRunner;
}

export interface QuartoRenderResult {
  status: "rendered";
  source_path: string;
  output_path: string;
  format: string;
  renderer: "quarto";
  execution: "disabled" | "consented";
  quarto: Extract<QuartoProbeResult, { status: "available" }>;
}

export class QuartoDeliveryError extends Error {
  constructor(readonly code: string, message: string, readonly details?: unknown) {
    super(message);
    this.name = "QuartoDeliveryError";
  }
}

export async function probeQuarto(options: {
  command?: string;
  timeoutMs?: number;
  checkedAt?: string;
  runner?: QuartoCommandRunner;
} = {}): Promise<QuartoProbeResult> {
  const checkedAt = options.checkedAt ?? new Date().toISOString();
  const runner = options.runner ?? runQuartoCommand;
  try {
    const result = await runner(options.command ?? "quarto", ["--version"], { timeoutMs: options.timeoutMs ?? 5_000 });
    if (result.exitCode !== 0) {
      return { status: "unknown", checked_at: checkedAt, reason: compactReason(result.stderr || `Quarto exited with code ${String(result.exitCode)}.`) };
    }
    const version = result.stdout.split(/\r?\n/u).map((line) => line.trim()).find(Boolean);
    return version
      ? { status: "available", checked_at: checkedAt, version }
      : { status: "unknown", checked_at: checkedAt, reason: "Quarto returned no version." };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { status: "unavailable", checked_at: checkedAt, reason: "Quarto executable was not found." };
    return { status: "unknown", checked_at: checkedAt, reason: compactReason(error instanceof Error ? error.message : String(error)) };
  }
}

export async function renderQuartoSingleFile(input: QuartoRenderInput): Promise<QuartoRenderResult> {
  const sourcePath = path.resolve(input.sourcePath);
  const destinationPath = path.resolve(input.destinationPath);
  const format = QuartoFormatIdSchema.parse(input.format);
  const timeoutMs = input.timeoutMs ?? 120_000;
  const runner = input.runner ?? runQuartoCommand;

  if (path.extname(sourcePath).toLowerCase() !== ".qmd") {
    throw new QuartoDeliveryError("quarto_source_extension_invalid", "Quarto source must end in .qmd.");
  }
  if (sourcePath === destinationPath) {
    throw new QuartoDeliveryError("quarto_destination_invalid", "Quarto output must differ from the source path.");
  }
  const sourceInfo = await regularFile(sourcePath, "quarto_source_invalid", "Quarto source must be a regular file.");
  if (sourceInfo.isSymbolicLink()) throw new QuartoDeliveryError("quarto_source_invalid", "Quarto source must not be a symbolic link.");
  if (await pathExists(destinationPath)) {
    throw new QuartoDeliveryError("quarto_destination_exists", "Quarto output already exists and will not be overwritten.");
  }
  if (input.execute && !validConsent(input.renderConsent)) {
    throw new QuartoDeliveryError("quarto_render_consent_required", "Code execution requires independent render consent.");
  }

  const probe = await probeQuarto({
    command: input.command,
    timeoutMs: Math.min(timeoutMs, 5_000),
    checkedAt: input.checkedAt,
    runner,
  });
  if (probe.status !== "available") {
    throw new QuartoDeliveryError(probe.status === "unavailable" ? "quarto_unavailable" : "quarto_status_unknown", probe.reason, probe);
  }

  const destinationDirectory = path.dirname(destinationPath);
  await mkdir(destinationDirectory, { recursive: true });
  const stagingDirectory = await mkdtemp(path.join(destinationDirectory, ".researchspec-quarto-"));
  const stagedOutput = path.join(stagingDirectory, path.basename(destinationPath));
  const args = [
    "render",
    path.basename(sourcePath),
    "--to",
    format,
    "--output",
    stagedOutput,
    ...(input.execute ? [] : ["--no-execute"]),
  ];

  try {
    let result: QuartoCommandResult;
    try {
      result = await runner(input.command ?? "quarto", args, { cwd: path.dirname(sourcePath), timeoutMs });
    } catch (error) {
      throw new QuartoDeliveryError("quarto_render_failed", error instanceof Error ? error.message : String(error));
    }
    if (result.exitCode !== 0) {
      throw new QuartoDeliveryError("quarto_render_failed", compactReason(result.stderr || `Quarto exited with code ${String(result.exitCode)}.`), result);
    }
    await regularFile(stagedOutput, "quarto_output_missing", "Quarto did not create the expected staged output.");
    try {
      await link(stagedOutput, destinationPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        throw new QuartoDeliveryError("quarto_destination_exists", "Quarto output appeared during delivery and was not overwritten.");
      }
      throw error;
    }
    await unlink(stagedOutput);
    return {
      status: "rendered",
      source_path: sourcePath,
      output_path: destinationPath,
      format,
      renderer: "quarto",
      execution: input.execute ? "consented" : "disabled",
      quarto: probe,
    };
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

export const runQuartoCommand: QuartoCommandRunner = async (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, [...args], {
    cwd: options.cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  let stdout = "";
  let stderr = "";
  let settled = false;
  const timer = setTimeout(() => {
    const error = new Error(`Quarto command timed out after ${String(options.timeoutMs)} ms.`) as NodeJS.ErrnoException;
    error.code = "ETIMEDOUT";
    child.kill("SIGKILL");
    if (!settled) {
      settled = true;
      reject(error);
    }
  }, options.timeoutMs);

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => { stdout += chunk; });
  child.stderr.on("data", (chunk: string) => { stderr += chunk; });
  child.once("error", (error) => {
    clearTimeout(timer);
    if (!settled) {
      settled = true;
      reject(error);
    }
  });
  child.once("close", (exitCode) => {
    clearTimeout(timer);
    if (!settled) {
      settled = true;
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    }
  });
});

async function regularFile(filePath: string, code: string, message: string) {
  try {
    const info = await lstat(filePath);
    if (!info.isFile()) throw new QuartoDeliveryError(code, message);
    return info;
  } catch (error) {
    if (error instanceof QuartoDeliveryError) throw error;
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new QuartoDeliveryError(code, message);
    throw error;
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await lstat(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function validConsent(consent: QuartoRenderConsent | undefined): boolean {
  return Boolean(consent?.execute && consent.confirmed_by.trim() && !Number.isNaN(Date.parse(consent.confirmed_at)));
}

function compactReason(value: string): string {
  const trimmed = value.trim().replace(/\s+/gu, " ");
  return trimmed.slice(0, 500) || "Quarto command failed without details.";
}
