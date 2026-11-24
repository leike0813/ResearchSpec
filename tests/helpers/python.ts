import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";

export const pythonProject = process.env.RESEARCHSPEC_TEST_PYTHON_PROJECT ?? path.join(homedir(), ".ar");

export function uvPythonArgs(args: string[]): string[] {
  return ["run", `--project=${pythonProject}`, "--locked", "--no-sync", "--", "python", ...args];
}

export function uvExecutable(): string | undefined {
  const extensions = process.platform === "win32" ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";") : [""];
  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `uv${extension}`);
      if (existsSync(candidate) && spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0) return candidate;
    }
  }
  return undefined;
}
