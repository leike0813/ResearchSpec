import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { uvPythonArgs } from "./helpers/python.js";

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, "authoring/patent-disclosure-skill/runtime");
const SHARED = path.join(RUNTIME, "shared");
const SEARCH_TOOLS = path.join(RUNTIME, "patent-search", "tools");

interface SubmitError {
  reason?: string;
  status?: number;
  stage?: string;
  detail?: string;
}

interface SubmitOutcome {
  filled: Record<string, string>;
  field: string | null;
  error: SubmitError | null;
}

interface PageSizeOutcome {
  selected: string[][];
  error: SubmitError | null;
}

interface Probe {
  publication: Record<string, string | null>;
  application: Record<string, string | null>;
  advanced: Record<string, SubmitOutcome>;
  nav: Record<string, SubmitOutcome>;
  page_size: Record<string, PageSizeOutcome>;
  wait: {
    gate_poll_sec: number;
    keys: string[];
    yaml_gate_poll_sec: number | null;
    yaml_has_result_page_size: boolean;
    env_gate_poll_sec: number;
  };
  ua: Record<string, string>;
  contexts: Record<string, Record<string, unknown>>;
  fast_fetch: { constant: boolean; enabled: boolean };
}

// The probe drives the authored CNIPA modules in-process with a fake Playwright,
// so the query grammar, the user agent and the submit error provenance are checked
// without opening a browser or touching the CNIPA site.
const PYTHON_PROBE = [
  "import importlib.util",
  "import json",
  "import os",
  "import sys",
  "import types",
  "from pathlib import Path",
  "",
  "RUNTIME = Path(sys.argv[1])",
  "SEARCH = RUNTIME / 'patent-search' / 'tools'",
  "DISCLOSURE = RUNTIME / 'patent-disclosure' / 'tools'",
  "DISCLOSURE_CRAWL = DISCLOSURE / 'crawl'",
  "READER = RUNTIME / 'patent-reader' / 'tools'",
  "READER_CRAWL = READER / 'crawl'",
  "SHARED = RUNTIME / 'shared'",
  "",
  "for extra in (SHARED, SEARCH, DISCLOSURE, DISCLOSURE_CRAWL, READER, READER_CRAWL):",
  "    if str(extra) not in sys.path:",
  "        sys.path.insert(0, str(extra))",
  "",
  "REAL_UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '",
  "           'HeadlessChrome/150.0.7871.2 Safari/537.36')",
  "",
  "",
  "class FakeError(Exception):",
  "    pass",
  "",
  "",
  "class FakeTimeoutError(FakeError):",
  "    pass",
  "",
  "",
  "def install_fake_playwright():",
  "    sync_api = types.ModuleType('playwright.sync_api')",
  "    sync_api.Error = FakeError",
  "    sync_api.TimeoutError = FakeTimeoutError",
  "    sync_api.Page = type('Page', (), {})",
  "    sync_api.Browser = type('Browser', (), {})",
  "    sync_api.BrowserContext = type('BrowserContext', (), {})",
  "    sync_api.Playwright = type('Playwright', (), {})",
  "    sync_api.sync_playwright = lambda: None",
  "    package = types.ModuleType('playwright')",
  "    package.sync_api = sync_api",
  "    sys.modules['playwright'] = package",
  "    sys.modules['playwright.sync_api'] = sync_api",
  "",
  "",
  "install_fake_playwright()",
  "",
  "",
  "def load(name, path):",
  "    spec = importlib.util.spec_from_file_location(name, str(path))",
  "    module = importlib.util.module_from_spec(spec)",
  "    sys.modules[name] = module",
  "    spec.loader.exec_module(module)",
  "    return module",
  "",
  "",
  "class FakeElement:",
  "    def __init__(self, name='element'):",
  "        self.name = name",
  "",
  "    def check(self, force=False):",
  "        return None",
  "",
  "    def uncheck(self, force=False):",
  "        return None",
  "",
  "    def click(self, no_wait_after=False):",
  "        return None",
  "",
  "    def evaluate(self, script, arg=None):",
  "        return None",
  "",
  "    def query_selector(self, selector):",
  "        return FakeElement(self.name + '>' + selector)",
  "",
  "",
  "class FakeLocator:",
  "    def __init__(self, selector):",
  "        self.selector = selector",
  "",
  "    def count(self):",
  "        return 0",
  "",
  "    @property",
  "    def first(self):",
  "        return FakeElement(self.selector)",
  "",
  "",
  "class FakeRequest:",
  "    def __init__(self, url):",
  "        self.resource_type = 'document'",
  "        self.method = 'POST'",
  "        self.url = url",
  "",
  "",
  "class FakeResponse:",
  "    def __init__(self, status, url):",
  "        self.status = status",
  "        self.url = url",
  "        self.request = FakeRequest(url)",
  "",
  "",
  "class FakeInfo:",
  "    def __init__(self, value):",
  "        self.value = value",
  "",
  "    def __enter__(self):",
  "        return self",
  "",
  "    def __exit__(self, *exc_info):",
  "        return False",
  "",
  "",
  "class FakePage:",
  "    def __init__(self, status=200, elements=None, pager=None,",
  "                 response_url='http://epub.cnipa.gov.cn/Dxb/IndexQuery'):",
  "        self.url = 'http://epub.cnipa.gov.cn/Advanced'",
  "        self.status = status",
  "        self.elements = elements or {}",
  "        self.pager = pager",
  "        self.response_url = response_url",
  "        self.filled = {}",
  "        self.selected = []",
  "",
  "    def query_selector(self, selector):",
  "        return self.elements.get(selector)",
  "",
  "    def locator(self, selector):",
  "        return FakeLocator(selector)",
  "",
  "    def fill(self, selector, value):",
  "        self.filled[selector] = value",
  "",
  "    def select_option(self, selector, value):",
  "        self.selected.append([selector, value])",
  "",
  "    def evaluate(self, script, arg=None):",
  "        if self.pager is not None and 'total_item' in script:",
  "            return self.pager",
  "        return None",
  "",
  "    def wait_for_function(self, script, arg=None, timeout=None):",
  "        return True",
  "",
  "    def wait_for_timeout(self, ms):",
  "        return None",
  "",
  "    def expect_response(self, predicate, timeout=None):",
  "        response = FakeResponse(self.status, self.response_url)",
  "        assert predicate(response), 'fake response does not match the query predicate'",
  "        return FakeInfo(response)",
  "",
  "    def expect_request(self, predicate, timeout=None):",
  "        request = FakeRequest(self.response_url)",
  "        assert predicate(request), 'fake request does not match the query predicate'",
  "        return FakeInfo(request)",
  "",
  "",
  "class FakeProbe:",
  "    def __init__(self, ua):",
  "        self.ua = ua",
  "",
  "    def new_page(self):",
  "        return self",
  "",
  "    def evaluate(self, script):",
  "        return self.ua",
  "",
  "    def close(self):",
  "        return None",
  "",
  "",
  "class FakeBrowser:",
  "    def __init__(self, ua, version='150.0.7871.2', probe_fails=False):",
  "        self.ua = ua",
  "        self.version = version",
  "        self.probe_fails = probe_fails",
  "        self.contexts = []",
  "",
  "    def new_context(self, **kwargs):",
  "        if self.probe_fails:",
  "            raise RuntimeError('browser context unavailable')",
  "        if not kwargs:",
  "            return FakeProbe(self.ua)",
  "        self.contexts.append(kwargs)",
  "        return FakeElement('context')",
  "",
  "",
  "browser_search = load('browser', SEARCH / 'browser.py')",
  "browser_disclosure = load('browser_disclosure', DISCLOSURE / 'browser.py')",
  "browser_reader = load('browser_reader', READER / 'browser.py')",
  "",
  "load('patent_type', SEARCH / 'patent_type.py')",
  "cnipa_parse = load('cnipa_parse', SEARCH / 'cnipa_parse.py')",
  "cnipa_crawler = load('cnipa_crawler', SEARCH / 'cnipa_crawler.py')",
  "",
  "sys.modules['browser'] = browser_disclosure",
  "load('patent_type', DISCLOSURE / 'patent_type.py')",
  "load('cnipa_epub_parse', DISCLOSURE_CRAWL / 'cnipa_epub_parse.py')",
  "cnipa_epub_wait = load('cnipa_epub_wait', DISCLOSURE_CRAWL / 'cnipa_epub_wait.py')",
  "cnipa_epub_nav = load('cnipa_epub_nav', DISCLOSURE_CRAWL / 'cnipa_epub_nav.py')",
  "disclosure_crawler = load('disclosure_crawler', DISCLOSURE_CRAWL / 'cnipa_epub_crawler.py')",
  "",
  "sys.modules['browser'] = browser_reader",
  "load('patent_type', READER / 'patent_type.py')",
  "load('cnipa_epub_parse', READER_CRAWL / 'cnipa_epub_parse.py')",
  "reader_crawler = load('reader_crawler', READER_CRAWL / 'cnipa_epub_crawler.py')",
  "",
  "publication = {}",
  "for raw in ('CN102853527', 'CN 102853527 A', 'ZL102853527', '102853527A', '10285?'):",
  "    publication[raw] = cnipa_parse.publication_number_for_epub_query(raw)",
  "application = {}",
  "for raw in ('201921114883.3', 'CN2019211148833'):",
  "    application[raw] = cnipa_parse.application_number_for_epub_query(raw)",
  "",
  "",
  "def run_advanced(status):",
  "    page = FakePage(status=status, elements={'#pn': FakeElement('pn'), '#advForm': FakeElement('form')})",
  "    outcome = {'filled': {}, 'field': None, 'error': None}",
  "    try:",
  "        outcome['filled'] = cnipa_crawler.submit_advanced_query(",
  "            page, {'publication_number': 'CN 102853527 A'})",
  "    except cnipa_crawler.EpubSubmitError as exc:",
  "        outcome['error'] = {'reason': exc.reason, 'status': exc.status}",
  "    outcome['field'] = page.filled.get('#pn')",
  "    return outcome",
  "",
  "",
  "def run_nav(status):",
  "    page = FakePage(status=status)",
  "    outcome = {'filled': {}, 'field': None, 'error': None}",
  "    try:",
  "        cnipa_epub_nav.submit_index_search(page, '冷却系统')",
  "    except cnipa_epub_nav.EpubNavError as exc:",
  "        outcome['error'] = {'stage': exc.stage, 'detail': exc.detail}",
  "    return outcome",
  "",
  "",
  "def run_page_size(status):",
  "    page = FakePage(status=status,",
  "                    elements={'#sizeSelect': FakeElement('size')},",
  "                    pager={'items': 3, 'total': 42, 'size': '3'},",
  "                    response_url='http://epub.cnipa.gov.cn/Dxb/PageQuery?pageSize=10')",
  "    outcome = {'selected': [], 'error': None}",
  "    try:",
  "        cnipa_epub_nav.apply_result_page_size(page, advanced=False)",
  "    except cnipa_epub_nav.EpubNavError as exc:",
  "        outcome['error'] = {'stage': exc.stage, 'detail': exc.detail}",
  "    outcome['selected'] = page.selected",
  "    return outcome",
  "",
  "",
  "config = cnipa_epub_wait.load_wait_config(force_reload=True)",
  "yaml_config = {}",
  "try:",
  "    import yaml",
  "except ImportError:",
  "    yaml = None",
  "if yaml is not None:",
  "    yaml_config = yaml.safe_load((DISCLOSURE_CRAWL / 'cnipa_epub_wait.yaml').read_text(encoding='utf-8')) or {}",
  "os.environ['EPUB_WAF_MAX_WAIT_SEC'] = '45'",
  "env_config = cnipa_epub_wait.load_wait_config(force_reload=True)",
  "del os.environ['EPUB_WAF_MAX_WAIT_SEC']",
  "",
  "ua = {}",
  "for key, module in (('search', browser_search), ('disclosure', browser_disclosure), ('reader', browser_reader)):",
  "    ua[key] = module.browser_user_agent(FakeBrowser(REAL_UA))",
  "ua['fallback'] = browser_search.browser_user_agent(",
  "    FakeBrowser('', version='151.0.2.3', probe_fails=True))",
  "",
  "contexts = {}",
  "for key, module in (('search', cnipa_crawler), ('disclosure', cnipa_epub_nav), ('reader', reader_crawler)):",
  "    fake_browser = FakeBrowser(REAL_UA)",
  "    module._new_context(fake_browser)",
  "    contexts[key] = fake_browser.contexts[-1]",
  "",
  "os.environ.pop('EPUB_FAST_FETCH', None)",
  "",
  "report = {",
  "    'publication': publication,",
  "    'application': application,",
  "    'advanced': {'ok': run_advanced(200), 'rejected403': run_advanced(403), 'failed503': run_advanced(503)},",
  "    'nav': {'rejected403': run_nav(403), 'failed503': run_nav(503)},",
  "    'page_size': {'ok': run_page_size(200), 'rejected500': run_page_size(500)},",
  "    'wait': {",
  "        'gate_poll_sec': config['gate_poll_sec'],",
  "        'keys': sorted(config),",
  "        'yaml_gate_poll_sec': yaml_config.get('gate_poll_sec'),",
  "        'yaml_has_result_page_size': 'result_page_size' in yaml_config,",
  "        'env_gate_poll_sec': env_config['gate_poll_sec'],",
  "    },",
  "    'ua': ua,",
  "    'contexts': contexts,",
  "    'fast_fetch': {'constant': bool(disclosure_crawler.EPUB_FAST_FETCH),",
  "                  'enabled': disclosure_crawler.fast_fetch_enabled()},",
  "}",
  "print(json.dumps(report, ensure_ascii=False))",
].join("\n");

