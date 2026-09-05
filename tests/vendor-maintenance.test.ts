import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

type MaintenanceModule = {
  fileSha(pathName: string): string;
  createMaintenanceCommands(options: {
    root: string;
    catalog: () => { anchor_id: string; extensions: [] };
    anchorDir: (anchorId: string) => string;
    artifactDir: (anchorId: string) => string;
    currentState: (anchorId: string) => {
      vendor_id: string;
      anchor_id: string;
      extension: { registry_version: string; rows: [] };
    };
    writeRecords: (anchorId: string) => void;
    vendorId: string;
    vendorLabel: string;
    scriptName: string;
    anchorCreatedAt: string;
  }): { main(args: string[]): void };
};

async function loadMaintenanceModule(): Promise<MaintenanceModule> {
  const modulePath = path.join(ROOT, "scripts/lib/vendor-maintenance.mjs");
  return await import(pathToFileURL(modulePath).href) as MaintenanceModule;
}

void test("shared maintenance file hashes distinguish invalid UTF-8 bytes", async () => {
  const maintenance = await loadMaintenanceModule();
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-maintenance-"));
  try {
    const left = Buffer.from([0x80]);
    const right = Buffer.from([0x81]);
    const text = Buffer.from("ResearchSpec\n", "utf8");
    assert.equal(left.toString("utf8"), right.toString("utf8"));
    const leftPath = path.join(root, "left.bin");
    const rightPath = path.join(root, "right.bin");
    const textPath = path.join(root, "text.txt");
    await writeFile(leftPath, left);
    await writeFile(rightPath, right);
    await writeFile(textPath, text);
    assert.equal(maintenance.fileSha(leftPath), createHash("sha256").update(left).digest("hex"));
    assert.notEqual(maintenance.fileSha(leftPath), maintenance.fileSha(rightPath));
    assert.equal(maintenance.fileSha(textPath), createHash("sha256").update(text).digest("hex"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("maintenance protects an unreviewed baseline and honors the artifact anchor", async () => {
  const maintenance = await loadMaintenanceModule();
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-maintenance-"));
  const commands = maintenance.createMaintenanceCommands({
    root,
    catalog: () => ({ anchor_id: "catalog-anchor", extensions: [] }),
    anchorDir: (anchorId) => path.join(root, anchorId),
    artifactDir: (anchorId) => path.join(root, anchorId, "artifacts"),
    currentState: (anchorId) => {
      return { vendor_id: "fixture", anchor_id: anchorId, extension: { registry_version: "1", rows: [] } };
    },
    writeRecords: (anchorId) => {
      const marker = path.join(root, anchorId, "records-written");
      mkdirSync(path.dirname(marker), { recursive: true });
      writeFileSync(marker, "written\n", "utf8");
    },
    vendorId: "fixture",
    vendorLabel: "Fixture",
    scriptName: "fixture-maintenance.mjs",
    anchorCreatedAt: "2026-08-17T00:00:00+08:00",
  });
  try {
    assert.throws(() => commands.main(["baseline", "unreviewed-anchor"]));
    await assert.rejects(readFile(path.join(root, "unreviewed-anchor", "manifest.json")), { code: "ENOENT" });
    commands.main(["artifacts", "explicit-anchor"]);
    const artifact = JSON.parse(await readFile(path.join(root, "explicit-anchor", "artifacts", "extension-review.json"), "utf8")) as { anchor_id: string };
    assert.equal(artifact.anchor_id, "explicit-anchor");
    await readFile(path.join(root, "explicit-anchor", "records-written"), "utf8");
    await assert.rejects(readFile(path.join(root, "catalog-anchor", "artifacts", "extension-review.json")), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
