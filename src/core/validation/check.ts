import path from "node:path";

import {
  JSON_FILES,
  JSONL_FILES,
  REQUIRED_DIRECTORIES,
  REQUIRED_FILES,
  YAML_FILES,
} from "../workspace/layout.js";
import { fileExists, isDirectory, readOptionalText } from "../../utils/fs.js";
import { parseJson, parseJsonLines, parseSimpleYaml } from "./parse.js";

export interface Diagnostic {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
  blocking: boolean;
}

export interface CheckResult {
  ok: boolean;
  workspace: string;
  diagnostics: Diagnostic[];
}

export async function runWorkspaceChecks(workspace: string): Promise<CheckResult> {
  const diagnostics: Diagnostic[] = [];

  for (const relativePath of REQUIRED_DIRECTORIES) {
    const absolutePath = path.join(workspace, relativePath);
    if (!(await isDirectory(absolutePath))) {
      diagnostics.push(missing("required_directory_missing", absolutePath, "Required directory is missing."));
    }
  }

  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(workspace, relativePath);
    if (!(await fileExists(absolutePath))) {
      diagnostics.push(missing("required_file_missing", absolutePath, "Required file is missing."));
    }
  }

  for (const relativePath of YAML_FILES) {
    const absolutePath = path.join(workspace, relativePath);
    const text = await readOptionalText(absolutePath);
    if (text !== undefined) {
      const parsed = parseSimpleYaml(text, absolutePath);
      if (!parsed.ok) diagnostics.push(parsed.diagnostic);
    }
  }

  for (const relativePath of JSON_FILES) {
    const absolutePath = path.join(workspace, relativePath);
    const text = await readOptionalText(absolutePath);
    if (text !== undefined) {
      const parsed = parseJson(text, absolutePath);
      if (!parsed.ok) diagnostics.push(parsed.diagnostic);
    }
  }

  for (const relativePath of JSONL_FILES) {
    const absolutePath = path.join(workspace, relativePath);
    const text = await readOptionalText(absolutePath);
    if (text !== undefined) {
      const parsed = parseJsonLines(text, absolutePath);
      if (!parsed.ok) diagnostics.push(parsed.diagnostic);
    }
  }

  return {
    ok: diagnostics.every((diagnostic) => !diagnostic.blocking),
    workspace,
    diagnostics,
  };
}

function missing(code: string, filePath: string, message: string): Diagnostic {
  return {
    severity: "error",
    code,
    message,
    path: filePath,
    blocking: true,
  };
}
