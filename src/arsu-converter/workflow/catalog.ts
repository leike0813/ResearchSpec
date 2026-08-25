import { ARSU_ROUTING_CATALOG } from "../routing/catalog.js";
import { validateRoutingCatalogReferences } from "../routing/contracts.js";

export function validateArsuWorkflowCatalog(): string[] {
  return validateRoutingCatalogReferences(ARSU_ROUTING_CATALOG).map(
    (issue) => `${issue.code}:${issue.message}`,
  );
}

const catalogIssues = validateArsuWorkflowCatalog();
if (catalogIssues.length > 0) {
  throw new Error(`Invalid ARSU workflow catalog:\n${catalogIssues.join("\n")}`);
}
