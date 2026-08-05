import fs from "node:fs/promises";
import process from "node:process";

const input = process.argv[2];
if (!input) {
  process.stderr.write(JSON.stringify({ ok: false, code: "input_required", message: "Pass a manuscript path." }) + "\n");
  process.exitCode = 2;
} else {
  try {
    const text = await fs.readFile(input, "utf8");
    const format = input.endsWith(".qmd") ? "quarto" : /\.(tex|latex)$/i.test(input) ? "latex" : "markdown";
    const sentences = text.match(/[^.!?\n]+(?:[.!?]+|$)/g)?.map((value, index) => ({ index, text: value.trim(), words: value.trim().match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g)?.length ?? 0 })) ?? [];
    process.stdout.write(JSON.stringify({ ok: true, format, source_hash: await sha256(text), sentence_count: sentences.length, sentences }) + "\n");
  } catch (error) {
    process.stdout.write(JSON.stringify({ ok: false, code: "read_failed", message: error instanceof Error ? error.message : String(error) }) + "\n");
    process.exitCode = 1;
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

