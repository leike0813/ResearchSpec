import type { BoundaryOutputDescriptor, RouteRef } from "../routing/contracts.js";

const BINARY_OUTPUT_TYPES = new Set(["formatted_manuscript", "submission_package"]);

function title(value: string): string {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function boundaryDeliverables(
  routeRef: RouteRef,
  outputTypes: readonly string[],
): BoundaryOutputDescriptor[] {
  return outputTypes.map((type) => {
    const binary = BINARY_OUTPUT_TYPES.has(type);
    return {
      role: type,
      type,
      purpose: `${title(type)} produced by ${routeRef} for an explicit handoff or user delivery.`,
      structure: binary
        ? "A non-empty native document or archive appropriate to the declared type."
        : "A self-contained text deliverable that states its scope, evidence basis, limits, and unresolved issues where applicable.",
      validation_profile: binary ? "binary-file-artifact" : "text-artifact",
    };
  });
}
