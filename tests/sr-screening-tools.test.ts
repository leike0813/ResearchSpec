import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { uvPythonArgs } from "./helpers/python.js";

const ROOT = path.resolve(".");
const TOOL = path.join(ROOT, "src/arsu-converter/authoring/checkers/sr-screening/screening_tools.py");
const run = (args: string[]) => spawnSync("uv", uvPythonArgs([TOOL, ...args]), { cwd: ROOT, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
const python = (args: string[]) => spawnSync("uv", uvPythonArgs(args), { cwd: ROOT, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
const parseJson = (text: string): unknown => JSON.parse(text);
const requiresPosixLock = { skip: process.platform === "win32" && "Screening workspace writes require a POSIX file lock" };
const at = <T>(rows: T[], index: number): T => {
  const value = rows[index];
  if (value === undefined) throw new Error(`missing array item ${String(index)}`);
  return value;
};

void test("SR screening CLI prepares, safely merges, resumes, QC checks, and exports", requiresPosixLock, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-sr-screening-"));
  try {
    const work = path.join(root, "work");
    const input = path.join(root, "studies.ris");
    const protocol = path.join(root, "screening_protocol.md");
    const config = path.join(root, "config.json");
    await writeFile(input, [
      "TY  - JOUR", "TI  - Eligible human study", "AU  - Lee, Ada", "PY  - 2025", "AB  - Human study intervention", "DO  - 10.1000/one", "ER  -",
      "TY  - JOUR", "TI  - Ineligible animal study", "AU  - Chen, Bo", "PY  - 2024", "AB  - Animal model", "DO  - 10.1000/two", "ER  -", "",
    ].join("\n"));
    await writeFile(protocol, "# Confirmed screening protocol\nRevision r1\nApply ordered eligibility criteria.\n");
    await writeFile(config, JSON.stringify({ qc: { random_exclusion_sample: 20, random_seed: 7, near_miss: { human: ["human"] } } }));
    const prepared = run(["prepare", work, input, "--config", config]);
    assert.equal(prepared.status, 0, prepared.stderr);
    const records = parseJson(await readFile(path.join(work, "records.json"), "utf8")) as { dataset_hash: string; unique: Array<{ id: string }> };
    const manifest = parseJson(await readFile(path.join(work, "manifest.json"), "utf8")) as Array<{ batch: string; ids: string[] }>;
    const batch = at(manifest, 0);
    const ids = batch.ids;
    const protocolHash = createHash("sha256").update(await readFile(protocol)).digest("hex");
    const ballot = (reviewer_seat: string, values: unknown[], revision = protocolHash) => ({ header: { reviewer_seat, stage: "ta", protocol_revision: revision, protocol_sha256: protocolHash, dataset_hash: records.dataset_hash, config_hash: "", batch_id: batch.batch }, decisions: values });
    const configHash = python(["-c", "import sys; sys.path.insert(0, sys.argv[1]); from screening_config import load_config,config_hash; print(config_hash(load_config(sys.argv[2]),'ta'))", path.dirname(TOOL), config]);
    assert.equal(configHash.status, 0, configHash.stderr);
    const entry = (id: string, d: string, code: string, reason = "record evidence") => ({ id, d, code, reason, status: "decided" });
    const aPath = path.join(root, "a.json"), bPath = path.join(root, "b.json");
    const firstId = at(ids, 0), secondId = at(ids, 1);
    const a = ballot("A", [entry(firstId, "include", "INC"), entry(secondId, "exclude", "E9")]);
    const b = ballot("B", [entry(firstId, "unclear", "UNC"), entry(secondId, "exclude", "E2")]);
    for (const body of [a, b]) body.header.config_hash = configHash.stdout.trim();
    await writeFile(aPath, JSON.stringify(a)); await writeFile(bPath, JSON.stringify(b));
    const mergedPath = path.join(root, "merged.json");
    const merge = (left = aPath, right = bPath, flags: string[] = []) => run(["merge", left, right, "--work", work, "--protocol", protocol, "--stage", "ta", "--config", config, "--output", mergedPath, ...flags]);
    assert.equal(merge().status, 0, merge().stderr);
    let merged = parseJson(await readFile(mergedPath, "utf8")) as { pending: string[]; conflicts: string[]; decisions: Array<{ id: string; d: string; code: string; reviewer_decisions: unknown }> };
    assert.deepEqual(merged.conflicts, []);
    assert.deepEqual(merged.pending, []);
    assert.equal(merged.decisions.find(row => row.id === firstId)?.d, "include", "include plus unclear advances as include");
    assert.deepEqual(merged.decisions.find(row => row.id === firstId)?.reviewer_decisions, { A: a.decisions[0], B: b.decisions[0] });
    assert.equal(merged.decisions.find(row => row.id === secondId)?.code, "E2", "dual exclusions follow protocol code order");

    const conflictBallot = ballot("B", [entry(firstId, "exclude", "E1"), entry(secondId, "exclude", "E2")]);
    conflictBallot.header.config_hash = configHash.stdout.trim();
    const conflictPath = path.join(root, "conflict.json"); await writeFile(conflictPath, JSON.stringify(conflictBallot));
    assert.equal(merge(aPath, conflictPath).status, 0);
    merged = parseJson(await readFile(mergedPath, "utf8")) as typeof merged;
    assert.deepEqual(merged.conflicts, [firstId]);
    assert.deepEqual(merged.pending, [firstId]);
    assert.deepEqual(merged.decisions.find(row => row.id === firstId)?.reviewer_decisions, { A: a.decisions[0], B: conflictBallot.decisions[0] });

    const missingPath = path.join(root, "missing.json");
    await writeFile(missingPath, JSON.stringify({ ...conflictBallot, decisions: [conflictBallot.decisions[1]] }));
    assert.equal(merge(aPath, missingPath).status, 0);
    merged = parseJson(await readFile(mergedPath, "utf8")) as typeof merged;
    assert.deepEqual(merged.pending, [firstId], "one-sided retry remains pending");
    const partialSnapshot = path.join(root, "partial-snapshot.json");
    await writeFile(partialSnapshot, JSON.stringify(merged));
    const retryAPath = path.join(root, "retry-a.json"), retryBPath = path.join(root, "retry-b.json");
    const retryA = ballot("A", [entry(firstId, "include", "INC")]), retryB = ballot("B", [entry(firstId, "include", "INC")]);
    retryA.header.config_hash = configHash.stdout.trim(); retryB.header.config_hash = configHash.stdout.trim();
    await writeFile(retryAPath, JSON.stringify(retryA)); await writeFile(retryBPath, JSON.stringify(retryB));
    assert.equal(merge(retryAPath, retryBPath, ["--retry-from", partialSnapshot]).status, 0);
    merged = parseJson(await readFile(mergedPath, "utf8")) as typeof merged;
    assert.equal(merged.decisions.length, 2, "successful retry retains previously resolved records");
    assert.equal(merged.decisions.find(row => row.id === secondId)?.code, "E2");
    assert.notEqual(merge(aPath, conflictPath, ["--retry-from", partialSnapshot]).status, 0, "retry cannot introduce a resolved id");

    const sameSeatPath = path.join(root, "same-seat.json");
    await writeFile(sameSeatPath, JSON.stringify({ ...b, header: { ...b.header, reviewer_seat: "A" } }));
    assert.notEqual(merge(aPath, sameSeatPath).status, 0);
    const staleProtocol = path.join(root, "stale-protocol.md"); await writeFile(staleProtocol, "# Changed protocol\nRevision r2\n");
    assert.notEqual(run(["merge", aPath, bPath, "--work", work, "--protocol", staleProtocol, "--stage", "ta", "--config", config, "--output", mergedPath]).status, 0);
    const changedConfigPath = path.join(root, "changed-config.json");
    const changedConfig = { ...a, header: { ...a.header, config_hash: "stale-config" } };
    await writeFile(changedConfigPath, JSON.stringify(changedConfig));
    assert.notEqual(merge(changedConfigPath).status, 0, "config identity is checked against the current config");
    const changedDatasetPath = path.join(root, "changed-dataset.json");
    await writeFile(changedDatasetPath, JSON.stringify({ ...a, header: { ...a.header, dataset_hash: "stale-dataset" } }));
    assert.notEqual(merge(changedDatasetPath).status, 0, "dataset identity is checked against prepared records");
    const changedBatchPath = path.join(root, "changed-batch.json");
    await writeFile(changedBatchPath, JSON.stringify({ ...a, header: { ...a.header, batch_id: "unknown-batch" } }));
    assert.notEqual(merge(changedBatchPath).status, 0, "batch identity is checked against the manifest");
    const arbitraryRevisionPath = path.join(root, "arbitrary-revision.json");
    await writeFile(arbitraryRevisionPath, JSON.stringify({ ...a, header: { ...a.header, protocol_revision: "r1" } }));
    assert.notEqual(merge(arbitraryRevisionPath).status, 0, "revision must bind the protocol file content");
    const duplicatePath = path.join(root, "duplicate.json");
    await writeFile(duplicatePath, JSON.stringify({ ...a, decisions: [...a.decisions, a.decisions[0]] }));
    assert.notEqual(merge(duplicatePath).status, 0);
    const outsidePath = path.join(root, "outside.json");
    await writeFile(outsidePath, JSON.stringify({ ...a, decisions: [entry("forged-id", "include", "INC")] }));
    assert.notEqual(merge(outsidePath).status, 0);

    const overridePath = path.join(root, "overrides.json");
    await writeFile(overridePath, JSON.stringify([{ id: firstId, d: "include", code: "INC", decision_maker: "Dr Reviewer", reason: "human adjudication", where: { page: "2", section: "Results" } }]));
    assert.equal(merge(aPath, conflictPath, ["--overrides", overridePath]).status, 0);
    merged = parseJson(await readFile(mergedPath, "utf8")) as typeof merged;
    assert.equal(merged.decisions.find(row => row.id === firstId)?.d, "include");
    const overridden = merged.decisions.find(row => row.id === firstId) as unknown as Record<string, unknown>;
    assert.equal(overridden.decision_maker, "Dr Reviewer");
    assert.equal(overridden.override_reason, "human adjudication");
    assert.deepEqual(overridden.where, { page: "2", section: "Results" });

    const qcPath = path.join(root, "qc.json");
    const qc = run(["qc", mergedPath, path.join(work, "records.json"), "--config", config, "--output", qcPath]);
    assert.equal(qc.status, 0, qc.stderr);
    const qcResult = parseJson(await readFile(qcPath, "utf8")) as { pending_qc: string[] };
    const qcReviewedPath = path.join(root, "qc-reviewed.json");
    await writeFile(qcReviewedPath, JSON.stringify(qcResult.pending_qc.map(id => ({ id, decision: "confirm", reviewer: "human", reason: "checked against protocol" }))));
    const completedQc = run(["qc", mergedPath, path.join(work, "records.json"), "--config", config, "--reviewed", qcReviewedPath, "--output", path.join(work, "qc.json")]);
    assert.equal(completedQc.status, 0, completedQc.stderr);
    const ftPath = path.join(root, "ft.json"), retrievalPath = path.join(root, "retrieval.json");
    await writeFile(retrievalPath, JSON.stringify({ retrieved: [{ id: firstId, pdf: "first.pdf" }], not_retrieved: [] }));
    const ftPrepared = run(["ft-manifest", mergedPath, path.join(work, "records.json"), "--work", work, "--retrieval", retrievalPath, "--config", config, "--output", ftPath]);
    assert.equal(ftPrepared.status, 0, ftPrepared.stderr);
    assert.equal((parseJson(await readFile(ftPath, "utf8")) as { records: unknown[] }).records.length, 1);
    for (const format of ["prisma", "ris", "corpus", "method", "log"] as const) {
      const output = path.join(root, `${format}.out`);
      const exported = run(["export", mergedPath, path.join(work, "records.json"), "--format", format, "--config", config, "--work", work, "--output", output]);
      assert.equal(exported.status, 0, exported.stderr);
      const artifact = format === "ris" ? path.join(root, "ris-include.ris") : output;
      assert.ok((await readFile(artifact, "utf8")).length > 0, format);
    }
    assert.equal(records.unique.length, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("SR screening combines multiple TA batches and merges only retrieved FT records", requiresPosixLock, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-sr-screening-multibatch-"));
  try {
    const work = path.join(root, "work"), input = path.join(root, "studies.ris"), config = path.join(root, "config.json"), protocol = path.join(root, "screening_protocol.md");
    const titles = ["Eligible study alpha", "Eligible study beta", "Eligible study gamma"];
    await writeFile(input, titles.flatMap((title, i) => ["TY  - JOUR", `TI  - ${title}`, `AU  - Author, ${String.fromCharCode(65 + i)}`, `PY  - ${String(2024 - i)}`, "JO  - Synthetic Journal", `AB  - Population intervention evidence ${i.toString()}`, `DO  - 10.1000/${(i + 1).toString()}`, "ER  -"]).join("\n") + "\n");
    await writeFile(config, JSON.stringify({ batching: { max_records: 1 }, qc: { random_exclusion_sample: 20 } }));
    await writeFile(protocol, "# Screening protocol\nConfirmed revision\n");
    assert.equal(run(["prepare", work, input, "--config", config]).status, 0);
    const recordFile = parseJson(await readFile(path.join(work, "records.json"), "utf8")) as { dataset_hash: string; unique: Array<{ id: string; batch: string }> };
    const batches = parseJson(await readFile(path.join(work, "manifest.json"), "utf8")) as Array<{ batch: string; ids: string[] }>;
    assert.equal(batches.length, 3, "fixture must exercise more than one batch");
    const headerPath = async (stage: "ta" | "ft", batchId: string, seat: "A" | "B") => {
      const output = path.join(root, `header-${stage}-${batchId}-${seat}.json`);
      const result = run(["ballot-header", "--work", work, "--stage", stage, "--batch", batchId, "--seat", seat, "--protocol", protocol, "--config", config, "--output", output]);
      assert.equal(result.status, 0, result.stderr);
      return (parseJson(await readFile(output, "utf8")) as { header: Record<string, unknown> }).header;
    };
    const partPaths: string[] = [];
    for (const [index, batch] of batches.entries()) {
      const id = at(batch.ids, 0);
      const ballot = async (reviewer_seat: "A" | "B") => ({ header: await headerPath("ta", batch.batch, reviewer_seat), decisions: [{ id, d: "include", code: "INC", status: "decided", reason: "criteria met" }] });
      const name = index.toString();
      const a = path.join(root, `ta-a-${name}.json`), b = path.join(root, `ta-b-${name}.json`), output = path.join(root, `ta-${name}.json`);
      await writeFile(a, JSON.stringify(await ballot("A"))); await writeFile(b, JSON.stringify(await ballot("B")));
      const merged = run(["merge", a, b, "--work", work, "--protocol", protocol, "--stage", "ta", "--config", config, "--output", output]);
      assert.equal(merged.status, 0, merged.stderr); partPaths.push(output);
    }
    const combinedPath = path.join(root, "ta-combined.json");
    const combined = run(["combine", "--work", work, "--stage", "ta", "--batches", ...partPaths, "--protocol", protocol, "--config", config, "--output", combinedPath]);
    assert.equal(combined.status, 0, combined.stderr);
    const ta = parseJson(await readFile(combinedPath, "utf8")) as { decisions: Array<{ id: string }>; pending: string[] };
    assert.equal(ta.decisions.length, 3); assert.deepEqual(ta.pending, []);
    await writeFile(path.join(work, "ta-merged.json"), JSON.stringify(ta));
    const qcPath = path.join(work, "qc.json");
    const qc = run(["qc", combinedPath, path.join(work, "records.json"), "--config", config, "--output", qcPath]);
    assert.equal(qc.status, 0, qc.stderr);
    const aggregateReport = path.join(root, "aggregate-prisma.json");
    const report = run(["export", combinedPath, path.join(work, "records.json"), "--format", "prisma", "--work", work, "--config", config, "--output", aggregateReport]);
    assert.equal(report.status, 0, report.stderr);
    assert.equal((parseJson(await readFile(aggregateReport, "utf8")) as { screened: number }).screened, 3, "report includes all batch results");
    const retrieval = path.join(root, "retrieval.json");
    const retrievedInput = recordFile.unique.map(row => ({ id: row.id, pdf: `synthetic-${row.id}.pdf` }));
    await writeFile(retrieval, JSON.stringify({ retrieved: retrievedInput, not_retrieved: [] }));
    const partitioned = run(["ft-manifest", combinedPath, path.join(work, "records.json"), "--work", work, "--retrieval", retrieval, "--config", config, "--output", path.join(root, "ft-prepared.json")]);
    assert.equal(partitioned.status, 0, partitioned.stderr);

    const preparedFt = parseJson(await readFile(path.join(work, "full_text_manifest.json"), "utf8")) as { ta_snapshot: string; records: Array<Record<string, unknown>> };
    const retrieved = preparedFt.records;
    const ftHeader = await headerPath("ft", (at(retrieved, 0).source_record as { batch: string }).batch, "A");
    assert.equal(ftHeader.ta_snapshot, preparedFt.ta_snapshot, "FT ballot header exposes the authoritative TA snapshot");
    assert.equal(typeof ftHeader.retrieval_snapshot, "string", "FT ballot header exposes the authoritative retrieval snapshot");
    const ftParts: string[] = [];
    for (const [index, row] of retrieved.entries()) {
      const id = String(row.id), ftBatch = (row.source_record as { batch: string }).batch;
      const ftBallot = async (reviewer_seat: "A" | "B") => ({ header: await headerPath("ft", ftBatch, reviewer_seat), decisions: [
        reviewer_seat === "A" && index === 0 ? { id, d: "exclude", code: "E9", where: { page: "6", section: "Discussion" }, reason: "A full-text reason", status: "decided" } :
        reviewer_seat === "B" && index === 0 ? { id, d: "exclude", code: "E2", where: { page: "4", section: "Methods" }, reason: "B full-text reason", status: "decided" } :
        { id, d: "include", code: "INC", reason: "full text eligible", status: "decided" },
      ] });
      const ftA = path.join(root, `ft-a-${index.toString()}.json`), ftB = path.join(root, `ft-b-${index.toString()}.json`), ftPart = path.join(root, `ft-part-${index.toString()}.json`);
      await writeFile(ftA, JSON.stringify(await ftBallot("A"))); await writeFile(ftB, JSON.stringify(await ftBallot("B")));
      const ftMerged = run(["merge", ftA, ftB, "--work", work, "--protocol", protocol, "--stage", "ft", "--config", config, "--output", ftPart]);
      assert.equal(ftMerged.status, 0, ftMerged.stderr); ftParts.push(ftPart);
    }
    const ftCombinedPath = path.join(root, "ft-combined.json");
    const noRetrieval = path.join(root, "work-without-retrieval");
    await cp(work, noRetrieval, { recursive: true });
    await unlink(path.join(noRetrieval, "full_text_manifest.json"));
    const noRetrievalMerge = run(["combine", "--work", noRetrieval, "--stage", "ft", "--batches", "--protocol", protocol, "--config", config, "--output", path.join(root, "should-not-combine.json")]);
    assert.notEqual(noRetrievalMerge.status, 0, `zero-part FT combine without retrieval must fail: ${noRetrievalMerge.stderr}`);
    const ftCombined = run(["combine", "--work", work, "--stage", "ft", "--batches", ...ftParts, "--protocol", protocol, "--config", config, "--output", ftCombinedPath]);
    assert.equal(ftCombined.status, 0, ftCombined.stderr);
    const ftMergedJson = parseJson(await readFile(ftCombinedPath, "utf8")) as { decisions: Array<Record<string, unknown>> };
    assert.deepEqual(ftMergedJson.decisions.map(row => row.id), retrieved.map(row => row.id), "full-text merge covers retrieved manifest records only");
    const ftExcluded = ftMergedJson.decisions.find(row => row.d === "exclude");
    assert.equal(ftExcluded?.code, "E2", "protocol order chooses B's E2 over A's E9");
    assert.deepEqual(ftExcluded?.where, { page: "4", section: "Methods" }, "selected exclusion carries the location from the seat that supplied its code");
    for (const format of ["prisma", "ris", "corpus", "method", "log"] as const) {
      const output = path.join(root, `ft-${format}.out`);
      const exported = run(["export", ftCombinedPath, path.join(work, "records.json"), "--format", format, "--work", work, "--config", config, "--output", output]);
      assert.equal(exported.status, 0, `${format} export accepts selected FT exclusion location: ${exported.stderr}`);
      const artifact = format === "ris" ? path.join(root, "ft-ris-exclude.ris") : output;
      assert.ok((await readFile(artifact, "utf8")).length > 0, `FT ${format} export is observable`);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("SR screening refuses to prepare a workspace without a supported file lock", { skip: process.platform !== "win32" }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-sr-screening-lock-"));
  try {
    const work = path.join(root, "work");
    const input = path.join(root, "studies.ris");
    await writeFile(input, "TY  - JOUR\nTI  - Trial report\nER  -\n");
    const prepared = run(["prepare", work, input]);
    assert.equal(prepared.status, 2, prepared.stderr);
    assert.match(prepared.stderr, /workspace locking is unavailable/);
    await assert.rejects(readFile(path.join(work, "records.json")), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("QC near miss requires exclusion and every keyword group; QC sample requires two excluded raw votes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-sr-screening-qc-"));
  try {
    const config = path.join(root, "config.json"), merged = path.join(root, "merged.json"), records = path.join(root, "records.json"), output = path.join(root, "qc.json");
    await writeFile(config, JSON.stringify({ qc: { random_exclusion_sample: 20, near_miss: { population: ["women"], intervention: ["dose"] } } }));
    await writeFile(merged, JSON.stringify({ decisions: [
      { id: "joint", d: "exclude", status: "decided", reviewer_decisions: { A: { d: "exclude" }, B: { d: "exclude" } } },
      { id: "split", d: "exclude", status: "decided", reviewer_decisions: { A: { d: "exclude" }, B: { d: "include" } } },
      { id: "partial", d: "exclude", status: "decided", reviewer_decisions: { A: { d: "exclude" }, B: { d: "exclude" } } },
      { id: "included", d: "include", status: "decided", reviewer_decisions: { A: { d: "include" }, B: { d: "include" } } },
    ] }));
    await writeFile(records, JSON.stringify([
      { id: "joint", title: "Women", abstract: "Dose study" }, { id: "split", title: "Women", abstract: "Dose study" },
      { id: "partial", title: "Women", abstract: "No matching treatment" }, { id: "included", title: "Women", abstract: "Dose study" },
    ]));
    const result = run(["qc", merged, records, "--config", config, "--output", output]);
    assert.equal(result.status, 0, result.stderr);
    const qc = parseJson(await readFile(output, "utf8")) as { near_miss: string[]; joint_exclusion_sample: string[]; pending_qc: string[] };
    assert.deepEqual(qc.near_miss, ["split"], "the near miss matches both groups but is not jointly excluded");
    assert.deepEqual(qc.joint_exclusion_sample, ["joint", "partial"]);
    assert.deepEqual(qc.pending_qc, ["joint", "partial", "split"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
