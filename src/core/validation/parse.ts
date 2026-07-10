import { parse as parseYamlDocument } from "yaml";

import type { ParseResult } from "./types.js";

export function parseJson(text: string, filePath: string): ParseResult<unknown> {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (error) {
    return invalid("invalid_json", filePath, error);
  }
}

export function parseJsonLines(text: string, filePath: string): ParseResult<unknown[]> {
  const values: unknown[] = [];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    try {
      values.push(JSON.parse(line) as unknown);
    } catch (error) {
      return invalid("invalid_jsonl", filePath, error, index + 1);
    }
  }
  return { ok: true, value: values };
}

export function parseYaml(text: string, filePath: string): ParseResult<unknown> {
  try {
    return { ok: true, value: parseYamlDocument(text) as unknown };
  } catch (error) {
    return invalid("invalid_yaml", filePath, error);
  }
}

export const parseSimpleYaml = parseYaml;

function invalid(code: string, filePath: string, error: unknown, line?: number): ParseResult<never> {
  const detail = error instanceof Error ? error.message : String(error);
  return {
    ok: false,
    diagnostic: {
      severity: "error",
      code,
      message: line ? `Parse failed on line ${String(line)}: ${detail}` : `Parse failed: ${detail}`,
      path: filePath,
      blocking: true,
    },
  };
}
