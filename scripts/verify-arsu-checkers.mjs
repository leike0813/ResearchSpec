// Runs the packaged CLI without installing dependencies; uses the existing
// node_modules tree and the user's configured Python environment.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, symlink, readdir, readFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import path from "node:path";
import { stringify } from "yaml";

const root = await mkdtemp(path.join(tmpdir(), "researchspec-checker-package-"));
function command(bin, args, cwd = root, env = process.env) {
  const result = spawnSync(bin, args, { cwd, env, encoding: "utf8" });
  assert.equal(result.status, 0, `${bin} ${args.join(" ")}\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
command("npm", ["pack", "--ignore-scripts", "--pack-destination", root], process.cwd());
const archive = (await readdir(root)).find(name => name.endsWith(".tgz"));
command("tar", ["-xf", path.join(root, archive)]);
await symlink(path.resolve("node_modules"), path.join(root, "package/node_modules"));
const project = path.join(root, "project");
await mkdir(project);
const python = command("uv", ["run", `--project=${path.join(homedir(), ".ar")}`, "--locked", "--", "python", "-c", "import sys; print(sys.executable)"]).trim();
const env = { ...process.env, PATH: `${path.dirname(python)}${path.delimiter}${process.env.PATH}`, PYTHONDONTWRITEBYTECODE: "1" };
const cliPath = path.join(root, "package/dist/src/cli/bin.js");
const cli = (...args) => JSON.parse(command(process.execPath, [cliPath, ...args, "--json"], project, env));
cli("init", project, "--tools", "none");
const corpus = [{ citation_key: "study", title: "Supplied evidence", authors: [{ family: "Author" }], year: 2025, venue: "arXiv", source_pointer: "https://arxiv.org/abs/2501.00001", resolver_outcomes: { crossref: { status: "matched", queried_by: "id" } } }];
await writeFile(path.join(project, "paper.md"), "# Methods\nCurrently the result is preliminary.\n");
await writeFile(path.join(project, "corpus.json"), JSON.stringify(corpus));
await writeFile(path.join(project, "passport.json"), JSON.stringify({ literature_corpus: corpus }));
await writeFile(path.join(project, "package.json"), JSON.stringify({ files: [{ path: "paper.md" }] }));
command(python, ["-c", "from pypdf import PdfWriter; import sys; w=PdfWriter(); w.add_blank_page(width=100,height=100); w.write(sys.argv[1])", path.join(project, "paper.pdf")]);
const cases = [
  ["temporal", "check-temporal-integrity-verification", "temporal-integrity", "manuscript_draft", "paper.md", "temporal_audit_report"],
  ["pdf", "check-pdf-read-preflight", "pdf-read-preflight", "pdf_path", "paper.pdf", "pdf_preflight_report"],
  ["passport", "check-passport-verifier", "passport-verifier", "material_passport", "passport.json", "passport_report"],
  ["submission", "check-submission-package-verifier", "submission-package-verifier", "submission_package", "package.json", "submission_package_report"],
  ["existence", "check-citation-existence-verification", "citation-verification-gate", "annotated_bibliography", "corpus.json", "citation_verification_report"],
  ["summary", "check-citation-verification-summary", "citation-verification-summary", "citation_verification_report", "existence-report.json", "citation_summary"],
  ["contamination", "check-contamination-signals", "contamination-signals", "corpus", "corpus.json", "contamination_report"],
];
const profile = {
  schema_version: "2", profile_id: "checker-acceptance", profile_version: "0.1.0", capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "temporal" }],
  nodes: cases.map(([check, id, , role, , output], index) => ({
    node_id: check, kind: "capability", capability_id: id,
    input_bindings: [{ role, source: check === "summary" ? "node_output" : "handoff", ...(check === "summary" ? { from_node_id: "existence" } : {}) }],
    expected_outputs: [{ role: output, required: true }], prerequisites: index ? [cases[index - 1][0]] : [],
    required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null,
  })),
  parallel_groups: [], subgraphs: [], gates: [], decisions: [], revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
};
// This is a user-authored profile before start, never an edit to a frozen graph.
await writeFile(path.join(project, "researchspec/profiles/checker-acceptance.yaml"), stringify(profile));
await writeFile(path.join(project, "start.yaml"), stringify({
  schema_version: "2", confirmed_at: "2026-09-06T12:00:00+08:00", entry_id: "main", entry_node_id: "temporal",
  prerequisites: [], handoff_inputs: cases.filter(c => c[0] !== "summary").map(c => ({ role: c[3], type: "material", path: c[4], purpose: "explicit checker evidence" })),
  planned_outputs: [], formal_gates: [], cost: { effort: "low", interaction: "low" },
}));
const started = cli("start", "checker-acceptance", "--input", "start.yaml", "--confirmed-by", "acceptance-user");
const runId = started.data.run_id;
for (const [check, id, entry, , , output] of cases) {
  const instructions = cli("instructions", `node:${runId}/${check}`);
  const inputs = instructions.data.resolved_inputs.filter(row => row.path).map(row => ({ role: row.role, path: path.resolve(project, row.path) }));
  const request = path.join(project, `${check}-request.json`);
  await writeFile(request, JSON.stringify({ inputs }));
  const report = `${check}-report.json`;
  const generated = command(python, [path.join(root, "package/skills/capabilities", id, "validators", `${entry}.py`), check, request, "--generate"], project, env);
  await writeFile(path.join(project, report), generated);
  await writeFile(path.join(project, "advance.yaml"), stringify({ outputs: [{ role: output, path: report }] }));
  if (check === "pdf") {
    await writeFile(path.join(project, report), JSON.stringify({ result: { verdict: "PASS" } }));
    const rejected = spawnSync(process.execPath, [cliPath, "advance", `node:${runId}/${check}`, "--input", "advance.yaml", "--json"], { cwd: project, env, encoding: "utf8" });
    assert.notEqual(rejected.status, 0);
    assert.equal(JSON.parse(rejected.stdout).error.code, "node_validators_failed");
    await writeFile(path.join(project, report), generated);
  }
  cli("advance", `node:${runId}/${check}`, "--input", "advance.yaml");
}
assert.equal(cli("status").data.runs.active, 0);
cli("check", "all", "--strict");
assert.equal(JSON.parse(await readFile(path.join(project, "pdf-report.json"), "utf8")).result.verdict, "PASS");
console.log(`PASS: seven packaged checker nodes, altered-report rejection, completed run. Evidence: ${root}`);