function runProbe(): Probe {
  const result = spawnSync(
    "uv",
    uvPythonArgs(["-", RUNTIME]),
    {
      cwd: ROOT,
      encoding: "utf8",
      input: PYTHON_PROBE,
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    },
  );
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `probe failed:\n${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout ?? "") as Probe;
}

let cached: Probe | undefined;

function probe(): Probe {
  cached ??= runProbe();
  return cached;
}

void test("公布站查询语法把公开号与申请号改写成站点可接受的形式", () => {
  const report = probe();
  assert.deepEqual(report.publication, {
    CN102853527: "102853527",
    "CN 102853527 A": "102853527A",
    ZL102853527: "102853527",
    "102853527A": "102853527A",
    "10285?": "10285?",
  });
  assert.deepEqual(report.application, {
    "201921114883.3": "2019211148833",
    CN2019211148833: "2019211148833",
  });
  assert.equal(report.advanced.ok.error, null);
  assert.equal(report.advanced.ok.field, "102853527A");
  assert.equal(report.advanced.ok.filled.publication_number, "102853527A");
});

void test("浏览器上下文使用本机真实 UA 而不是写死的旧版本号", () => {
  const report = probe();
  for (const key of ["search", "disclosure", "reader"]) {
    assert.match(report.ua[key], /Chrome\/150\.0\.7871\.2/);
    assert.doesNotMatch(report.ua[key], /HeadlessChrome/);
    assert.match(String(report.contexts[key].user_agent), /Chrome\/150\.0\.7871\.2/);
    assert.doesNotMatch(String(report.contexts[key].user_agent), /HeadlessChrome/);
    assert.equal(report.contexts[key].locale, "zh-CN");
    assert.deepEqual(report.contexts[key].viewport, { width: 1280, height: 900 });
  }
  assert.match(report.ua.fallback, /Chrome\/151\.0\.0\.0/);
});

void test("公布站等待参数改用 30 秒 gate 轮询并移除每页条数配置", () => {
  const report = probe();
  assert.equal(report.wait.gate_poll_sec, 30);
  assert.equal(report.wait.yaml_gate_poll_sec, 30);
  assert.equal(report.wait.yaml_has_result_page_size, false);
  assert.equal(report.wait.keys.includes("result_page_size"), false);
  assert.equal(report.wait.env_gate_poll_sec, 45);
  assert.equal(report.fast_fetch.constant, false);
  assert.equal(report.fast_fetch.enabled, false);
});

void test("提交被拒时保留站点错误来源并用站点下拉框切每页条数", () => {
  const report = probe();
  assert.equal(report.advanced.rejected403.error?.reason, "waf_rejected");
  assert.equal(report.advanced.rejected403.error?.status, 403);
  assert.equal(report.advanced.failed503.error?.reason, "backend_error");
  assert.equal(report.advanced.failed503.error?.status, 503);
  assert.equal(report.nav.rejected403.error?.stage, "submit");
  assert.match(report.nav.rejected403.error?.detail ?? "", /HTTP 403/);
  assert.equal(report.nav.failed503.error?.stage, "submit");
  assert.match(report.nav.failed503.error?.detail ?? "", /HTTP 503/);
  assert.equal(report.page_size.ok.error, null);
  assert.deepEqual(report.page_size.ok.selected, [["#sizeSelect", "10"]]);
  assert.equal(report.page_size.rejected500.error?.stage, "page_size");
  assert.match(report.page_size.rejected500.error?.detail ?? "", /HTTP 500/);
});

void test("公布检索 CLI 的离线 --help 不被帮助文本里的百分号破坏", () => {
  const result = spawnSync(
    "uv",
    uvPythonArgs([
      path.join(SEARCH_TOOLS, "cnipa_search.py"),
      "--help",
    ]),
    {
      cwd: ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        PYTHONDONTWRITEBYTECODE: "1",
        PYTHONPATH: [SHARED, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter),
      },
    },
  );
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `--help failed:\n${result.stdout}\n${result.stderr}`);
  const rendered = (result.stdout ?? "").replace(/\s+/g, "");
  assert.match(rendered, /--publication-number/);
  assert.ok(rendered.includes("不要用?/%"), "摘要帮助文本应显示单个百分号");
  assert.ok(rendered.includes("不要两头加%"), "分类号帮助文本应显示单个百分号");
});
