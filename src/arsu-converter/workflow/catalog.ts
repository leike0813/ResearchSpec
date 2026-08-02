import { ARSU_ROUTING_CATALOG } from "../routing/catalog.js";
import { validateRoutingCatalogReferences } from "../routing/contracts.js";
import {
  ACADEMIC_PIPELINE_PROFILE,
  validateAcademicPipelineProfileRouting,
} from "./academic-pipeline.js";

export function validateArsuWorkflowCatalog(): string[] {
  return [
    ...validateRoutingCatalogReferences(ARSU_ROUTING_CATALOG).map(
      (issue) => `${issue.code}:${issue.message}`,
    ),
    ...validateAcademicPipelineProfileRouting(
      ACADEMIC_PIPELINE_PROFILE,
      ARSU_ROUTING_CATALOG,
    ),
  ];
}

const catalogIssues = validateArsuWorkflowCatalog();
if (catalogIssues.length > 0) {
  throw new Error(`Invalid ARSU workflow catalog:\n${catalogIssues.join("\n")}`);
}
