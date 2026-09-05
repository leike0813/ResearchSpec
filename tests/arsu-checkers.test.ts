import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const cases = [
  ["temporal", "check-temporal-integrity-verification", "temporal-integrity", "manuscript_draft", "temporal_audit_report"],
  ["pdf", "check-pdf-read-preflight", "pdf-read-preflight", "pdf_path", "pdf_preflight_report"],
  ["passport", "check-passport-verifier", "passport-verifier", "material_passport", "passport_report"],
  ["submission", "check-submission-package-verifier", "submission-package-verifier", "submission_package", "submission_package_report"],
  ["existence", "check-citation-existence-verification", "citation-verification-gate", "annotated_bibliography", "citation_verification_report"],
  ["summary", "check-citation-verification-summary", "citation-verification-summary", "citation_verification_report", "citation_summary"],
  ["contamination", "check-contamination-signals", "contamination-signals", "corpus", "contamination_report"],
] as const;

void test("seven bundled checkers compute real reports and reject modified results", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-checkers-"));
  const run = (args: string[]) => spawnSync("uv", ["run", `--project=${path.join(homedir(), ".ar")}`, "--locked", "--", "python", ...args], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  try {
    const corpus = [{ citation_key: "study", title: "A real supplied observation", authors: [{ family: "Author" }], year: 2025, venue: "arXiv", source_pointer: "https://arxiv.org/abs/2501.00001", resolver_outcomes: { crossref: { status: "matched", queried_by: "id" } } }];
    await writeFile(path.join(root, "paper.md"), "# Methods\nCurrently our results are preliminary.\n");
    await writeFile(path.join(root, "corpus.json"), JSON.stringify(corpus));
    await writeFile(path.join(root, "passport.json"), JSON.stringify({ literature_corpus: corpus }));
    await writeFile(path.join(root, "package.json"), JSON.stringify({ files: [{ path: "paper.md" }], manuscript: "paper.md", profile: { required_headings: ["Methods"], max_words: 100 } }));
    const pdf = path.join(root, "paper.pdf");
    const makePdf = run(["-c", "from pypdf import PdfWriter; import sys; w=PdfWriter(); w.add_blank_page(width=100,height=100); w.write(sys.argv[1])", pdf]);
    assert.equal(makePdf.status, 0, makePdf.stderr);
    const inputFiles: Record<string, string> = { temporal: "paper.md", pdf: "paper.pdf", passport: "passport.json", submission: "package.json", existence: "corpus.json", summary: "existence-report.json", contamination: "corpus.json" };
    for (const [check, id, entrypoint, inputRole, outputRole] of cases) {
      const script = path.resolve("skills/capabilities", id, "validators", `${entrypoint}.py`);
      const report = path.join(root, `${check}-report.json`);
      const request = path.join(root, `${check}-request.json`);
      await writeFile(request, JSON.stringify({ inputs: [{ role: inputRole, path: path.join(root, inputFiles[check]) }], outputs: [{ role: outputRole, path: report }] }));
      const generated = run([script, check, request, "--generate"]);
      assert.equal(generated.status, 0, `${check}: ${generated.stderr}`);
      const body = JSON.parse(generated.stdout) as { result: Record<string, unknown> };
      assert.ok(Object.keys(body.result).length > 0, check);
      await writeFile(report, generated.stdout);
      const valid = run([script, check, request]);
      assert.equal(valid.status, 0, `${check}: ${valid.stderr}`);
      await writeFile(report, JSON.stringify({ ...body, result: { verdict: "PASS" } }));
      assert.notEqual(run([script, check, request]).status, 0, `${check} accepted fabricated result`);
      await writeFile(report, generated.stdout);
    }
    const pdfReport = JSON.parse(await readFile(path.join(root, "pdf-report.json"), "utf8")) as { result: { verdict: string } };
    assert.equal(pdfReport.result.verdict, "PASS");
    const pdfScript = path.resolve("skills/capabilities/check-pdf-read-preflight/validators/pdf-read-preflight.py");
    const unavailable = run(["-S", pdfScript, "pdf", path.join(root, "pdf-request.json"), "--generate"]);
    assert.equal(unavailable.status, 0, unavailable.stderr);
    assert.equal((JSON.parse(unavailable.stdout) as { result: { verdict: string } }).result.verdict, "UNAVAILABLE");
    await writeFile(path.join(root, "corpus.json"), JSON.stringify({ entries: [
      { citation_key: "negative", resolver_outcomes: { crossref: { status: "unmatched", queried_by: "id" } } },
      { citation_key: "title", resolver_outcomes: { crossref: { status: "unmatched", queried_by: "title" } } },
      { citation_key: "missing" },
      { citation_key: "positive", resolver_outcomes: { crossref: { status: "unmatched", queried_by: "id" }, openalex: { status: "matched", queried_by: "title" } } },
    ] }));
    const script = path.resolve("skills/capabilities/check-citation-existence-verification/validators/citation-verification-gate.py");
    const current = run([script, "existence", path.join(root, "existence-request.json"), "--generate"]);
    assert.equal(current.status, 0, current.stderr);
    const entries = (JSON.parse(current.stdout) as { result: { citations: Array<{ citation_key: string; lookup_verified: string }> } }).result.citations;
    assert.deepEqual(Object.fromEntries(entries.map(entry => [entry.citation_key, entry.lookup_verified])), { negative: "false", title: "unresolvable", missing: "unresolvable", positive: "true" });
    assert.notEqual(run([script, "existence", path.join(root, "existence-request.json")]).status, 0, "changed inputs accepted stale report");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
