export const PRODUCTION_VENDOR_IDS = [
  "education-agent-skills",
  "finrobot",
  "histagent",
  "materials-science-skills-for-llm",
  "scientific-agent-skills",
  "tooluniverse",
] as const;

export const PRODUCTION_DOMAIN_COUNTS = {
  internal: 218,
  available: 56,
} as const;

export function productionVendorInventoryErrors(actualIds: Iterable<string>): string[] {
  const actual = [...actualIds].sort(compareText);
  const expected = [...PRODUCTION_VENDOR_IDS];
  if (JSON.stringify(actual) === JSON.stringify(expected)) return [];
  return [`Expected production vendors ${expected.join(", ")}; found ${actual.join(", ") || "none"}.`];
}

function compareText(left: string, right: string): number { return left.localeCompare(right); }
