import fs from "node:fs/promises";
import process from "node:process";

const input = process.argv[2];
if (!input) {
  process.stdout.write(JSON.stringify({ ok: false, code: "input_required", message: "Pass a manuscript path." }) + "\n");
  process.exitCode = 2;
} else {
  const text = await fs.readFile(input, "utf8");
  const sentences = text.match(/[^.!?\n]+(?:[.!?]+|$)/g)?.map((value, index) => ({ index, words: value.trim().split(/\s+/).filter(Boolean).length })) ?? [];
  process.stdout.write(JSON.stringify({ ok: true, mode: "review", sentence_count: sentences.length, long_sentences: sentences.filter((item) => item.words > 45).map((item) => item.index) }) + "\n");
}

