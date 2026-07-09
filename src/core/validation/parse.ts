import type { Diagnostic } from "./check.js";

type ParseResult<T> = { ok: true; value: T } | { ok: false; diagnostic: Diagnostic };

export function parseJson(text: string, filePath: string): ParseResult<unknown> {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (error) {
    return invalid("invalid_json", filePath, error);
  }
}

export function parseJsonLines(text: string, filePath: string): ParseResult<unknown[]> {
  const values: unknown[] = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    try {
      values.push(JSON.parse(line) as unknown);
    } catch (error) {
      return invalid("invalid_jsonl", filePath, error, index + 1);
    }
  }
  return { ok: true, value: values };
}

export function parseSimpleYaml(text: string, filePath: string): ParseResult<Record<string, unknown>> {
  try {
    const result: Record<string, unknown> = {};
    const stack: Array<{ indent: number; value: Record<string, unknown> | unknown[] }> = [
      { indent: -1, value: result },
    ];

    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index];
      if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
      if (rawLine.includes("\t")) throw new Error(`line ${String(index + 1)}: tabs are not allowed`);

      const indent = rawLine.match(/^ */)?.[0].length ?? 0;
      const line = rawLine.trim();
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].value;

      if (line.startsWith("- ")) {
        if (!Array.isArray(parent)) throw new Error(`line ${String(index + 1)}: list item has no list parent`);
        parent.push(parseScalar(line.slice(2)));
        continue;
      }

      const separator = line.indexOf(":");
      if (separator <= 0) throw new Error(`line ${String(index + 1)}: expected key: value`);

      const key = line.slice(0, separator).trim();
      const rawValue = line.slice(separator + 1).trim();
      if (!key) throw new Error(`line ${String(index + 1)}: empty key`);
      if (Array.isArray(parent)) throw new Error(`line ${String(index + 1)}: mapping key inside list is unsupported`);

      if (rawValue === "") {
        const child: Record<string, unknown> = {};
        parent[key] = child;
        stack.push({ indent, value: child });
      } else {
        parent[key] = parseScalar(rawValue);
      }
    }

    return { ok: true, value: result };
  } catch (error) {
    return invalid("invalid_yaml", filePath, error);
  }
}

function parseScalar(value: string): unknown {
  if (value === "[]") return [];
  if (value === "{}") return {};
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value.startsWith("[") || value.startsWith("{") || value.endsWith("]") || value.endsWith("}")) {
    throw new Error(`unsupported or malformed inline collection: ${value}`);
  }
  return value;
}

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
