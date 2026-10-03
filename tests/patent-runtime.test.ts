import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const AUTHORING = path.join(ROOT, "authoring/patent-disclosure-skill");
const MANIFEST = path.join(AUTHORING, "runtime-assets.json");
const AR_PROJECT = path.join(homedir(), ".ar");
const BUSINESS = [
  "patent-disclosure",
  "patent-application",
  "patent-docket",
  "patent-search",
  "patent-reader",
  "patent-chart",
  "patent-map",
  "patent-oa",
  "patent-exam-policy",
];

interface Row {
  upstream_path: string | null;
  source_path: string;
  output_path: string;
  license: string;
  read_when?: string;
}

interface Manifest {
  schema_version: string;
  groups: Record<string, Row[]>;
  adaptations: Array<{ source: string; target: string; reason: string }>;
  exclusions: Array<{ path: string; reason: string }>;
}

interface ToolResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest;

function python(args: string[], options: { cwd?: string; env?: Record<string, string>; code?: string } = {}): ToolResult {
  const result = spawnSync(
    "uv",
    ["run", `--project=${AR_PROJECT}`, "--locked", "--no-sync", "--", "python", ...args],
    {
      cwd: options.cwd,
      encoding: "utf8",
      input: options.code,
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", ...options.env },
    },
  );
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function pythonCode(code: string, args: string[], options: { cwd?: string; env?: Record<string, string> } = {}): ToolResult {
  return python(["-", ...args], { ...options, code });
}

function hasModule(name: string): boolean {
  return python(["-c", `import importlib.util as u, sys; sys.exit(0 if u.find_spec('${name}') else 3)`]).status === 0;
}

async function materialize(business: string, dir: string): Promise<string> {
  const rows = manifest.groups[business];
  assert.ok(rows, `missing group ${business}`);
  const pkg = path.join(dir, business);
  for (const row of rows) {
    const source = path.join(ROOT, row.source_path);
    const target = path.join(pkg, ...row.output_path.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(source));
  }
  return pkg;
}

async function workdir(prefix: string): Promise<string> {
  return mkdtemp(path.join(tmpdir(), `${prefix}-`));
}

void test("runtime-assets manifest is a direct reviewed business projection", () => {
  assert.equal(manifest.schema_version, "1");
  assert.deepEqual(Object.keys(manifest.groups), BUSINESS);
  for (const business of BUSINESS) {
    const rows = manifest.groups[business];
    assert.ok(rows.length > 0, `${business} has no rows`);
    const outputs = new Set<string>();
    for (const row of rows) {
      assert.equal(row.license, "MIT", `${business}/${row.output_path} license`);
      assert.equal(path.isAbsolute(row.source_path), false, `absolute source ${row.source_path}`);
      assert.ok(readFileSync(path.join(ROOT, row.source_path)), `missing source ${row.source_path}`);
      assert.ok(!row.output_path.split("/").includes("researchspec"), `workflow path leaked: ${row.output_path}`);
      assert.ok(!row.output_path.startsWith("../") && !row.output_path.includes(".."), `escaping output ${row.output_path}`);
      assert.ok(!outputs.has(row.output_path), `duplicate output ${business}/${row.output_path}`);
      outputs.add(row.output_path);
    }
    assert.ok(outputs.has("tools/patent_files.py"), `${business} lacks the file-index helper`);
    assert.ok(outputs.has("references/schemas/patent_file_index.schema.yaml"), `${business} lacks the index schema`);
    assert.ok(outputs.has("NOTICE.md"), `${business} lacks the attribution notice`);
  }
  const shared = manifest.groups["patent-chart"].find((row) => row.output_path === "tools/emit_chart.py");
  assert.ok(shared && shared.source_path.includes("/shared/"), "duplicated chart tool should collapse to one shared source");
  assert.equal(manifest.groups["patent-oa"].find((row) => row.output_path === "tools/emit_chart.py")?.source_path, shared?.source_path);
  for (const adaptation of manifest.adaptations) {
    assert.ok(readFileSync(path.join(ROOT, "vendor/patent-disclosure-skill", adaptation.source)), `adaptation source ${adaptation.source}`);
    assert.ok(readFileSync(adaptation.target), `adaptation target ${adaptation.target}`);
  }
});

void test("preparation is deterministic and byte-aware", () => {
  const result = spawnSync(process.execPath, ["scripts/prepare-patent-authoring.mjs", "--check"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

void test("file-index helper enforces project boundaries and preserves outputs", async () => {
  const dir = await workdir("patent-index");
  try {
    const pkg = await materialize("patent-disclosure", dir);
    const tool = path.join(pkg, "tools/patent_files.py");
    const project = path.join(dir, "project");
    await mkdir(path.join(project, "materials"), { recursive: true });
    await writeFile(path.join(project, "materials/disclosure.md"), "# 交底\n结构说明\n");
    await writeFile(path.join(project, "materials/claims.md"), "claims\n");
    const index = path.join(project, "out/disclosure.index.json");

    const created = python([tool, "create", "--project-root", project, "--kind", "disclosure", "--out", index, "--file", "disclosure=materials/disclosure.md", "--file", "claims=materials/claims.md", "--limitation", "附图待补"], { cwd: dir });
    assert.equal(created.status, 0, created.stdout + created.stderr);
    const written = JSON.parse(await readFile(index, "utf8")) as { kind: string; files: Array<{ role: string; path: string }> };
    assert.equal(written.kind, "disclosure");
    assert.deepEqual(written.files, [{ role: "disclosure", path: "materials/disclosure.md" }, { role: "claims", path: "materials/claims.md" }]);

    const empty = python([tool, "create", "--project-root", project, "--kind", "case", "--out", path.join(project, "out/case.json")], { cwd: dir });
    assert.equal(empty.status, 1);
    assert.match(empty.stdout, /at least one/);

    const outside = python([tool, "create", "--project-root", project, "--kind", "case", "--out", path.join(dir, "outside.index.json"), "--file", "a=materials/disclosure.md"], { cwd: dir });
    assert.equal(outside.status, 2);
    assert.match(outside.stdout, /escapes the project root/);

    const ok = python([tool, "validate", "--project-root", project, index], { cwd: dir });
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);
    assert.equal((JSON.parse(ok.stdout) as { ok: boolean }).ok, true);

    const escape = python([tool, "create", "--project-root", project, "--kind", "case", "--out", path.join(project, "out/case.json"), "--file", "a=../escape.md"], { cwd: dir });
    assert.equal(escape.status, 1);
    assert.match(escape.stdout, /escape/);

    const workflow = python([tool, "create", "--project-root", project, "--kind", "case", "--out", path.join(project, "out/case.json"), "--file", "a=researchspec/run.yaml"], { cwd: dir });
    assert.equal(workflow.status, 1);
    assert.match(workflow.stdout, /researchspec/);

    const missing = python([tool, "create", "--project-root", project, "--kind", "case", "--out", path.join(project, "out/case.json"), "--file", "a=materials/absent.md"], { cwd: dir });
    assert.equal(missing.status, 1);
    assert.match(missing.stdout, /missing file/);

    const again = python([tool, "create", "--project-root", project, "--kind", "disclosure", "--out", index, "--file", "disclosure=materials/disclosure.md"], { cwd: dir });
    assert.equal(again.status, 1);
    assert.match(again.stdout, /overwrite/);

    const dest = path.join(dir, "bundle");
    const projected = python([tool, "project", "--project-root", project, index, "--dest", dest], { cwd: dir });
    assert.equal(projected.status, 0, projected.stdout + projected.stderr);
    assert.equal(await readFile(path.join(dest, "materials/disclosure.md"), "utf8"), "# 交底\n结构说明\n");
    const reproject = python([tool, "project", "--project-root", project, index, "--dest", dest], { cwd: dir });
    assert.equal(reproject.status, 1);
    assert.match(reproject.stdout, /overwrite/);

    const partial = path.join(dir, "partial");
    await mkdir(path.join(partial, "materials"), { recursive: true });
    await writeFile(path.join(partial, "materials/disclosure.md"), "existing\n");
    const blocked = python([tool, "project", "--project-root", project, index, "--dest", partial], { cwd: dir });
    assert.equal(blocked.status, 1);
    assert.match(blocked.stdout, /overwrite/);
    assert.ok(!existsSync(path.join(partial, "materials/claims.md")), "preflight must not leave a partial projection");

    const linked = path.join(dir, "linked");
    const outsideStore = path.join(dir, "outside-store");
    await mkdir(linked, { recursive: true });
    await mkdir(outsideStore, { recursive: true });
    await symlink(outsideStore, path.join(linked, "materials"));
    const escaped = python([tool, "project", "--project-root", project, index, "--dest", linked], { cwd: dir });
    assert.equal(escaped.status, 1);
    assert.match(escaped.stdout, /symlink|escapes/);
    assert.ok(!existsSync(path.join(outsideStore, "disclosure.md")), "symlinked destination must not receive files");

    await unlink(path.join(project, "materials/disclosure.md"));
    const drifted = python([tool, "validate", "--project-root", project, index], { cwd: dir });
    assert.equal(drifted.status, 1);
    assert.match(drifted.stdout, /disclosure\.md/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("claim-chart XLSX renders offline", async () => {
  const dir = await workdir("patent-chart");
  try {
    const pkg = await materialize("patent-chart", dir);
    const chart = {
      scene: "invalidity",
      left: { pub_number: "CN219812345U", features_path: "outputs/claim_features.json" },
      features: [{ feature_id: "F1", claim_no: 1, text: "壳体与端盖围出冷却腔" }],
      columns: [{ id: "D1", label: "CN216600001U", pub_number: "CN216600001U", source_url: "http://epub.cnipa.gov.cn/patent/CN216600001U" }],
      highlights: [{ id: "H1", label: "冷却腔", claim: "冷却腔", evidence: "冷却空腔" }],
      cells: [{ feature_id: "F1", column_id: "D1", strength: "强", quote: "壳体与端盖形成冷却空腔。", analysis: "对应：说明书 [0021]。", source_url: "", desc_para: "0021" }],
    };
    const chartPath = path.join(dir, "chart.json");
    await writeFile(chartPath, JSON.stringify(chart));
    const out = path.join(dir, "out");
    const result = python([path.join(pkg, "tools/emit_chart.py"), "--json", chartPath, "--output-dir", out, "--case-id", "case1"], { cwd: pkg });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const match = /CHART_XLSX: (.+)/.exec(result.stdout);
    assert.ok(match, result.stdout);
    const xlsx = readFileSync(match[1].trim());
    assert.equal(xlsx.subarray(0, 2).toString("latin1"), "PK");
    assert.match(xlsx.toString("latin1"), /xl\/workbook\.xml/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("patent PDF text and figures extract offline", async (t) => {
  if (!hasModule("fitz") || !hasModule("PIL")) {
    t.skip("missing prerequisite: fitz/PIL");
    return;
  }
  const dir = await workdir("patent-pdf");
  try {
    const reader = await materialize("patent-reader", dir);
    const oa = await materialize("patent-oa", dir);
    const pdf = path.join(dir, "patent.pdf");
    const built = pythonCode(
      [
        "import sys, fitz",
        "from PIL import Image",
        "pdf, png = sys.argv[1], sys.argv[2]",
        "im = Image.new('RGB', (640, 480), (240, 240, 240))",
        "for x in range(0, 640, 40):",
        "    for y in range(0, 480, 40): im.putpixel((x, y), (0, 0, 0))",
        "im.save(png)",
        "doc = fitz.open()",
        "page = doc.new_page(width=595, height=842)",
        "page.insert_text((72, 90), 'FIG. 1', fontsize=16)",
        "page.insert_image(fitz.Rect(110, 120, 485, 470), filename=png)",
        "page.insert_text((72, 540), 'A cooling cavity is formed between the shell and the end cover.')",
        "doc.save(pdf); doc.close()",
      ].join("\n"),
      [pdf, path.join(dir, "figure.png")],
    );
    assert.equal(built.status, 0, built.stdout + built.stderr);

    const textOut = path.join(dir, "text.txt");
    const text = python([path.join(oa, "tools/pdf_text.py"), "-i", pdf, "-o", textOut, "--json", path.join(dir, "text.json")], { cwd: oa });
    assert.equal(text.status, 0, text.stdout + text.stderr);
    assert.match(await readFile(textOut, "utf8"), /cooling cavity/i);

    const figures = path.join(dir, "figures");
    const extract = python([path.join(reader, "tools/extract/extract_patent_figures.py"), "-i", pdf, "-o", figures, "--dpi", "72", "--min-xref-bytes", "1000"], { cwd: reader });
    assert.equal(extract.status, 0, extract.stdout + extract.stderr);
    const figureManifest = JSON.parse(await readFile(path.join(figures, "manifest.json"), "utf8")) as { count: number };
    assert.ok(figureManifest.count >= 1, `expected at least one figure, got ${JSON.stringify(figureManifest)}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("patent map reads an explicit corpus and binds loopback only", async () => {
  const dir = await workdir("patent-map");
  try {
    const pkg = await materialize("patent-map", dir);
    const corpus = path.join(dir, "corpus");
    await mkdir(corpus, { recursive: true });
    await writeFile(path.join(corpus, "CN123456789A_notes.md"), "---\npub_number: CN123456789A\ndomain: 储能\n---\n# 专利解读：示例\n\n## 一、一句话\n一种储能装置。\n");
    const index = path.join(dir, "notes.index.json");
    await writeFile(index, JSON.stringify({ schema_version: "1", kind: "notes", files: [{ role: "patent_notes", path: "corpus/CN123456789A_notes.md" }], limitations: [], metadata: {} }));
    const badEscape = path.join(dir, "bad-escape.index.json");
    await writeFile(badEscape, JSON.stringify({ schema_version: "1", kind: "notes", files: [{ role: "patent_notes", path: "../escape.md" }], limitations: [], metadata: {} }));
    const badMissing = path.join(dir, "bad-missing.index.json");
    await writeFile(badMissing, JSON.stringify({ schema_version: "1", kind: "notes", files: [{ role: "patent_notes", path: "corpus/absent.md" }], limitations: [], metadata: {} }));
    const cache = path.join(dir, "cache");
    const result = pythonCode(
      [
        "import json, os, sys",
        "from pathlib import Path",
        "tools, corpus, cache, project, index_path, bad_escape, bad_missing = (Path(sys.argv[i]) for i in range(1, 8))",
        "os.environ['PATENT_MAP_HOME'] = str(cache)",
        "sys.path.insert(0, str(tools))",
        "import vault_index, serve_map",
        "before = {p.relative_to(corpus).as_posix(): p.read_bytes() for p in corpus.rglob('*') if p.is_file()}",
        "payload = vault_index.build_payload(corpus, embed=False)",
        "after = {p.relative_to(corpus).as_posix(): p.read_bytes() for p in corpus.rglob('*') if p.is_file()}",
        "other = project / 'other-corpus'; other.mkdir()",
        "original = next(corpus.glob('*.md')); second = other / original.name",
        "second.write_text(original.read_text().replace('CN123456789A', 'CN987654321A'), encoding='utf-8')",
        "os.utime(second, ns=(original.stat().st_atime_ns, original.stat().st_mtime_ns))",
        "other_payload = vault_index.build_payload(other, embed=False)",
        "_, index_files = vault_index.note_files_from_index(index_path, project)",
        "def _rejected(p):",
        "    try:",
        "        vault_index.note_files_from_index(p, project)",
        "        return 'accepted'",
        "    except ValueError:",
        "        return 'rejected'",
        "server = serve_map.MapServer(('127.0.0.1', 0), serve_map.MapHandler)",
        "host = server.server_address[0]",
        "server.server_close()",
        "print(json.dumps({'count': payload['count'], 'other_pub': other_payload['patents'][0]['pub'], 'separate_cache': payload['cache'] != other_payload['cache'], 'read_only': before == after, 'host': host, 'resolved': str(vault_index.resolve_corpus(str(corpus))), 'index_files': len(index_files), 'invalid_escape': _rejected(bad_escape), 'invalid_missing': _rejected(bad_missing), 'max_notes': vault_index.MAX_NOTES, 'max_note_bytes': vault_index.MAX_NOTE_BYTES}))",
      ].join("\n"),
      [path.join(pkg, "tools"), corpus, cache, dir, index, badEscape, badMissing],
      { cwd: pkg },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const report = JSON.parse(result.stdout) as { count: number; other_pub: string; separate_cache: boolean; read_only: boolean; host: string; resolved: string; index_files: number; invalid_escape: string; invalid_missing: string; max_notes: number; max_note_bytes: number };
    assert.equal(report.count, 1);
    assert.equal(report.other_pub, "CN987654321A");
    assert.equal(report.separate_cache, true);
    assert.equal(report.read_only, true);
    assert.equal(report.host, "127.0.0.1");
    assert.equal(report.resolved, corpus);
    assert.equal(report.index_files, 1);
    assert.equal(report.invalid_escape, "rejected");
    assert.equal(report.invalid_missing, "rejected");
    assert.equal(report.max_notes, 5000);
    assert.equal(report.max_note_bytes, 4 * 1024 * 1024);
    assert.deepEqual(manifest.groups["patent-map"].some((row) => row.output_path.includes("ipc_scheme")), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("model store reads only the configured local model", async () => {
  const dir = await workdir("patent-model");
  try {
    const pkg = await materialize("patent-map", dir);
    const model = path.join(dir, "model");
    await mkdir(model, { recursive: true });
    await writeFile(path.join(model, "model.onnx"), Buffer.alloc(1_000_100));
    await writeFile(path.join(model, "config.json"), "{}");
    await writeFile(path.join(model, "tokenizer.json"), "{}");
    await writeFile(path.join(model, "pytorch_model.bin"), Buffer.alloc(2048));
    const absent = path.join(dir, "absent-model");
    const result = pythonCode(
      [
        "import json, os, sys",
        "from pathlib import Path",
        "tools, model, absent = (Path(sys.argv[i]) for i in range(1, 4))",
        "os.environ['PATENT_MAP_MODEL_DIR'] = str(model)",
        "before_env = dict(os.environ)",
        "before_files = sorted(p.name for p in model.iterdir())",
        "sys.path.insert(0, str(tools))",
        "import model_store",
        "hit = model_store.find_local_model()",
        "ready, source = model_store.ensure_model()",
        "after_env = dict(os.environ)",
        "after_files = sorted(p.name for p in model.iterdir())",
        "os.environ['PATENT_MAP_MODEL_DIR'] = str(absent)",
        "missing_hit = model_store.find_local_model()",
        "missing_ready, missing_source = model_store.ensure_model()",
        "print(json.dumps({'hit': str(hit) if hit else None, 'ready': str(ready) if ready else None, 'source': source, 'env_same': before_env == after_env, 'pytorch_kept': (model / 'pytorch_model.bin').is_file(), 'new_files': [n for n in after_files if n not in before_files], 'missing_hit': str(missing_hit) if missing_hit else None, 'missing_source': missing_source, 'missing_created': absent.exists()}))",
      ].join("\n"),
      [path.join(pkg, "tools"), model, absent],
      { cwd: pkg },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const report = JSON.parse(result.stdout) as { hit: string | null; ready: string | null; source: string; env_same: boolean; pytorch_kept: boolean; new_files: string[]; missing_hit: string | null; missing_source: string; missing_created: boolean };
    assert.equal(report.hit, model);
    assert.equal(report.ready, model);
    assert.equal(report.source, "configured-local");
    assert.equal(report.env_same, true, "model store must not mutate the process environment");
    assert.equal(report.pytorch_kept, true, "model store must not delete configured model files");
    assert.deepEqual(report.new_files, []);
    assert.equal(report.missing_hit, null);
    assert.equal(report.missing_source, "local-model-incomplete");
    assert.equal(report.missing_created, false, "model store must not create model directories");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("docx rendering uses the configured environment", async (t) => {
  if (!hasModule("docx")) {
    t.skip("missing prerequisite: python-docx");
    return;
  }
  const dir = await workdir("patent-docx");
  try {
    const pkg = await materialize("patent-oa", dir);
    const markdown = path.join(dir, "opinion.md");
    await writeFile(markdown, "# 意见陈述书\n\n权利要求 1 具备新颖性。\n\n- 依据：对比文件 1 未公开该特征。\n");
    const docx = path.join(dir, "opinion.docx");
    const result = python([path.join(pkg, "tools/md_to_docx.py"), "-i", markdown, "-o", docx], { cwd: pkg });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const bytes = readFileSync(docx);
    assert.equal(bytes.subarray(0, 2).toString("latin1"), "PK");
    assert.match(bytes.toString("latin1"), /word\/document\.xml/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

void test("CAD and browser tools report unavailable dependencies without installing", async () => {
  const dir = await workdir("patent-boundary");
  try {
    const pkg = await materialize("patent-disclosure", dir);
    const deps = python([path.join(pkg, "tools/run_step_to_views.py"), "--check-deps"], { cwd: pkg });
    assert.ok(deps.status === 0 || deps.status === 2, deps.stdout + deps.stderr);
    assert.ok(!existsSync(path.join(pkg, "tools/cad-env")), "cad-env must never be bootstrapped by the package tool");
    assert.doesNotMatch(deps.stdout + deps.stderr, /bootstrap_cad_venv|pip install/i);
    if (deps.status === 2) assert.match(deps.stdout, /"ok": false/);

    const browser = pythonCode(
      [
        "import json, sys",
        "sys.path.insert(0, sys.argv[1])",
        "import browser",
        "print(json.dumps({'installed': bool(browser.playwright_installed()), 'package_hint': browser.install_package_hint(), 'chromium_hint': browser.install_chromium_hint()}))",
      ].join("\n"),
      [path.join(pkg, "tools")],
      { cwd: pkg },
    );
    assert.equal(browser.status, 0, browser.stdout + browser.stderr);
    const report = JSON.parse(browser.stdout) as { installed: boolean; package_hint: string; chromium_hint: string };
    assert.equal(typeof report.installed, "boolean");
    assert.ok(report.package_hint.length > 0 && report.chromium_hint.length > 0);
    assert.ok(!existsSync(path.join(pkg, "node_modules")), "browser tools must not install packages");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
