import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const packageRoot = path.resolve("skills/capabilities");
const arProject = path.join(process.env.HOME ?? "", ".ar");

void test("packaged overseas search and reading distinguish evidence states and keep project-local outputs", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-overseas-fixture-"));
  try {
    const result = spawnSync("uv", ["run", "--project", arProject, "--locked", "--no-sync", "--", "python", "-", packageRoot, root], {
      input: `
import importlib
import json
import sys
from pathlib import Path
from unittest.mock import patch

packages, project = map(Path, sys.argv[1:3])
sys.path.insert(0, str(packages / "discovery-patent-search" / "tools"))
import gp_search
from google_patents.client import fetch_text
from google_patents.errors import GooglePatentsBadResponse, GooglePatentsBlocked
from google_patents.results import parse_search_json
from urllib.error import HTTPError

with patch("google_patents.client._urlopen", side_effect=HTTPError("https://patents.google.com/", 429, "limit", {}, None)) as request:
    try:
        fetch_text("https://patents.google.com/")
    except GooglePatentsBlocked:
        assert request.call_count == 1
    else:
        raise AssertionError("429 did not produce a blocked result")

try:
    parse_search_json({"results": {}}, num=10, page=0)
except GooglePatentsBadResponse:
    pass
else:
    raise AssertionError("A missing provider payload was treated as a valid search")

page = parse_search_json({"results": {"total_num_results": 0}}, num=10, page=0)
with patch.object(gp_search, "search", return_value=page) as search:
    assert gp_search.main(["-q", "gas sensor", "--project-root", str(project)]) == 0
    assert search.call_args.args[0].countries == ["US,EP,WO,JP,KR"]
reports = list((project / "outputs/patent-search").glob("*.json"))
assert len(reports) == 1
report = json.loads(reports[0].read_text())
assert report["complete"] and report["total_results"] == 0 and not report["hits"]
hit_page = parse_search_json({"results": {"total_num_results": 23, "cluster": [
    {"result": [{"patent": {"publication_number": "US1234567B2", "title": "Fixture sensor"}}]}
]}}, num=10, page=1)
assert hit_page.total_results == 23 and hit_page.hits[0].country == "US"
assert hit_page.hits[0].url.endswith("/US1234567B2/en")

sys.path.insert(0, str(packages / "analysis-patent-reading" / "tools"))
reader = importlib.import_module("extract.fetch_gp_fulltext")
from google_patents.detail import parse_detail_html
url = "https://patents.google.com/patent/US1234567B2/en"
detail = parse_detail_html(
    '<meta name="DC.title" content="Fixture patent"><meta name="DC.description" content="A public abstract">',
    pub="US1234567B2", url=url,
)
args = ["--pub", "US1234567B2", "--project-root", str(project), "--no-pdf"]
with patch.object(reader, "fetch_detail", return_value=detail) as retrieve:
    assert reader.main([*args, "--outdir", "researchspec/nodes"]) == 2
    assert reader.main(["--pub", "US/../1234567B2", "--project-root", str(project), "--outdir", "invalid", "--no-pdf"]) == 2
    retrieve.assert_not_called()
    assert reader.main([*args, "--outdir", "reading"]) == 0
    assert reader.main([*args, "--outdir", "reading"]) == 2
    assert retrieve.call_count == 1
manifest = json.loads((project / "reading/source_manifest.json").read_text())
assert manifest["source_path"] == url and manifest["jurisdiction"] == "US"
assert manifest["evidence_scope"] == "abstract_only" and manifest["claim_count"] == 0

detail = parse_detail_html(
    '<section itemprop="claims"><div num="00001" class="claim">A sensor comprising a probe.</div></section>'
    '<section itemprop="description"><div num="0003" class="description-paragraph">The sensor has a probe.</div></section>',
    pub="US1234567B2", url=url,
)
with patch.object(reader, "fetch_detail", return_value=detail):
    assert reader.main(["--pub", "US1234567", "--project-root", str(project), "--outdir", "full-text", "--no-pdf"]) == 0
manifest = json.loads((project / "full-text/source_manifest.json").read_text())
assert manifest["evidence_scope"] == "full_text" and manifest["claim_count"] == 1
paragraphs = json.loads((project / "full-text/description_paragraphs.json").read_text())
assert paragraphs["source_url"] == url and paragraphs["paragraphs"]["0003"] == "The sensor has a probe."
`,
      encoding: "utf8",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
