"use strict";

const fs = require("node:fs");
const path = require("node:path");

const GUARD_PATH = path.join(__dirname, "guard.md");
const STDIN_LIMIT_BYTES = 64 * 1024;
const STDIN_TIMEOUT_MS = 1000;

function guard() {
  try {
    return fs.readFileSync(GUARD_PATH, "utf8");
  } catch {
    return "";
  }
}

function emptyOutput(protocol) {
  if (protocol === "cline") return JSON.stringify({ cancel: false });
  if (protocol === "cursor") return JSON.stringify({ continue: true });
  if (protocol === "plain") return "";
  return "{}";
}

function output(protocol, event, input) {
  const text = guard();
  if (protocol === "copilot-transform") {
    const transformed = input !== null && typeof input === "object" && typeof input.transformedPrompt === "string" ? input.transformedPrompt : null;
    if (transformed === null || text === "") return "{}";
    return JSON.stringify({ modifiedTransformedPrompt: transformed + "\n\n" + text });
  }
  if (text === "") return emptyOutput(protocol);
  switch (protocol) {
    case "context":
      return JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } });
    case "gemini":
      return JSON.stringify({ hookSpecificOutput: { hookEventName: "BeforeAgent", additionalContext: text } });
    case "cursor":
      return JSON.stringify({ continue: true, additional_context: text });
    case "cline":
      return JSON.stringify({ cancel: false, contextModification: text });
    case "plain":
      return text;
    case "junie":
      return JSON.stringify({ additionalContext: text });
    case "antigravity":
      return JSON.stringify({ injectSteps: [{ ephemeralMessage: text }] });
    case "copilot-subagent":
      return JSON.stringify({ additionalContext: text });
    default:
      return "{}";
  }
}

function writeOutput(text) {
  try {
    process.stdout.write(text);
  } catch {
    // The host closed the pipe; there is nothing useful left to do.
  }
}

function readStdin(callback) {
  let finished = false;
  let bytes = 0;
  const chunks = [];
  const finish = (payload) => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    process.stdin.destroy();
    callback(payload);
  };
  const watchdog = setTimeout(() => finish(null), STDIN_TIMEOUT_MS);
  watchdog.unref();
  process.stdin.on("data", (chunk) => {
    bytes += chunk.length;
    if (bytes > STDIN_LIMIT_BYTES) {
      finish(null);
      return;
    }
    chunks.push(chunk);
  });
  process.stdin.on("end", () => finish(Buffer.concat(chunks).toString("utf8")));
  process.stdin.on("error", () => finish(null));
}

function run(protocol, event) {
  if (protocol === "copilot-transform") {
    readStdin((payload) => {
      let input = null;
      if (typeof payload === "string") {
        try {
          input = JSON.parse(payload.replace(/^\uFEFF/, ""));
        } catch {
          input = null;
        }
      }
      writeOutput(output(protocol, event, input));
    });
    return;
  }
  writeOutput(output(protocol, event, null));
}

if (require.main === module) {
  run(process.argv[2], process.argv[3]);
}

module.exports = { guard, output, run };
