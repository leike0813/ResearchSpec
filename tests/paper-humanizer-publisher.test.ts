import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const hookDir = path.join(root, "hooks", "paper-humanizer");
const publisherPath = path.join(hookDir, "inject.cjs");
const guardPath = path.join(hookDir, "guard.md");

interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface ProtocolCase {
  name: string;
  protocol: string;
  event: string;
  verify: (stdout: string, guardText: string) => void;
  empty: string;
}

function parseObject(stdout: string): Record<string, unknown> {
  return JSON.parse(stdout) as Record<string, unknown>;
}

const PROTOCOL_CASES: readonly ProtocolCase[] = [
  {
    name: "context",
    protocol: "context",
    event: "UserPromptSubmit",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), {
        hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: guardText },
      });
    },
    empty: "{}",
  },
  {
    name: "gemini",
    protocol: "gemini",
    event: "BeforeAgent",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), {
        hookSpecificOutput: { hookEventName: "BeforeAgent", additionalContext: guardText },
      });
    },
    empty: "{}",
  },
  {
    name: "cursor",
    protocol: "cursor",
    event: "beforeSubmitPrompt",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), { continue: true, additional_context: guardText });
    },
    empty: JSON.stringify({ continue: true }),
  },
  {
    name: "cline",
    protocol: "cline",
    event: "UserPromptSubmit",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), { cancel: false, contextModification: guardText });
    },
    empty: JSON.stringify({ cancel: false }),
  },
  {
    name: "plain",
    protocol: "plain",
    event: "UserPromptSubmit",
    verify: (stdout, guardText) => {
      assert.equal(stdout, guardText);
    },
    empty: "",
  },
  {
    name: "junie",
    protocol: "junie",
    event: "UserPromptSubmit",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), { additionalContext: guardText });
    },
    empty: "{}",
  },
  {
    name: "antigravity",
    protocol: "antigravity",
    event: "PreInvocation",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), { injectSteps: [{ ephemeralMessage: guardText }] });
    },
    empty: "{}",
  },
  {
    name: "copilot-subagent",
    protocol: "copilot-subagent",
    event: "subagentStart",
    verify: (stdout, guardText) => {
      assert.deepEqual(parseObject(stdout), { additionalContext: guardText });
    },
    empty: "{}",
  },
];

function runChild(args: string[], options: { stdin?: string; partial?: string } = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: ["pipe", "pipe", "pipe"] });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    const killTimer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("child did not exit"));
    }, 5000);
    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(killTimer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(killTimer);
      resolve({ status: code, stdout: Buffer.concat(stdoutChunks).toString("utf8"), stderr: Buffer.concat(stderrChunks).toString("utf8") });
    });
    child.stdin?.on("error", () => {
      // The child may close its stdin before the payload is fully written.
    });
    if (options.partial === undefined) child.stdin?.end(options.stdin ?? "");
    else child.stdin?.write(options.partial);
  });
}

function runPublisher(args: string[], options: { stdin?: string; partial?: string } = {}): Promise<RunResult> {
  return runChild([publisherPath, ...args], options);
}

void test("publisher injects the complete guard on repeated prompts for every protocol", async () => {
  const guardText = await readFile(guardPath, "utf8");
  assert.ok(guardText.length > 0);
  for (const testCase of PROTOCOL_CASES) {
    for (const round of ["first", "second"]) {
      const result = await runPublisher([testCase.protocol, testCase.event], { stdin: "{}" });
      assert.equal(result.status, 0, testCase.name + " " + round);
      assert.equal(result.stderr, "", testCase.name + " " + round);
      testCase.verify(result.stdout, guardText);
    }
  }
});

void test("copilot-transform preserves the original prompt including Unicode and BOM", async () => {
  const guardText = await readFile(guardPath, "utf8");
  const prompt = "第一段：保留全部信息 🎐 e\u0301 café \uFEFF 零宽字符\n第二段：引用 [1] 与 ID-42。";
  const payload = "\uFEFF" + JSON.stringify({ transformedPrompt: prompt, sessionId: "ignored" });
  for (const round of ["first", "second"]) {
    const result = await runPublisher(["copilot-transform", "userPromptTransformed"], { stdin: payload });
    assert.equal(result.status, 0, round);
    assert.deepEqual(parseObject(result.stdout), { modifiedTransformedPrompt: prompt + "\n\n" + guardText });
  }
});

void test("copilot-transform returns an empty success response for invalid input", async () => {
  const payloads = ["", "\uFEFF", "{ not json", JSON.stringify({ transformedPrompt: 42 }), JSON.stringify({ other: true })];
  for (const payload of payloads) {
    const result = await runPublisher(["copilot-transform", "userPromptTransformed"], { stdin: payload });
    assert.equal(result.status, 0, payload);
    assert.equal(result.stdout, "{}", payload);
  }
});

void test("copilot-transform treats oversized stdin as an empty success response", async () => {
  const payload = JSON.stringify({ transformedPrompt: "a".repeat(70 * 1024) });
  const result = await runPublisher(["copilot-transform", "userPromptTransformed"], { stdin: payload });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "{}");
});

void test("copilot-transform treats stalled stdin as an empty success response", async () => {
  const result = await runPublisher(["copilot-transform", "userPromptTransformed"], { partial: '{"transformedPrompt":"still typing' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "{}");
});

void test("a missing guard yields the native empty response for every protocol", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "researchspec-paper-humanizer-"));
  try {
    const copyPath = path.join(temp, "inject.cjs");
    await cp(publisherPath, copyPath);
    for (const testCase of PROTOCOL_CASES) {
      const result = await runChild([copyPath, testCase.protocol, testCase.event], { stdin: "{}" });
      assert.equal(result.status, 0, testCase.name);
      assert.equal(result.stdout, testCase.empty, testCase.name);
    }
    const transform = await runChild([copyPath, "copilot-transform", "userPromptTransformed"], { stdin: JSON.stringify({ transformedPrompt: "hello" }) });
    assert.equal(transform.status, 0);
    assert.equal(transform.stdout, "{}");
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

void test("run is the CLI entry and works without require.main", async () => {
  const guardText = await readFile(guardPath, "utf8");
  const encoded = Buffer.from(publisherPath, "utf8").toString("base64");
  const script = "require(Buffer.from('" + encoded + "','base64').toString()).run('context','UserPromptSubmit')";
  const result = await runChild(["-e", script], { stdin: "{}" });
  assert.equal(result.status, 0);
  assert.deepEqual(parseObject(result.stdout), {
    hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: guardText },
  });
});

void test("publisher exports guard, output and run", () => {
  const loadPublisher = createRequire(import.meta.url);
  const publisher = loadPublisher(publisherPath) as {
    guard: () => string;
    output: (protocol: string, event: string, input: unknown) => string;
    run: (protocol: string, event: string) => void;
  };
  assert.equal(typeof publisher.guard, "function");
  assert.equal(typeof publisher.output, "function");
  assert.equal(typeof publisher.run, "function");
});
