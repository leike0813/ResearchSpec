import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(".");
const MANIFEST = path.join(ROOT, "authoring/patent-disclosure-skill/runtime-assets.json");
const AR_PROJECT = path.join(homedir(), ".ar");
const UV = spawnSync("sh", ["-c", "command -v uv"], { encoding: "utf8" }).stdout.trim();
const python = Boolean(UV) && existsSync(path.join(AR_PROJECT, "pyproject.toml")) && spawnSync(UV, ["--version"]).status === 0;

interface ManifestRow {
  output_path: string;
  source_path: string;
}

interface Manifest {
  groups: Record<string, ManifestRow[]>;
}

interface EnvReport {
  status: string;
  obsidian_required: boolean;
  vault: string;
  resolved: { vault: string; source: string; exists: boolean; needs_user_input: boolean };
}

interface WriteStatus {
  obsidian: boolean;
  written: string;
  canvas: string;
  domain: string;
  bootstrap: string[];
  moc_updated: string[];
  obsidian_cli_properties: string[];
  glossary_resolved: Array<{ term: string; path: string; created: boolean }>;
}

interface LinkResult {
  note_count: number;
  edge_count: number;
  dry_run: boolean;
}

interface Sandbox {
  package: string;
  tools: string;
  home: string;
  emptyPath: string;
  work: string;
  vault: string;
  other: string;
  missing: string;
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as Manifest;

async function materialise(business: string, dir: string): Promise<string> {
  const rows = manifest.groups[business];
  assert.ok(rows && rows.length > 0, "missing business group " + business);
  for (const row of rows) {
    const target = path.join(dir, business, ...row.output_path.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(ROOT, row.source_path), target);
  }
  return path.join(dir, business);
}

async function sandbox(): Promise<Sandbox> {
  const base = await mkdtemp(path.join(tmpdir(), "researchspec-obsidian-"));
  const packageDir = await materialise("patent-reader", path.join(base, "pkg"));
  const work = path.join(base, "work");
  const home = path.join(base, "home");
  const emptyPath = path.join(base, "empty-bin");
  const vault = path.join(base, "vault");
  const other = path.join(base, "other-vault");
  for (const dir of [work, home, emptyPath, vault, other]) await mkdir(dir, { recursive: true });
  const missing = path.join(base, "missing-vault");
  await writeFile(path.join(work, "manifest.json"), JSON.stringify({
    pub_number: "CN118765432A",
    ipc_codes: ["H01L21/02"],
    assignees: ["示例科技有限公司"],
    evidence_scope: "full_text",
    source_path: "",
  }, null, 2) + "\n", "utf8");
  await writeFile(path.join(work, "note.md"), [
    "# 示例半导体芯片器件专利解读",
    "",
    "本文解读示例半导体芯片器件。",
    "",
    "## 一、背景技术",
    "",
    "## 二、独立权利要求 1",
    "",
    "一种半导体器件，包括衬底与第一导电层，所述第一导电层设置有沟槽。",
    "",
    "## 三、权利要求树",
    "",
    "## 四、稳定性",
    "",
    "## 五、术语",
    "",
    "## 六、附图",
    "",
  ].join("\n"), "utf8");
  await writeFile(path.join(work, "bundle.json"), JSON.stringify({
    glossary_candidates: [
      { term: "沟槽", definition: "半导体衬底上的凹槽结构", source: "CN118765432A" },
      { term: "第一导电层", definition: "位于衬底之上的金属导电层", source: "CN118765432A" },
    ],
  }, null, 2) + "\n", "utf8");
  return { package: packageDir, tools: path.join(packageDir, "tools"), home, emptyPath, work, vault, other, missing };
}

function run(box: Sandbox, args: string[], options: { cwd?: string; env?: Record<string, string | undefined> } = {}): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  const result = spawnSync(UV, ["run", "--project=" + AR_PROJECT, "--locked", "--no-sync", "--", "python", ...args], {
    cwd: options.cwd ?? box.work,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    env: {
      PATH: box.emptyPath,
      HOME: box.home,
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      PYTHONDONTWRITEBYTECODE: "1",
      PATENT_READER_OBSIDIAN_VAULT: undefined,
      PATENT_DISCLOSURE_OBSIDIAN_VAULT: undefined,
      ...options.env,
    },
  });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- callers pin the expected JSON shape
function json<T>(payload: string | { stdout: string }): T {
  return JSON.parse(typeof payload === "string" ? payload : payload.stdout) as T;
}

async function tree(root: string): Promise<Record<string, string>> {
  const found: Record<string, string> = {};
  const walk = async (current: string, prefix: string): Promise<void> => {
    for (const entry of (await readdir(current, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full, prefix + entry.name + "/");
      else found[prefix + entry.name] = await readFile(full, "utf8");
    }
  };
  await walk(root, "");
  return found;
}

function inside(root: string, target: string): boolean {
  return target === root || target.startsWith(root + path.sep);
}

async function noUserConfig(box: Sandbox): Promise<void> {
  const entries = await readdir(box.home);
  const foreign = entries.filter((entry) => entry !== ".cache");
  assert.deepEqual(foreign, []);
  assert.equal(existsSync(path.join(box.home, ".patent-disclosure-skill")), false);
}

void test("the vault probe reports only an explicitly selected vault and writes no user configuration", { skip: !python }, async () => {
  const box = await sandbox();
  try {
    const probe = path.join(box.tools, "vault/check_obsidian_env.py");

    const ready = run(box, [probe, "--vault", box.vault, "--json"]);
    assert.equal(ready.status, 0);
    assert.deepEqual(
      {
        status: json<EnvReport>(ready).status,
        source: json<EnvReport>(ready).resolved.source,
        exists: json<EnvReport>(ready).resolved.exists,
        obsidian_required: json<EnvReport>(ready).obsidian_required,
      },
      { status: "ready", source: "explicit", exists: true, obsidian_required: false },
    );
    assert.equal(run(box, [probe, "--vault", box.vault, "--require-vault"]).status, 0);

    const selected = json<EnvReport>(run(box, [probe, "--vault", box.missing, "--json"]));
    assert.deepEqual({ status: selected.status, exists: selected.resolved.exists }, { status: "need_vault_path", exists: false });
    assert.equal(run(box, [probe, "--vault", box.missing, "--require-vault"]).status, 2);

    const unselected = json<EnvReport>(run(box, [probe, "--json"]));
    assert.deepEqual(
      { status: unselected.status, needs_user_input: unselected.resolved.needs_user_input, source: unselected.resolved.source },
      { status: "need_vault_path", needs_user_input: true, source: "" },
    );
    assert.equal(run(box, [probe]).status, 0);

    const fromEnv = json<EnvReport>(run(box, [probe, "--json"], { env: { PATENT_READER_OBSIDIAN_VAULT: box.missing } }));
    assert.deepEqual({ status: fromEnv.status, source: fromEnv.resolved.source, exists: fromEnv.resolved.exists }, {
      status: "need_vault_path",
      source: "env",
      exists: false,
    });
    assert.equal(existsSync(box.missing), false);
    assert.deepEqual(Object.keys(await tree(box.vault)), []);
    await noUserConfig(box);
  } finally {
    await rm(path.dirname(box.work), { recursive: true, force: true });
  }
});

void test("a selected vault receives the note, canvas, base resources and glossary while the environment vault stays untouched", { skip: !python }, async () => {
  const box = await sandbox();
  try {
    const statusPath = path.join(box.work, "write-status.json");
    const write = run(box, [
      path.join(box.tools, "vault/write_patent_obsidian_note.py"),
      "--content-file", "note.md",
      "--manifest", "manifest.json",
      "--bundle", "bundle.json",
      "--vault", box.vault,
      "--no-copy-source-pdf",
      "--output", "write-status.json",
    ], { env: { PATENT_READER_OBSIDIAN_VAULT: box.other } });
    assert.equal(write.status, 0, write.stderr);
    const status = json<WriteStatus>(await readFile(statusPath, "utf8"));
    assert.equal(status.obsidian, true);
    assert.equal(status.domain, "通信与电子");
    assert.deepEqual(status.obsidian_cli_properties, []);
    for (const target of [status.written, status.canvas, ...status.moc_updated]) {
      assert.equal(inside(box.vault, target), true, "wrote outside the selected vault: " + target);
    }
    assert.equal(status.written.startsWith(path.join(box.vault, "Research/Patents/通信与电子/CN118765432A")), true);
    assert.equal(status.bootstrap.some((action) => action.includes("base:")), true);
    assert.equal(status.bootstrap.some((action) => action.includes("glossary_base:")), true);
    assert.equal(status.bootstrap.some((action) => action.includes("snippet:")), true);

    const canvas = JSON.parse(await readFile(status.canvas, "utf8")) as { nodes: unknown[]; edges: unknown[] };
    assert.equal(Array.isArray(canvas.nodes) && canvas.nodes.length > 0, true);
    assert.equal(Array.isArray(canvas.edges), true);

    for (const relative of [
      "Research/Patents/patents.base",
      "Research/Patents/_专利解读索引.md",
      "Research/Patents/通信与电子/_领域索引.md",
      "Research/术语/glossary.base",
      "Research/术语/_术语索引.md",
      ".obsidian/snippets/patent-reader.css",
    ]) {
      assert.equal(existsSync(path.join(box.vault, relative)), true, "missing vault resource: " + relative);
    }
    const appearance = JSON.parse(await readFile(path.join(box.vault, ".obsidian/appearance.json"), "utf8")) as { enabledCssSnippets: string[] };
    assert.deepEqual(appearance.enabledCssSnippets, ["patent-reader"]);
    const corePlugins = JSON.parse(await readFile(path.join(box.vault, ".obsidian/core-plugins.json"), "utf8")) as { bases: boolean };
    assert.equal(corePlugins.bases, true);

    const papersBase = await readFile(path.join(box.vault, "Research/Patents/patents.base"), "utf8");
    assert.equal(papersBase.includes("file.hasTag"), true);
    const glossaryBase = await readFile(path.join(box.vault, "Research/术语/glossary.base"), "utf8");
    assert.equal(glossaryBase.includes("file.hasTag"), true);

    const globalIndex = await readFile(path.join(box.vault, "Research/Patents/_专利解读索引.md"), "utf8");
    assert.equal(globalIndex.includes("CN118765432A"), true);
    const note = await readFile(status.written, "utf8");
    for (const nav of ["_专利解读索引", "_领域索引", "_术语索引"]) {
      assert.equal(note.includes(nav), true, "missing vault navigation: " + nav);
    }

    assert.equal(status.glossary_resolved.length > 0, true);
    for (const entry of status.glossary_resolved) {
      assert.equal(existsSync(path.join(box.vault, entry.path + ".md")), true, "missing glossary page: " + entry.term);
    }
    const glossaryIndex = await readFile(path.join(box.vault, "Research/术语/_术语索引.md"), "utf8");
    assert.equal(status.glossary_resolved.every((entry) => glossaryIndex.includes(entry.term)), true);

    assert.deepEqual(Object.keys(await tree(box.other)), []);
    assert.equal(existsSync(path.join(box.work, "outputs")), false);
    await noUserConfig(box);

    const canvasCli = path.join(box.tools, "vault/build_patent_canvas.py");
    const rebuilt = run(box, [
      canvasCli,
      "--vault", box.vault,
      "--note-rel", path.relative(box.vault, status.written),
      "--manifest", "manifest.json",
      "--bundle", "bundle.json",
      "-o", "Research/Patents/通信与电子/CN118765432A/rebuilt.canvas",
    ]);
    assert.equal(rebuilt.status, 0, rebuilt.stderr);
    const rebuiltCanvas = JSON.parse(
      await readFile(path.join(box.vault, "Research/Patents/通信与电子/CN118765432A/rebuilt.canvas"), "utf8"),
    ) as { nodes: unknown[]; edges: unknown[] };
    assert.equal(rebuiltCanvas.nodes.length > 0, true);
  } finally {
    await rm(path.dirname(box.work), { recursive: true, force: true });
  }
});

void test("without a selected vault the note falls back to an ordinary output directory", { skip: !python }, async () => {
  const box = await sandbox();
  try {
    const statusPath = path.join(box.work, "fallback-status.json");
    const write = run(box, [
      path.join(box.tools, "vault/write_patent_obsidian_note.py"),
      "--content-file", "note.md",
      "--manifest", "manifest.json",
      "--bundle", "bundle.json",
      "--no-copy-source-pdf",
      "--output", "fallback-status.json",
    ]);
    assert.equal(write.status, 0, write.stderr);
    const status = json<WriteStatus>(await readFile(statusPath, "utf8"));
    assert.equal(status.obsidian, false);
    assert.deepEqual(status.bootstrap, []);
    assert.deepEqual(status.moc_updated, []);
    const written = path.resolve(box.work, status.written);
    const canvas = path.resolve(box.work, status.canvas);
    assert.equal(inside(path.join(box.work, "outputs/patent_reader"), written), true);
    assert.equal(canvas.startsWith(path.dirname(written)), true);
    assert.equal(existsSync(path.join(box.work, "outputs/patent_reader/patents.base")), false);
    assert.equal(existsSync(path.join(box.vault, "Research")), false);
    const note = await readFile(written, "utf8");
    assert.equal(note.includes("_专利解读索引"), true);
    assert.equal(status.glossary_resolved.some((entry) => inside(written, path.join(written, entry.path))), true);
    await noUserConfig(box);
  } finally {
    await rm(path.dirname(box.work), { recursive: true, force: true });
  }
});

void test("vault linking needs a selected vault and a dry run leaves the vault unchanged", { skip: !python }, async () => {
  const box = await sandbox();
  try {
    const link = path.join(box.tools, "vault/link_patent_notes.py");
    assert.equal(run(box, [link, "--dry-run"]).status, 1);
    assert.equal(run(box, [link, "--dry-run", "--vault", box.missing]).status, 1);

    assert.equal(run(box, [
      path.join(box.tools, "vault/write_patent_obsidian_note.py"),
      "--content-file", "note.md",
      "--manifest", "manifest.json",
      "--no-copy-source-pdf",
      "--output", "seed.json",
    ], { env: { PATENT_READER_OBSIDIAN_VAULT: box.vault } }).status, 0);
    const before = await tree(box.vault);

    const dry = run(box, [link, "--vault", box.vault, "--dry-run", "-o", "links.json"]);
    assert.equal(dry.status, 0, dry.stderr);
    const result = json<LinkResult>(await readFile(path.join(box.work, "links.json"), "utf8"));
    assert.equal(result.dry_run, true);
    assert.equal(result.note_count > 0, true);
    assert.deepEqual(await tree(box.vault), before);
    await noUserConfig(box);
  } finally {
    await rm(path.dirname(box.work), { recursive: true, force: true });
  }
});
