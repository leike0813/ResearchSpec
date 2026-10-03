import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MAX_OUTPUT = 64 * 1024 * 1024;

/** Windows resolves `npm` and `pnpm` through `.cmd` shims that Node cannot exec directly. */
export function platformCommand(name, platform) {
  return platform === "win32" ? `${name}.cmd` : name;
}

function quoteForShell(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

/** A run function must throw with the real command output when the command fails. */
export function createProcessRunner(platform = process.platform, spawn = spawnSync) {
  return function run(command, args, options = {}) {
    const useShell = platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
    // cmd.exe joins the command line itself, so every argument is quoted:
    // an unquoted repository or temp path containing & < > | ^ would otherwise
    // be read as a command separator. POSIX keeps its argument array and never
    // goes through a shell.
    const spawnCommand = useShell ? [command, ...args.map(quoteForShell)].join(" ") : command;
    const result = spawn(spawnCommand, useShell ? [] : args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      encoding: "utf8",
      shell: useShell,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: MAX_OUTPUT,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`${command} ${args.join(" ")} failed with exit ${String(result.status)}\n${result.stdout}\n${result.stderr}`);
    }
    return result;
  };
}

export function parsePackMetadata(stdout) {
  const start = stdout.indexOf("[");
  if (start < 0) throw new Error(`npm pack did not return JSON: ${stdout}`);
  const metadata = JSON.parse(stdout.slice(start))[0];
  if (!metadata || typeof metadata.filename !== "string") throw new Error("npm pack returned an unexpected metadata envelope.");
  return metadata;
}

function lastLine(value) {
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.at(-1) ?? "";
}

function binTarget(installed, name) {
  if (typeof installed.bin === "string") return installed.bin;
  const entries = Object.entries(installed.bin ?? {});
  const own = entries.find(([key]) => key === name);
  const target = own?.[1] ?? (entries.length === 1 ? entries[0][1] : undefined);
  if (typeof target !== "string") throw new Error(`Installed package ${name} declares no unambiguous bin target.`);
  return target;
}

/**
 * Confirms the replacement actually landed: the package npm reports, the bin
 * it publishes, and the version that bin prints when executed.
 */
export async function verifyInstalledCli(run, options) {
  const { name, version, cwd, platform } = options;
  const globalRoot = lastLine(run(platformCommand("npm", platform), ["root", "--global"], { cwd }).stdout);
  const packageRoot = path.join(globalRoot, ...name.split("/"));
  let installed;
  try {
    installed = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  } catch (error) {
    throw new Error(`No installed ${name} package at ${packageRoot}: ${error.message}`);
  }
  if (installed.version !== version) throw new Error(`Installed ${name} is ${String(installed.version)}, expected ${version}.`);
  const binPath = path.join(packageRoot, binTarget(installed, name));
  const reported = lastLine(run(process.execPath, [binPath, "--version"], { cwd }).stdout);
  if (reported !== version) throw new Error(`Installed CLI at ${binPath} reported ${reported || "nothing"}, expected ${version}.`);
  return { packageRoot, binPath, version: installed.version };
}

/**
 * Replaces the global install with the packed tarball. npm installs a package
 * over its own previous version, so a failed install is reported as the npm
 * failure it is; nothing here promises a rollback it does not perform.
 */
export async function installStable(options) {
  const { run, cwd, packDestination, name, version, platform = process.platform } = options;
  const npm = platformCommand("npm", platform);
  run(platformCommand("pnpm", platform), ["build"], { cwd });
  const packed = run(npm, ["pack", "--json", "--pack-destination", packDestination], { cwd });
  const tarball = path.join(packDestination, parsePackMetadata(packed.stdout).filename);
  run(npm, ["install", "-g", tarball], { cwd });
  const installed = await verifyInstalledCli(run, { name, version, cwd, platform });
  return { ...installed, tarball };
}
