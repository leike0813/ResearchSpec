import { readFile } from "node:fs/promises";
import path from "node:path";

export const PRODUCTION_VENDOR_IDS = [
  "education-agent-skills",
  "finrobot",
  "histagent",
  "materials-science-skills-for-llm",
  "scientific-agent-skills",
  "tooluniverse",
] as const;

export async function loadProductionDomainCounts(repoRoot: string): Promise<{ internal: number; available: number }> {
  const catalog = JSON.parse(await readFile(path.join(repoRoot, "src/plugins/domain-catalog.json"), "utf8")) as { domains: Array<{ skills: string[] }> };
  return { internal: catalog.domains.length, available: catalog.domains.filter((domain) => domain.skills.length > 0).length };
}

export function productionVendorInventoryErrors(actualIds: Iterable<string>): string[] {
  const actual = [...actualIds].sort(compareText);
  const expected = [...PRODUCTION_VENDOR_IDS];
  if (JSON.stringify(actual) === JSON.stringify(expected)) return [];
  return [`Expected production vendors ${expected.join(", ")}; found ${actual.join(", ") || "none"}.`];
}

function compareText(left: string, right: string): number { return left.localeCompare(right); }
