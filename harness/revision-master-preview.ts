import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { parse } from "yaml";

import { prepareRevisionMasterReview, readRevisionMasterProjection, type RevisionMasterContext } from "../src/review-workspace.js";

import { buildRevisionMasterPreviewCase, PREVIEW_ACTIVE_ATOM, PREVIEW_FORMAL_STATUS, PREVIEW_TITLE, type RevisionMasterPreviewMode } from "./revision-master-preview-data.js";

const exec = promisify(execFile);

export interface RevisionMasterPreviewCaseRef {
  id: string;
  label: string;
  stage: RevisionMasterContext["stage"];
  mode: RevisionMasterPreviewMode;
}

/** Four stage handoffs of the approved prototype case, prepared through the production path. */
export const REVISION_MASTER_PREVIEW_CASES: ReadonlyArray<RevisionMasterPreviewCaseRef> = [
  { id: "revision-master-coverage", label: "修订工作台 · 意见覆盖", stage: "coverage", mode: "in_progress" },
  { id: "revision-master-board", label: "修订工作台 · 整体工作板", stage: "board", mode: "in_progress" },
  { id: "revision-master-strategy", label: "修订工作台 · 当前策略", stage: "strategy", mode: "in_progress" },
  { id: "revision-master-round", label: "修订工作台 · 本轮改稿与回复", stage: "round", mode: "complete" },
];

const SEED_SCRIPT = [
  "import json, sqlite3, sys",
  "data = json.load(open(sys.argv[1], encoding='utf8'))",
  "connection = sqlite3.connect(sys.argv[2])",
  "[connection.execute(statement) for statement in data['ddl']]",
  "[connection.execute('DELETE FROM ' + table) for table in reversed(list(data['rows']))]",
  "[connection.execute('INSERT INTO ' + table + ' (' + ','.join(row) + ') VALUES (' + ','.join('?' for _ in row) + ')', list(row.values())) for table, rows in data['rows'].items() for row in rows]",
  "connection.commit()",
  "connection.close()",
].join("\n");

/**
 * Prepare the four revision-master stage pages from the approved case data.
 *
 * A real `revision-master.db` is seeded from the production schema, then every
 * page is produced through the same projection and HTML prepare path used in
 * production: the read-only workbench `project` command plus
 * `prepareRevisionMasterReview`. Nothing here fabricates a snapshot.
 */
export async function prepareRevisionMasterPreviews(repoRoot: string, outputRoot: string): Promise<string[]> {
  const taskRoot = path.join(outputRoot, "revision-master-task");
  await mkdir(taskRoot, { recursive: true });
  const cases = { in_progress: buildRevisionMasterPreviewCase("in_progress"), complete: buildRevisionMasterPreviewCase("complete") };
  for (const [relative, content] of Object.entries(cases.in_progress.files)) {
    const target = path.join(taskRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  const source = await readFile(path.join(repoRoot, "authoring/revision-master/assets/schema/revision-master-schema.yaml"), "utf8");
  const schema = parse(source.slice(source.indexOf("-->") + 3)) as { tables: Array<{ sql: string }> };
  const ddl = schema.tables.map((table) => table.sql);
  const python = { command: "uv", args: ["run", "--project", path.join(os.homedir(), ".ar"), "--locked", "--", "python"] };
  const seedDatabase = async (mode: RevisionMasterPreviewMode): Promise<string> => {
    const setup = path.join(taskRoot, `seed-${mode}.json`);
    const dbPath = path.join(taskRoot, mode === "complete" ? "revision-master-round.db" : "revision-master.db");
    await writeFile(setup, JSON.stringify({ ddl, rows: cases[mode].rows }));
    await exec(python.command, [...python.args, "-c", SEED_SCRIPT, setup, dbPath], { env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    return dbPath;
  };
  const databases: Record<RevisionMasterPreviewMode, string> = {
    in_progress: await seedDatabase("in_progress"),
    complete: await seedDatabase("complete"),
  };
  const outputs: string[] = [];
  for (const item of REVISION_MASTER_PREVIEW_CASES) {
    const data = cases[item.mode];
    const execution = item.stage === "strategy" || item.stage === "round";
    // Round 2 is the preview's revision round; strategy runs in round 1.
    const roundId = item.stage === "round" ? "2" : execution ? "1" : null;
    const node = item.stage === "coverage" ? "comment-atomization" : item.stage === "board" ? "workboard" : "round";
    const context: RevisionMasterContext = {
      task_id: "preview-task",
      selector: `node:preview/${node}${roundId ? `@${roundId}` : ""}`,
      run_id: "preview",
      node_id: node,
      round_id: roundId,
      stage: item.stage,
      formal_status: PREVIEW_FORMAL_STATUS,
      active_comment_id: PREVIEW_ACTIVE_ATOM,
    };
    const contextPath = path.join(taskRoot, `${item.stage}-context.json`);
    await writeFile(contextPath, JSON.stringify(context));
    const result = await prepareRevisionMasterReview({
      projectRoot: taskRoot,
      workRoot: path.join(taskRoot, "reviews"),
      context,
      title: PREVIEW_TITLE,
      readProjection: () => readRevisionMasterProjection({
        toolPath: path.join(repoRoot, "authoring/revision-master/workbench/review_workbench.py"),
        dbPath: databases[item.mode],
        projectRoot: taskRoot,
        contextPath,
        python,
      }),
      documents: data.documents,
      locations: data.locations,
      sourcePaths: data.sourcePaths,
      templatePath: path.join(repoRoot, "review-workspace/revision-master.html"),
      unresolved: data.unresolved,
      nextStep: "核对本轮候选与逐条回复；正式 Gate/Decision 回到对话中确认。",
    });
    await writeFile(path.join(outputRoot, `${item.id}.html`), await readFile(result.htmlPath));
    outputs.push(result.htmlPath);
  }
  return outputs;
}
