import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const [directory, version, commit] = process.argv.slice(2);
if (!directory || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? "")
  || !/^[a-f0-9]{40}$/.test(commit ?? "")) {
  throw new Error("Usage: node scripts/verify-release-artifact.mjs <directory> <version> <commit>");
}

const name = "researchspec";
const filename = `${name}-${version}.tgz`;
const metadata = JSON.parse(await readFile(path.join(directory, "release.json"), "utf8"));
if (metadata.name !== name || metadata.version !== version || metadata.commit !== commit
  || metadata.clean !== true || metadata.filename !== filename) {
  throw new Error("Release artifact identity does not match the clean checkout, version and commit.");
}

const tarball = path.resolve(directory, filename);
const { size } = await stat(tarball);
const hash = createHash("sha512");
for await (const chunk of createReadStream(tarball)) hash.update(chunk);
if (size !== metadata.size || `sha512-${hash.digest("base64")}` !== metadata.integrity) {
  throw new Error("Release tarball size or integrity does not match release.json.");
}

process.stdout.write(`${tarball}\n`);
