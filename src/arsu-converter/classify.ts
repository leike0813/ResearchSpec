import { DEFAULT_SKILL_GROUPS, OPTIONAL_SKILL_GROUPS, SKILL_RUNTIME_DIRS } from "./config.js";

export interface Classification {
  category: "runtime_core" | "shared" | "excluded" | "needs_review";
  reason: string;
  skill_group?: string;
  bucket?: "entry" | "agents" | "references" | "templates" | "examples" | "scripts";
}

const SKILL_GROUPS = [...DEFAULT_SKILL_GROUPS, ...OPTIONAL_SKILL_GROUPS] as readonly string[];

const ADAPTER_DIRS = new Set([
  ".claude",
  ".claude-plugin",
  ".codex",
  ".codex-plugin",
  "commands",
  "hooks",
]);

const DEV_DIRS = new Set([".github", "evals", "tests", "tools"]);
const HISTORICAL_DIRS = new Set(["audits"]);

const DEV_ROOT_FILES = new Set([
  ".gitattributes",
  ".gitleaks.toml",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "requirements-dev.txt",
]);

const HISTORICAL_ROOT_FILES = new Set(["CHANGELOG.md"]);
const HISTORICAL_DOC_PREFIXES = ["docs/migration/", "docs/design/"] as const;

export function classifyPath(filePath: string): Classification {
  const parts = filePath.split("/");
  const first = parts[0] ?? "";
  const group = skillGroupFor(parts);

  if (group) {
    if (parts.length === 2 && parts[1] === "SKILL.md") {
      return { category: "runtime_core", reason: "skill_group_entry", skill_group: group, bucket: "entry" };
    }
    if (parts.length >= 3 && isRuntimeDirectory(parts[1])) {
      return {
        category: "runtime_core",
        reason: "skill_group_runtime_dir",
        skill_group: group,
        bucket: parts[1],
      };
    }
  }

  if (first === "shared") return { category: "shared", reason: "shared_resource_candidate" };
  if (first === "agents") return { category: "shared", reason: "shared_agent_prompt_candidate" };

  if (
    HISTORICAL_ROOT_FILES.has(filePath) ||
    HISTORICAL_DIRS.has(first) ||
    HISTORICAL_DOC_PREFIXES.some((prefix) => filePath.startsWith(prefix))
  ) {
    return { category: "excluded", reason: "historical_traceability" };
  }

  if (ADAPTER_DIRS.has(first) || filePath === ".command-invariants.toml") {
    return { category: "excluded", reason: "adapter_only" };
  }

  if (DEV_DIRS.has(first) || DEV_ROOT_FILES.has(filePath)) {
    return { category: "excluded", reason: "dev_only" };
  }

  if (
    first === "docs" ||
    filePath.startsWith("README") ||
    ["LICENSE", "NOTICE.md", "CITATION.cff"].includes(filePath)
  ) {
    return { category: "excluded", reason: "dev_documentation" };
  }

  return { category: "needs_review", reason: "unknown" };
}

function skillGroupFor(parts: string[]): string | undefined {
  const first = parts[0];
  return first && SKILL_GROUPS.includes(first) ? first : undefined;
}

function isRuntimeDirectory(value: string | undefined): value is Classification["bucket"] {
  return value !== undefined && SKILL_RUNTIME_DIRS.includes(value as never);
}
