import { parseArgs } from "node:util";

import { startReviewSession } from "./session.js";

try {
  const { values } = parseArgs({ options: {
    "project-root": { type: "string" }, workspace: { type: "string" }, asset: { type: "string" }, wait: { type: "boolean" },
  } });
  if (!values["project-root"] || !values.workspace || !values.asset) throw new Error("Required: --project-root ROOT --workspace WORKSPACE_JSON --asset HTML [--wait]");
  const session = await startReviewSession({ projectRoot: values["project-root"], workspacePath: values.workspace, assetPath: values.asset });
  process.stdout.write(JSON.stringify({ event: "review_ready", url: session.url, result_path: session.resultPath, history_dir: session.historyDir }) + "\n");
  const controller = new AbortController();
  const stop = () => { controller.abort(); void session.close(); };
  process.once("SIGINT", stop); process.once("SIGTERM", stop);
  if (values.wait) {
    let after: string | undefined;
    while (!controller.signal.aborted) {
      try {
        const receipt = await session.waitForResult({ after, signal: controller.signal });
        after = receipt.submission_id;
        process.stdout.write(JSON.stringify({ event: "review_saved", ...receipt }) + "\n");
      } catch (error) {
        if (controller.signal.aborted) break;
        process.stderr.write(JSON.stringify({ event: "review_wait_ended", error: error instanceof Error ? error.message : String(error) }) + "\n");
      }
    }
  }
} catch (error) {
  process.stderr.write(JSON.stringify({ event: "review_error", error: error instanceof Error ? error.message : String(error) }) + "\n");
  process.exitCode = 1;
}
