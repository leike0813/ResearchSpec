import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    const maybeError = error as NodeJS.ErrnoException;
    if (maybeError.code === "ENOENT") return false;
    throw error;
  }
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isDirectory();
  } catch (error) {
    const maybeError = error as NodeJS.ErrnoException;
    if (maybeError.code === "ENOENT") return false;
    throw error;
  }
}

export async function listFiles(root: string): Promise<string[]> {
  const results: string[] = [];

  async function visit(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git") continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        results.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
    }
  }

  await visit(root);
  return results.sort();
}

export async function readUtf8(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

export async function writeUtf8(filePath: string, text: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeUtf8(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function removeTree(filePath: string): Promise<void> {
  await rm(filePath, { recursive: true, force: true });
}

export async function sha256File(filePath: string): Promise<string> {
  const digest = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk: string | Buffer) => {
      digest.update(chunk);
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return digest.digest("hex");
}

export function toPosix(filePath: string): string {
  return filePath.split(path.sep).join("/");
}
