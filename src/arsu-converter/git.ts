import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function gitResult(cwd: string, args: string[]): Promise<GitResult> {
  try {
    const { stdout, stderr } = await execFileAsync("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    return { exitCode: 0, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    const maybeError = error as NodeJS.ErrnoException & {
      code?: number | string;
      stdout?: string;
      stderr?: string;
    };
    const code = typeof maybeError.code === "number" ? maybeError.code : 1;
    return {
      exitCode: code,
      stdout: typeof maybeError.stdout === "string" ? maybeError.stdout.trim() : "",
      stderr: typeof maybeError.stderr === "string" ? maybeError.stderr.trim() : maybeError.message,
    };
  }
}

export async function gitOutput(cwd: string, args: string[]): Promise<string> {
  const result = await gitResult(cwd, args);
  return result.exitCode === 0 ? result.stdout : "";
}
