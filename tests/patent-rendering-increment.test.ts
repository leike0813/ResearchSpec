import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const AR_PROJECT = path.join(process.env.HOME ?? "", ".ar");
const RUNTIME = path.join(ROOT, "authoring/patent-disclosure-skill/runtime");
const SHARED = path.join(RUNTIME, "shared");

interface ToolResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface OmmlProbe {
  path: string;
  le: string;
  ge: string;
  leq: string;
  geq: string;
  max: string;
}

interface WorkbookProbe {
  sheets: Record<string, string>;
  styles: string;
}

function python(args: string[], options: { cwd?: string; code?: string } = {}): ToolResult {
  const result = spawnSync(
    "uv",
    ["run", `--project=${AR_PROJECT}`, "--locked", "--no-sync", "--", "python", ...args],
    {
      cwd: options.cwd,
      encoding: "utf8",
      input: options.code,
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    },
  );
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const OMML_PROBE = [
  "import importlib.util, json, sys, types",
  "",
  "docx = types.ModuleType('docx')",
  "oxml = types.ModuleType('docx.oxml')",
  "ns = types.ModuleType('docx.oxml.ns')",
  "oxml.OxmlElement = lambda tag: None",
  "ns.qn = lambda tag: tag",
  "docx.oxml = oxml",
  "sys.modules['docx'] = docx",
  "sys.modules['docx.oxml'] = oxml",
  "sys.modules['docx.oxml.ns'] = ns",
  "",
  "def load(path):",
  "    spec = importlib.util.spec_from_file_location('math_to_omml_probe', path)",
  "    module = importlib.util.module_from_spec(spec)",
  "    spec.loader.exec_module(module)",
  "    return module",
  "",
  "rows = []",
  "bs = chr(92)",
  "for path in sys.argv[1:]:",
  "    normalize = load(path).normalize_latex_for_omml",
  "    rows.append({",
  "        'path': path,",
  "        'le': normalize('a ' + bs + 'le b'),",
  "        'ge': normalize('a ' + bs + 'ge b'),",
  "        'leq': normalize('a ' + bs + 'leq b'),",
  "        'geq': normalize('a ' + bs + 'geq b'),",
  "        'max': normalize(bs + 'max' + bs + 'left(0, x' + bs + 'right)'),",
  "    })",
  "print(json.dumps(rows, ensure_ascii=False))",
].join("\n");

const WORKBOOK_PROBE = [
  "import json, re, sys, zipfile",
  "",
  "with zipfile.ZipFile(sys.argv[1]) as zf:",
  "    workbook = zf.read('xl/workbook.xml').decode('utf-8')",
  "    styles = zf.read('xl/styles.xml').decode('utf-8')",
  "    names = re.findall(r'<sheet name=\"([^\"]+)\"', workbook)",
  "    sheets = {",
  "        name: zf.read(f'xl/worksheets/sheet{index}.xml').decode('utf-8')",
  "        for index, name in enumerate(names, start=1)",
  "    }",
  "print(json.dumps({'sheets': sheets, 'styles': styles}, ensure_ascii=False))",
].join("\n");

const CHART_FIXTURE = {
  scene: "invalidity",
  left: { pub_number: "CN219812345U" },
  features: [
    { feature_id: "F1", claim_no: 1, text: "壳体与端盖围出冷却腔" },
    { feature_id: "F2", claim_no: 2, text: "桥接筋连通两区" },
  ],
  columns: [
    { id: "D1", label: "CN216600001U", source_url: "" },
    { id: "D2", label: "CN216600002U", source_url: "" },
  ],
  highlights: [{ id: "H1", label: "冷却腔", claim: "冷却腔", evidence: "冷却空腔" }],
  cells: [
    { feature_id: "F1", column_id: "D1", strength: "强", quote: "壳体与端盖形成冷却空腔。", analysis: "对应：冷却腔。" },
    { feature_id: "F1", column_id: "D2", strength: "无", quote: "", analysis: "未记载密封结构。" },
    { feature_id: "F2", column_id: "D1", strength: "中", quote: "桥接筋连通两区。", analysis: "对应：桥接筋。" },
    { feature_id: "F2", column_id: "D2", strength: "中", quote: "桥接筋贯通两个区域。", analysis: "对应：桥接筋。" },
  ],
};

async function renderChart(
  scene: string,
  overrides: Record<string, unknown> = {},
): Promise<WorkbookProbe> {
  const dir = await mkdtemp(path.join(tmpdir(), "patent-render-"));
  try {
    const chartPath = path.join(dir, "chart.json");
    await writeFile(
      chartPath,
      JSON.stringify({ ...CHART_FIXTURE, ...overrides, scene }),
      "utf8",
    );
    const rendered = python(
      [path.join(SHARED, "emit_chart.py"), "--json", chartPath, "--output-dir", path.join(dir, "out"), "--case-id", "case1"],
      { cwd: SHARED },
    );
    assert.equal(rendered.status, 0, rendered.stderr);
    const match = /CHART_XLSX: (.+)/.exec(rendered.stdout);
    assert.ok(match, rendered.stdout);
    const inspected = python(["-", match[1].trim()], { code: WORKBOOK_PROBE });
    assert.equal(inspected.status, 0, inspected.stderr);
    return JSON.parse(inspected.stdout) as WorkbookProbe;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

void test("OMML normalization rewrites only complete le and ge commands", () => {
  const targets = [
    path.join(RUNTIME, "patent-application/tools/math_to_omml.py"),
    path.join(RUNTIME, "patent-disclosure/tools/math_to_omml.py"),
  ];
  const result = python(["-", ...targets], { code: OMML_PROBE });
  assert.equal(result.status, 0, result.stderr);
  const rows = JSON.parse(result.stdout) as OmmlProbe[];
  assert.equal(rows.length, targets.length);
  for (const row of rows) {
    assert.match(row.le, /\\leq/, row.path);
    assert.doesNotMatch(row.le, /\\leqq/, row.path);
    assert.match(row.ge, /\\geq/, row.path);
    assert.doesNotMatch(row.ge, /\\geqq/, row.path);
    assert.equal(row.leq, "a \\leq b", row.path);
    assert.equal(row.geq, "a \\geq b", row.path);
    assert.doesNotMatch(row.max, /leqft|geqq/, row.path);
  }
});

void test("claim chart states per-claim readings instead of per-cell only", async () => {
  const invalidity = await renderChart("invalidity");
  const memo = invalidity.sheets["路径备忘"];
  assert.ok(memo, "invalidity chart lacks the path memo sheet");
  assert.match(memo, /权1/);
  assert.match(memo, /权2/);
  assert.match(memo, /缺格：该文献不能单独打该权/);
  assert.match(memo, /单篇路径/);

  const fto = await renderChart("fto");
  const risks = fto.sheets["风险清单"];
  assert.ok(risks, "fto chart lacks the risk list sheet");
  assert.match(risks, /缺格：该权对该方案不构成落入候选/);
  assert.match(risks, /全部特征均为很强或中等/);
});

void test("claim chart detail blocks link back to their overview cell", async () => {
  const book = await renderChart("invalidity");
  const drill = book.sheets["明细"];
  assert.ok(drill, "chart lacks the detail sheet");
  assert.match(drill, /#'总览'!D4/);
  assert.match(drill, /#'总览'!E5/);
  assert.doesNotMatch(drill, /#'总览'!A4/);
});

void test("OA chart retains its rejection mapping without answer prose", async () => {
  const book = await renderChart("oa", {
    rejections: [
      {
        id: "R1",
        item: "创造性异议",
        statute: "创造性",
        examiner_view: "对比文件已公开冷却腔。",
        feature_ids: ["F1", "F2"],
        column_ids: ["D1", "D2"],
      },
    ],
  });
  const mapping = book.sheets["驳回映射"];
  assert.ok(mapping, "OA chart lacks the rejection mapping sheet");
  assert.match(mapping, /审查答复/);
  assert.match(mapping, /驳回点/);
  assert.match(mapping, /创造性异议/);
  assert.match(mapping, /审查员观点/);
  assert.match(mapping, /不写入意见陈述正文/);
});

void test("claim chart strength badges keep the reviewed blue and amber palette", async () => {
  const book = await renderChart("invalidity");
  assert.match(book.styles, /FF1D4ED8/);
  assert.match(book.styles, /FFFDE047/);
  assert.doesNotMatch(book.styles, /FF047857/);
  assert.doesNotMatch(book.styles, /FFFACC15/);
});
