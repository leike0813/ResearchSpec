import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(".");
const TOOL = path.join(ROOT, "authoring/patent-disclosure-skill/runtime/patent-oa/tools/oa_history.py");
const BOUNDARY = path.join(ROOT, "authoring/patent-disclosure-skill/runtime/shared/patent_files.py");
const AR_PROJECT = path.join(homedir(), ".ar");
const python = existsSync(path.join(AR_PROJECT, "pyproject.toml")) && spawnSync("uv", ["--version"]).status === 0;

interface Hit {
  case_id: string;
  version: number;
  versions_on_disk: number;
  path: string;
  gold: boolean;
  score: number;
  score_components: { similarity: number; metadata: number };
  similarity_source: string;
  source_paths: string[];
  diff: Record<string, unknown>;
}

interface SearchResult {
  ok: boolean;
  retrieval_mode: string;
  vector_ranked: boolean;
  scanned_cases: number;
  matched_cases: number;
  hits: Hit[];
  notes: string[];
}

interface IngestResult {
  ok: boolean;
  case_id?: string;
  version?: number;
  previous_version?: number | null;
  written?: boolean;
  reason?: string;
  problems?: string[];
}

interface ScoredCandidate {
  strategy: string;
  support: number;
  coverage: number;
  claim_retention: number;
  history: { confirmed_case_ids: string[]; bonus_points: number };
  relative: { support: number; coverage: number; claim_retention: number };
  combined_relative: number;
  rank: number;
  margin_to_next: number | null;
  tied_with: string[];
}

interface ScoreResult {
  ok: boolean;
  candidates: ScoredCandidate[];
  problems?: string[];
}

interface Workspace {
  tool: string;
  project: string;
}

async function workspace(): Promise<Workspace> {
  const base = await mkdtemp(path.join(tmpdir(), "researchspec-patent-oa-"));
  const tools = path.join(base, "tools");
  await mkdir(tools, { recursive: true });
  await cp(TOOL, path.join(tools, "oa_history.py"));
  await cp(BOUNDARY, path.join(tools, "patent_files.py"));
  const project = path.join(base, "project");
  await mkdir(path.join(project, "cases"), { recursive: true });
  await mkdir(path.join(project, "researchspec"), { recursive: true });
  return { tool: path.join(tools, "oa_history.py"), project };
}

function run(space: Workspace, args: string[]): { status: number | null; stdout: string } {
  const result = spawnSync(
    "uv",
    ["run", "--project=" + AR_PROJECT, "--locked", "--no-sync", "--", "python", space.tool, ...args],
    {
      cwd: space.project,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    },
  );
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- callers pin the expected JSON shape
function json<T>(result: { stdout: string }): T {
  return JSON.parse(result.stdout) as T;
}

function caseDocument(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema_version: "1",
    case_id: "hist-clarity-connector",
    title: "连接器结构清楚性答复",
    patent_type: "invention",
    statutes: ["专利法第26条第4款"],
    defects: ["clarity"],
    tags: ["oa/clarity"],
    domain: "连接器",
    strategies: ["amend_claims"],
    outcome: "amended_then_granted",
    source_paths: ["materials/notice.md"],
    body: "权利要求中的连接器结构描述不清楚，修改独权增加结构特征。",
    redacted: true,
    ...overrides,
  };
}

async function writeCase(space: Workspace, name: string, document: Record<string, unknown>): Promise<string> {
  await writeFile(path.join(space.project, "cases", name), JSON.stringify(document, null, 2) + "\n", "utf8");
  return "cases/" + name;
}

