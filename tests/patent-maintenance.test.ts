import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const moduleUrl = pathToFileURL(path.join(ROOT, "scripts/patent-disclosure-skill-maintenance.mjs")).href;

function run(root: string, action: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", `
    import {collectState,baseline,checkBaseline} from ${JSON.stringify(moduleUrl)};
    const root = process.argv[1];
    ${action}
  `, root], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

void test("patent baseline rejects unfinished review and detects reviewed tool drift", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-maintenance-"));
  try {
    const catalog = JSON.parse(await readFile("audits/patent-disclosure-skill/catalog.json", "utf8")) as {
      upstream: { path: string }; authoring_root: string; generated_root: string; profile_root: string;
      profile_ids: string[]; source_audit: string; anchor_id: string;
    };
    // Keep one package/profile in this maintenance fixture; all source bytes and
    // maintenance files are real. The test observes freezing and drift rejection.
    const audit = JSON.parse(await readFile(catalog.source_audit, "utf8")) as { capabilities: Array<{ capability_id: string }> };
    const selected = audit.capabilities[0];
    assert.ok(selected);
    const profile = catalog.profile_ids[0];
    assert.ok(profile);
    const paths = [
      "scripts/patent-source-audit.mjs", "scripts/prepare-patent-authoring.mjs",
      "scripts/patent-disclosure-skill-maintenance.mjs", "src/arsu-converter/authoring/author.ts",
      "src/vendor-converters/patent-disclosure-skill", "src/arsu-converter/workflow/graph-profiles/patent.ts",
      ".agents/skills/patent-disclosure-skill-maintenance/SKILL.md", catalog.authoring_root,
      "docs/user/patent-workflows.md", "docs/maintainer/patent-disclosure-skill.md", "NOTICE", "LICENSE",
      `${catalog.generated_root}/${selected.capability_id}`, `${catalog.generated_root}/registry.json`,
      `${catalog.profile_root}/${profile}.yaml`, `${catalog.profile_root}/registry.json`,
    ];
    for (const relative of paths) {
      await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await cp(path.join(ROOT, relative), path.join(root, relative), { recursive: true });
    }
    await mkdir(path.dirname(path.join(root, catalog.upstream.path)), { recursive: true });
    execFileSync("git", ["clone", "--quiet", "--shared", path.join(ROOT, catalog.upstream.path), path.join(root, catalog.upstream.path)], { stdio: "pipe" });
    await mkdir(path.join(root, "audits/patent-disclosure-skill"), { recursive: true });
    await writeFile(path.join(root, "audits/patent-disclosure-skill/catalog.json"), JSON.stringify({ ...catalog, profile_ids: [profile] }));
    await writeFile(path.join(root, catalog.source_audit), JSON.stringify({ ...audit, capabilities: [selected] }));
    const anchor = path.join(root, "audits/patent-disclosure-skill", catalog.anchor_id);
    await mkdir(anchor, { recursive: true });
    await writeFile(path.join(anchor, "05-semantic-review.md"), "# Fixture semantic review\n\nCompleted assessment of fixture outputs.\n");
    await writeFile(path.join(anchor, "review-decision.json"), JSON.stringify({ status: "pending" }));
    assert.throws(() => run(root, "baseline(root);"), /unfinished/);

    const state = JSON.parse(run(root, "console.log(JSON.stringify(collectState(root)));")) as { businesses: string[] };
    await writeFile(path.join(anchor, "review-decision.json"), JSON.stringify({ status: "approved", reviewer: "fixture reviewer",
      businesses: state.businesses.map((business) => ({ business })), findings: [], reviewed_state: state }));
    assert.doesNotThrow(() => run(root, "baseline(root); checkBaseline(root);"));
    // A changed authored helper must invalidate the semantic review even if the
    // source commit and generated packages have not changed yet.
    const helper = path.join(root, catalog.authoring_root, "runtime/shared/patent_files.py");
    await writeFile(helper, `${await readFile(helper, "utf8")}\n# changed fixture behavior\n`);
    assert.throws(() => run(root, "checkBaseline(root);"), /does not bind|drift/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
