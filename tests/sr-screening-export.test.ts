import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { uvPythonArgs } from "./helpers/python.js";

const ROOT = path.resolve(".");
const EXPORTER = path.join(ROOT, "src/arsu-converter/authoring/checkers/sr-screening/screening_export.py");
type FullTextManifest = { ta_snapshot: string; retrieval_snapshot: string; records: Array<{ id: string }>; not_retrieved: Array<{ id: string }> };
type PrismaCounts = { provisional: boolean; studies_included: number; pending: number; identified: number; duplicates_removed: number; reports_sought: number; reports_not_retrieved: number; screened: number; title_abstract_excluded: number };
const python = (code: string, args: string[]) => spawnSync("uv", uvPythonArgs(["-c", `import sys; sys.path.insert(0, sys.argv[1]); ${code}`, path.dirname(EXPORTER), ...args]), { cwd: ROOT, encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
const qcState = (pending: string[] = []) => ({ near_miss: pending, joint_exclusion_sample: [], pending_qc: pending, policy: "advance" });

void test("SR export gates FT on current TA/QC and preserves auditable provisional reports", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-sr-export-"));
  try {
    const records = [
      { id: "R1", title: "Report one", doi: "10.1000/one", authors: ["A Author"], year: 2024, journal: "Journal", study_id: "S1", abstract: "private abstract" },
      { id: "R2", title: "Report two", study_id: "S1" },
      { id: "R3", title: "Excluded", abstract: "reason evidence" },
    ];
    const ta = { stage: "ta", protocol_revision: "r1", config_hash: "h", dataset_hash: "dataset-1", decisions: [
      { id: "R1", status: "decided", d: "include", code: "INC", source: "agreement" },
      { id: "R2", status: "decided", d: "unclear", code: "UNC", source: "agreement" },
      { id: "R3", status: "decided", d: "exclude", code: "E2", source: "agreement", reasons: [{ reason: "animal population" }] },
    ], pending: [] };
    const recordsPath = path.join(root, "records.json"), taPath = path.join(root, "ta.json");
    await writeFile(recordsPath, JSON.stringify(records)); await writeFile(taPath, JSON.stringify(ta));
    const work = path.join(root, "work");
    await mkdir(work, { recursive: true });
    await writeFile(path.join(work, "records.json"), JSON.stringify({ dataset_hash: "dataset-1", unique: records }));
    await writeFile(path.join(work, "identification.json"), JSON.stringify({ raw_total: 5, unique_total: 3, duplicates_removed: 2, by_database: { PubMed: 3, Embase: 2 } }));
    await writeFile(path.join(work, "ta-merged.json"), JSON.stringify(ta));
    await writeFile(path.join(work, "qc.json"), "{}");
    const noQc = python("import json,sys; from screening_export import prepare_full_text; prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[],'not_retrieved':[]},{})", [work, taPath, recordsPath]);
    assert.notEqual(noQc.status, 0);
    await writeFile(path.join(work, "qc.json"), JSON.stringify(qcState()));
    const prepare = python("import json,sys; from screening_export import prepare_full_text; r=prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[{'id':'R1','pdf':'/tmp/R1.pdf'}],'not_retrieved':[{'id':'R2','title':'Report two'}]},{}); print(len(r['records']))", [work, taPath, recordsPath]);
    assert.equal(prepare.status, 0, prepare.stderr);
    assert.equal(prepare.stdout.trim(), "1");
    const manifest: FullTextManifest = JSON.parse(await readFile(path.join(work, "full_text_manifest.json"), "utf8")) as FullTextManifest;
    assert.deepEqual(manifest.records.map(row => row.id), ["R1"]);

    await writeFile(path.join(work, "qc.json"), JSON.stringify(qcState(["R3"])));
    const qcBlocked = python("import json,sys; from screening_export import prepare_full_text; prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[],'not_retrieved':[]},{})", [work, taPath, recordsPath]);
    assert.notEqual(qcBlocked.status, 0);
    await writeFile(path.join(work, "qc.json"), JSON.stringify(qcState()));
    const blocked = { ...ta, pending: ["R2"] };
    await writeFile(taPath, JSON.stringify(blocked));
    const denied = python("import json,sys; from screening_export import prepare_full_text; prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[],'not_retrieved':[]},{})", [work, taPath, recordsPath]);
    assert.notEqual(denied.status, 0);
    await writeFile(taPath, JSON.stringify(ta));

    let preparedManifest = JSON.parse(await readFile(path.join(work, "full_text_manifest.json"), "utf8")) as FullTextManifest;
    const ft = { stage: "ft", dataset_hash: "dataset-1", ta_snapshot: preparedManifest.ta_snapshot, retrieval_snapshot: preparedManifest.retrieval_snapshot, decisions: [], pending: [] };
    const ftPath = path.join(root, "ft.json"); await writeFile(ftPath, JSON.stringify(ft));
    assert.equal(preparedManifest.records.length, 1);
    assert.equal(preparedManifest.not_retrieved.length, 1);
    const prisma = path.join(root, "prisma.json");
    const exported = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, ftPath, recordsPath, prisma]);
    assert.equal(exported.status, 0, exported.stderr);
    for (const stale of [{ ...ft, ta_snapshot: "stale-ta" }, { ...ft, retrieval_snapshot: "stale-retrieval" }]) {
      const stalePath = path.join(root, "stale-ft.json"); await writeFile(stalePath, JSON.stringify(stale));
      const staleExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, stalePath, recordsPath, prisma]);
      assert.notEqual(staleExport.status, 0);
    }
    const counts: PrismaCounts = JSON.parse(await readFile(prisma, "utf8")) as PrismaCounts;
    assert.equal(counts.provisional, true);
    assert.equal(counts.studies_included, 0);
    assert.equal(counts.pending, 1);
    assert.equal(counts.identified, 5);
    assert.equal(counts.duplicates_removed, 2);
    assert.equal(counts.screened, 3);
    assert.equal(counts.title_abstract_excluded, 1);
    assert.equal(counts.reports_sought, 2);
    assert.equal(counts.reports_not_retrieved, 1);

    const partialTa = { ...ta, decisions: ta.decisions.slice(0, 2), pending: [] };
    const partialTaPath = path.join(root, "partial-ta.json"); await writeFile(partialTaPath, JSON.stringify(partialTa));
    const partialPrisma = path.join(root, "partial-prisma.json");
    const partialExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, partialTaPath, recordsPath, partialPrisma]);
    assert.equal(partialExport.status, 0, partialExport.stderr);
    const partialCounts: PrismaCounts = JSON.parse(await readFile(partialPrisma, "utf8")) as PrismaCounts;
    assert.equal(partialCounts.provisional, true);
    assert.equal(partialCounts.pending, 1);

    const review = { id: "R3", decision: "flag", reviewer: "senior", reason: "animal exclusion may be wrong" };
    await writeFile(path.join(work, "qc.json"), JSON.stringify({ ...qcState(), near_miss: ["R3"], reviews: [review] }));
    const pendingTa = { ...ta, pending: [] };
    const pendingTaPath = path.join(root, "pending-ta.json"); await writeFile(pendingTaPath, JSON.stringify(pendingTa));
    const pendingPrisma = path.join(root, "pending-prisma.json");
    const pendingExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, pendingTaPath, recordsPath, pendingPrisma]);
    assert.equal(pendingExport.status, 0, pendingExport.stderr);
    const pendingCounts: PrismaCounts = JSON.parse(await readFile(pendingPrisma, "utf8")) as PrismaCounts;
    assert.equal(pendingCounts.provisional, false);
    assert.equal(pendingCounts.pending, 0);
    assert.equal(pendingCounts.reports_sought, 3);
    assert.equal(pendingCounts.title_abstract_excluded, 0);
    const applied = python("import json,sys; from screening_export import apply_qc; result=apply_qc(json.load(open(sys.argv[2])),json.load(open(sys.argv[3])),{}); row=next(r for r in result['decisions'] if r['id']=='R3'); print(json.dumps(row))", [taPath, path.join(work, "qc.json")]);
    assert.equal(applied.status, 0, applied.stderr);
    const appliedRow = JSON.parse(applied.stdout) as { d: string; source: string; reviewer_decisions?: unknown; pre_qc?: { reviewer_decisions?: unknown }; qc_review: { reviewer: string } };
    assert.equal(appliedRow.d, "include");
    assert.equal(appliedRow.source, "QC");
    assert.equal(appliedRow.qc_review.reviewer, "senior");
    assert.ok(appliedRow.pre_qc);

    // The same QC projection that changes TA exports must determine FT retrieval.
    const qcPrepare = python("import json,sys; from screening_export import prepare_full_text; r=prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[{'id':'R1'},{'id':'R2'},{'id':'R3'}],'not_retrieved':[]},{}); print(json.dumps(r))", [work, taPath, recordsPath]);
    assert.equal(qcPrepare.status, 0, qcPrepare.stderr);
    const qcManifest = JSON.parse(qcPrepare.stdout) as { ta_snapshot: string; retrieval_snapshot: string; records: Array<{ id: string; source_decision: { source: string; qc_review: { reason: string }; pre_qc: { d: string } } }> };
    const qcAdvanced = qcManifest.records.find(row => row.id === "R3");
    assert.ok(qcAdvanced);
    assert.equal(qcAdvanced.source_decision.source, "QC");
    assert.equal(qcAdvanced.source_decision.pre_qc.d, "exclude");
    assert.equal(qcAdvanced.source_decision.qc_review.reason, review.reason);
    const qcFt = { stage: "ft", dataset_hash: "dataset-1", ta_snapshot: qcManifest.ta_snapshot, retrieval_snapshot: qcManifest.retrieval_snapshot, decisions: ["R1", "R2", "R3"].map(id => ({ id, status: "decided", d: "include", code: "INC" })), pending: [] };
    const qcFtPath = path.join(root, "qc-ft.json"); await writeFile(qcFtPath, JSON.stringify(qcFt));
    const qcFtExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, qcFtPath, recordsPath, prisma]);
    assert.equal(qcFtExport.status, 0, qcFtExport.stderr);
    const qcFtCounts = JSON.parse(await readFile(prisma, "utf8")) as PrismaCounts;
    assert.equal(qcFtCounts.reports_sought, 3);

    // Under flag policy, the reviewer finding is retained without changing eligibility.
    const flaggedQc = { ...qcState(), policy: "flag", near_miss: ["R3"], reviews: [review] };
    await writeFile(path.join(work, "qc.json"), JSON.stringify(flaggedQc));
    const flagConfigPath = path.join(root, "flag-config.json");
    await writeFile(flagConfigPath, JSON.stringify({ qc: { policy: "flag" } }));
    const flagExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',json.load(open(sys.argv[6])),sys.argv[2])", [work, taPath, recordsPath, prisma, flagConfigPath]);
    assert.equal(flagExport.status, 0, flagExport.stderr);
    const flagCounts = JSON.parse(await readFile(prisma, "utf8")) as PrismaCounts;
    assert.equal(flagCounts.reports_sought, 2);
    const flagApplied = python("import json,sys; from screening_export import apply_qc; result=apply_qc(json.load(open(sys.argv[2])),json.load(open(sys.argv[3])), {'qc':{'policy':'flag'}}); print(json.dumps(next(r for r in result['decisions'] if r['id']=='R3'))) ", [taPath, path.join(work, "qc.json")]);
    assert.equal(flagApplied.status, 0, flagApplied.stderr);
    const flagRow = JSON.parse(flagApplied.stdout) as { d: string; source: string; qc_review: { reviewer: string } };
    assert.equal(flagRow.d, "exclude");
    assert.equal(flagRow.source, "agreement");
    assert.equal(flagRow.qc_review.reviewer, "senior");

    await writeFile(path.join(work, "qc.json"), JSON.stringify(qcState(["R3"])));
    const qcUnverified = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, taPath, recordsPath, prisma]);
    assert.equal(qcUnverified.status, 0, qcUnverified.stderr);
    const qcPendingCounts = JSON.parse(await readFile(prisma, "utf8")) as PrismaCounts;
    assert.equal(qcPendingCounts.provisional, true);
    assert.equal(qcPendingCounts.pending, 1);
    await writeFile(path.join(work, "qc.json"), JSON.stringify(qcState()));
    const refreshed = python("import json,sys; from screening_export import prepare_full_text; prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[{'id':'R1'}],'not_retrieved':[{'id':'R2'}]}, {})", [work, taPath, recordsPath]);
    assert.equal(refreshed.status, 0, refreshed.stderr);
    preparedManifest = JSON.parse(await readFile(path.join(work, "full_text_manifest.json"), "utf8")) as FullTextManifest;
    Object.assign(ft, { ta_snapshot: preparedManifest.ta_snapshot, retrieval_snapshot: preparedManifest.retrieval_snapshot });
    await writeFile(ftPath, JSON.stringify(ft));

    const wrongIdentity = { ...ta, dataset_hash: "different-dataset" };
    const wrongIdentityPath = path.join(root, "wrong-identity.json"); await writeFile(wrongIdentityPath, JSON.stringify(wrongIdentity));
    const identityRejected = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, wrongIdentityPath, recordsPath, prisma]);
    assert.notEqual(identityRejected.status, 0);

    const corpus = path.join(root, "corpus.json");
    const corpusRun = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'corpus',{},sys.argv[2])", [work, taPath, recordsPath, corpus]);
    assert.equal(corpusRun.status, 0, corpusRun.stderr);
    const corpusText = await readFile(corpus, "utf8");
    assert.ok(corpusText.includes("literature_corpus"));
    assert.ok(!corpusText.includes("private abstract"));
    assert.ok(corpusText.includes("https://doi.org/10.1000/one"));
    assert.ok(corpusText.includes('"year": 2024'));
    for (const invalid of [
      records.map(row => row.id === "R1" ? { ...row, authors: [{ given: "Ada" }] } : row),
      records.map(row => row.id === "R1" ? { ...row, year: 999 } : row),
    ]) {
      const invalidRecordsPath = path.join(root, "invalid-records.json");
      await writeFile(invalidRecordsPath, JSON.stringify(invalid));
      await writeFile(path.join(work, "records.json"), JSON.stringify({ dataset_hash: "dataset-1", unique: invalid }));
      const invalidCorpus = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'corpus',{},sys.argv[2])", [work, taPath, invalidRecordsPath, corpus]);
      assert.notEqual(invalidCorpus.status, 0);
    }
    await writeFile(path.join(work, "records.json"), JSON.stringify({ dataset_hash: "dataset-1", unique: records }));

    const badFt = { ...ft, decisions: [{ id: "R1", status: "decided", d: "exclude", code: "E2", where: "" }] };
    const badFtPath = path.join(root, "bad-ft.json"); await writeFile(badFtPath, JSON.stringify(badFt));
    const badFtExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, badFtPath, recordsPath, prisma]);
    assert.notEqual(badFtExport.status, 0);

    await writeFile(path.join(work, "full_text_manifest.json"), JSON.stringify({ ...preparedManifest, not_retrieved: [{ id: "R2" }, { id: "unknown" }] }));
    const stalePartition = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, ftPath, recordsPath, prisma]);
    assert.notEqual(stalePartition.status, 0);
    await writeFile(path.join(work, "full_text_manifest.json"), JSON.stringify(preparedManifest));

    const base = path.join(root, "screening.ris");
    const risRun = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'ris',{},sys.argv[2])", [work, taPath, recordsPath, base]);
    assert.equal(risRun.status, 0, risRun.stderr);
    for (const category of ["include", "unclear", "exclude"]) assert.ok(await readFile(path.join(root, `screening-${category}.ris`), "utf8") !== undefined);
    const log = path.join(root, "log.csv");
    const logRun = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'log',{},sys.argv[2])", [work, taPath, recordsPath, log]);
    assert.equal(logRun.status, 0, logRun.stderr);
    assert.ok((await readFile(log, "utf8")).includes("animal population"));
    const method = path.join(root, "methods.md");
    const methodRun = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'method',{},sys.argv[2])", [work, ftPath, recordsPath, method]);
    assert.notEqual(methodRun.status, 0);
    await assert.rejects(readFile(method, "utf8"));
    const taMethodRun = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'method',{},sys.argv[2])", [work, taPath, recordsPath, method]);
    assert.equal(taMethodRun.status, 0, taMethodRun.stderr);
    assert.ok((await readFile(method, "utf8")).includes('"provisional": false'));

    const zeroRetrieved = python("import json,sys; from screening_export import prepare_full_text; result=prepare_full_text(sys.argv[2],json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),{'retrieved':[],'not_retrieved':[{'id':'R1','reason':'unavailable'},{'id':'R2','reason':'unavailable'}]},{}); print(len(result['records']))", [work, taPath, recordsPath]);
    assert.equal(zeroRetrieved.status, 0, zeroRetrieved.stderr);
    assert.equal(zeroRetrieved.stdout.trim(), "0");
    const zeroManifest: FullTextManifest = JSON.parse(await readFile(path.join(work, "full_text_manifest.json"), "utf8")) as FullTextManifest;
    assert.deepEqual(zeroManifest.records, []);
    assert.equal(zeroManifest.not_retrieved.length, 2);
    Object.assign(ft, { ta_snapshot: zeroManifest.ta_snapshot, retrieval_snapshot: zeroManifest.retrieval_snapshot });
    await writeFile(ftPath, JSON.stringify(ft));
    const zeroPrisma = path.join(root, "zero-prisma.json");
    const zeroExport = python("import json,sys; from screening_export import export_data; export_data(json.load(open(sys.argv[3])),json.load(open(sys.argv[4])),sys.argv[5],'prisma',{},sys.argv[2])", [work, ftPath, recordsPath, zeroPrisma]);
    assert.equal(zeroExport.status, 0, zeroExport.stderr);
    const zeroCounts: PrismaCounts = JSON.parse(await readFile(zeroPrisma, "utf8")) as PrismaCounts;
    assert.equal(zeroCounts.provisional, false);
    assert.equal(zeroCounts.reports_not_retrieved, 2);
    assert.equal(zeroCounts.pending, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