async function snapshot(space: Workspace): Promise<Record<string, string>> {
  const found: Record<string, string> = {};
  const walk = async (current: string, prefix: string): Promise<void> => {
    for (const entry of (await readdir(current, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full, prefix + entry.name + "/");
      else found[prefix + entry.name] = await readFile(full, "utf8");
    }
  };
  await walk(path.join(space.project, "cases"), "");
  return found;
}

async function caseFiles(space: Workspace): Promise<Record<string, string>> {
  const found = await snapshot(space);
  return Object.fromEntries(Object.entries(found).filter(([name]) => name.startsWith("hist-") || name.includes("/v")));
}

void test("ingest refuses an unredacted case and keeps every accepted version immutable", { skip: !python }, async () => {
  const space = await workspace();
  try {
    const unredacted = await writeCase(space, "unredacted.json", caseDocument({ redacted: false }));
    const refused = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", unredacted]));
    assert.equal(refused.ok, false);
    assert.equal(refused.problems?.some((problem) => problem.includes("redacted")), true);
    assert.deepEqual(Object.keys(await caseFiles(space)), []);

    const input = await writeCase(space, "case.json", caseDocument());
    const first = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", input]));
    assert.deepEqual(
      { ok: first.ok, case_id: first.case_id, version: first.version, previous_version: first.previous_version, written: first.written },
      { ok: true, case_id: "hist-clarity-connector", version: 1, previous_version: null, written: true },
    );

    const repeated = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", input]));
    assert.deepEqual({ written: repeated.written, version: repeated.version }, { written: false, version: 1 });
    const versionOne = await readFile(path.join(space.project, "cases/hist-clarity-connector/v1.json"), "utf8");

    const changed = await writeCase(space, "case.json", caseDocument({ body: "改写后的脱敏记录。" }));
    const second = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", changed]));
    assert.deepEqual(
      { version: second.version, previous_version: second.previous_version, written: second.written },
      { version: 2, previous_version: 1, written: true },
    );
    assert.equal(await readFile(path.join(space.project, "cases/hist-clarity-connector/v1.json"), "utf8"), versionOne);

    const overwritten = json<IngestResult>(
      run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", changed, "--overwrite"]),
    );
    assert.equal(overwritten.written, false);
    assert.equal(await readFile(path.join(space.project, "cases/hist-clarity-connector/v1.json"), "utf8"), versionOne);

    const found = json<SearchResult>(
      run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--query-text", "连接器 清楚性", "--top-k", "5"]),
    );
    assert.equal(found.hits.length, 1);
    assert.deepEqual(
      { version: found.hits[0]?.version, versions_on_disk: found.hits[0]?.versions_on_disk, gold: found.hits[0]?.gold },
      { version: 2, versions_on_disk: 2, gold: false },
    );
  } finally {
    await rm(path.dirname(space.project), { recursive: true, force: true });
  }
});

void test("malformed case input fails explicitly and writes nothing", { skip: !python }, async () => {
  const space = await workspace();
  try {
    await writeFile(path.join(space.project, "cases/broken.json"), "{not json", "utf8");
    const parsed = run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", "cases/broken.json"]);
    assert.equal(parsed.status, 2);
    assert.equal(json<IngestResult>(parsed).ok, false);

    const wrongField = await writeCase(space, "wrong.json", caseDocument({ statutes: "专利法第26条第4款" }));
    const rejected = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", wrongField]));
    assert.equal(rejected.ok, false);
    assert.equal(rejected.problems?.some((problem) => problem.includes("statutes")), true);

    const escaping = await writeCase(space, "escape.json", caseDocument({ case_id: "../evil" }));
    const traversal = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", escaping]));
    assert.equal(traversal.ok, false);
    assert.deepEqual(Object.keys(await caseFiles(space)), []);
    assert.equal(existsSync(path.join(path.dirname(space.project), "evil")), false);
  } finally {
    await rm(path.dirname(space.project), { recursive: true, force: true });
  }
});

void test("search filters, ranks, and leaves the collection untouched", { skip: !python }, async () => {
  const space = await workspace();
  try {
    const input = await writeCase(space, "case.json", caseDocument());
    run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", input]);
    const vectorCase = await writeCase(
      space,
      "vector-case.json",
      caseDocument({
        case_id: "hist-inventiveness-clamp",
        title: "创造性限缩案",
        defects: ["inventiveness"],
        body: "通过限缩独权克服创造性缺陷。",
        gold: true,
        query_vector: [1, 0, 0],
      }),
    );
    run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", vectorCase]);
    await writeCase(space, "query-vector.json", { vector: [1, 0, 0] });
    const before = await snapshot(space);

    const filtered = json<SearchResult>(
      run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--defect", "clarity", "--top-k", "5"]),
    );
    assert.equal(filtered.scanned_cases, 2);
    assert.deepEqual(filtered.hits.map((hit) => hit.case_id), ["hist-clarity-connector"]);
    assert.equal(filtered.hits[0]?.score, 1);
    assert.deepEqual(filtered.hits[0]?.source_paths, ["materials/notice.md"]);
    assert.deepEqual(filtered.hits[0]?.diff.defects_case, ["clarity"]);
    assert.equal(Object.hasOwn(filtered.hits[0] ?? {}, "body"), false);

    const excluded = json<SearchResult>(
      run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--defect", "formality", "--top-k", "5"]),
    );
    assert.deepEqual({ matched: excluded.matched_cases, hits: excluded.hits.length }, { matched: 0, hits: 0 });
    assert.equal(excluded.notes.some((note) => note.includes("excluded every case")), true);

    const lexical = json<SearchResult>(
      run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--query-text", "限缩独权 创造性", "--top-k", "5"]),
    );
    assert.deepEqual(
      { mode: lexical.retrieval_mode, ranked: lexical.vector_ranked, first: lexical.hits[0]?.case_id },
      { mode: "lexical", ranked: false, first: "hist-inventiveness-clamp" },
    );

    const cosine = json<SearchResult>(
      run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--query-vector", "cases/query-vector.json", "--top-k", "5"]),
    );
    assert.deepEqual(
      { mode: cosine.retrieval_mode, ranked: cosine.vector_ranked, first: cosine.hits[0]?.case_id },
      { mode: "cosine", ranked: true, first: "hist-inventiveness-clamp" },
    );
    assert.deepEqual(Object.keys(cosine.hits[0] ?? {}).sort(), Object.keys(lexical.hits[0] ?? {}).sort());
    assert.deepEqual(
      Object.keys(cosine.hits[0]?.score_components ?? {}).sort(),
      Object.keys(lexical.hits[0]?.score_components ?? {}).sort(),
    );
    assert.equal(cosine.hits[1]?.similarity_source, "none");

    assert.deepEqual(await snapshot(space), before);
  } finally {
    await rm(path.dirname(space.project), { recursive: true, force: true });
  }
});

void test("score compares strategies relatively and credits only confirmed history", { skip: !python }, async () => {
  const space = await workspace();
  try {
    const input = await writeCase(space, "case.json", caseDocument({ gold: true }));
    run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", input]);
    const unconfirmed = await writeCase(space, "unconfirmed.json", caseDocument({ case_id: "hist-unconfirmed", gold: false }));
    run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", unconfirmed]);
    const assessment = await writeCase(space, "assessment.json", {
      schema_version: "1",
      patent_type: "invention",
      defects: ["clarity"],
      candidates: [
        { strategy: "amend_claims", support: 70, coverage: 70, claim_retention: 60, supporting_cases: ["hist-clarity-connector", "hist-unconfirmed"] },
        { strategy: "argue_only", support: 60, coverage: 60, claim_retention: 60, supporting_cases: ["hist-clarity-connector"] },
        { strategy: "amend_spec", support: 50, coverage: 50, claim_retention: 50, supporting_cases: [] },
      ],
    });

    const before = await caseFiles(space);
    const scored = json<ScoreResult>(run(space, ["score", "--project-root", ".", "--cases-dir", "cases", "--input", assessment]));
    const amend = scored.candidates.find((candidate) => candidate.strategy === "amend_claims");
    const argue = scored.candidates.find((candidate) => candidate.strategy === "argue_only");
    const spec = scored.candidates.find((candidate) => candidate.strategy === "amend_spec");
    assert.deepEqual(amend?.history.confirmed_case_ids, ["hist-clarity-connector"]);
    assert.equal(amend?.history.bonus_points, 8);
    assert.equal(argue?.history.bonus_points, 0);
    assert.deepEqual(argue?.history.confirmed_case_ids, []);
    assert.equal((amend?.relative.support ?? 0) > (argue?.relative.support ?? 0), true);
    assert.deepEqual([amend?.rank, argue?.rank, spec?.rank], [1, 2, 3]);
    assert.deepEqual(argue?.tied_with, []);
    assert.equal((argue?.margin_to_next ?? 0) > 0, true);
    assert.equal(spec?.margin_to_next, null);
    assert.equal(
      scored.candidates.every((candidate) => candidate.relative.support <= 1 && candidate.relative.claim_retention <= 1),
      true,
    );

    const tie = await writeCase(space, "tie.json", {
      schema_version: "1",
      defects: ["clarity"],
      candidates: [
        { strategy: "argue_only", support: 60, coverage: 60, claim_retention: 60 },
        { strategy: "amend_claims", support: 60, coverage: 60, claim_retention: 60 },
      ],
    });
    const tied = json<ScoreResult>(run(space, ["score", "--project-root", ".", "--cases-dir", "cases", "--input", tie]));
    assert.equal(tied.candidates[0]?.combined_relative, tied.candidates[1]?.combined_relative);
    assert.deepEqual(tied.candidates[0]?.tied_with, ["argue_only"]);
    assert.equal(tied.candidates[0]?.margin_to_next, 0);

    const malformed = await writeCase(space, "bad.json", {
      schema_version: "1",
      candidates: [{ strategy: "argue_only", support: 140, coverage: 60, claim_retention: 60 }],
    });
    const refused = json<ScoreResult>(run(space, ["score", "--project-root", ".", "--cases-dir", "cases", "--input", malformed]));
    assert.equal(refused.ok, false);
    assert.equal(refused.problems?.some((problem) => problem.includes("support")), true);

    assert.deepEqual(await caseFiles(space), before);
  } finally {
    await rm(path.dirname(space.project), { recursive: true, force: true });
  }
});

void test("every read and write stays inside the project and outside researchspec", { skip: !python }, async () => {
  const space = await workspace();
  try {
    await mkdir(path.join(space.project, "researchspec/cases"), { recursive: true });
    const outside = path.join(path.dirname(space.project), "cases");
    await mkdir(outside, { recursive: true });

    const escaped = json<IngestResult>(run(space, ["search", "--project-root", ".", "--cases-dir", "../cases", "--query-text", "x"]));
    assert.equal(escaped.ok, false);

    const workflow = json<IngestResult>(run(space, ["search", "--project-root", ".", "--cases-dir", "researchspec/cases", "--query-text", "x"]));
    assert.equal(workflow.ok, false);

    const absolute = json<IngestResult>(run(space, ["ingest", "--project-root", ".", "--cases-dir", "cases", "--input", "/etc/hostname"]));
    assert.equal(absolute.ok, false);

    await symlink(outside, path.join(space.project, "cases/linked"), "dir");
    const linked = json<SearchResult>(run(space, ["search", "--project-root", ".", "--cases-dir", "cases", "--query-text", "x"]));
    assert.equal(linked.ok, false);
  } finally {
    await rm(path.dirname(space.project), { recursive: true, force: true });
  }
});
