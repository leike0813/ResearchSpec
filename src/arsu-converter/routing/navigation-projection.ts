import { ARSU_ROUTING_CATALOG } from "./catalog.js";
import type { ArsuRouteDefinition } from "./contracts.js";
import { renderArsuRouteSummary } from "./projection.js";
import { REVIEW_RESPONSE_ROUTE } from "./review-response.js";

export function renderNavigateRoutingProjection(): string {
  const sections = ARSU_ROUTING_CATALOG.skills.map((skill) => [
    `### ${skill.title} (\`${skill.skill_id}\`)`,
    "",
    skill.summary,
    `Skill intents: ${skill.intents.join("; ")}.`,
    `Near misses: ${skill.near_misses.map((item) => `${item.intent} -> \`${item.route_ref}\` (${item.reason})`).join("; ")}.`,
    "",
    "| Route | Intent | Boundary outputs | Prerequisites | Formal Gates | Risk / cost | Start confirmation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...skill.routes.map(renderRouteRow),
  ].join("\n"));

  return [
    "## Catalog-Derived Route Reference",
    "",
    "These route semantics are projected from the canonical ARSU routing catalog. They describe route meaning, not current workspace availability. Pair them with `researchspec status --json` and only offer routes whose `route_ref` is present in the CLI subflow frontier.",
    "",
    ...sections,
    [
      "### Review Response (`review-response`)",
      "",
      "Standalone post-submission revision response coordination. This route is not an academic-pipeline frontier node.",
      "Near miss: a real reviewer/editor response request -> `review-response:full`; use `academic-paper:revision-coach` for strategy-only coaching and `academic-paper:rebuttal-audit` for auditing an existing response.",
      "",
      "| Route | Intent | Boundary outputs | Prerequisites | Formal Gates | Risk / cost | Start confirmation |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      renderRouteRow(REVIEW_RESPONSE_ROUTE),
    ].join("\n"),
  ].join("\n\n");
}

function renderRouteRow(route: ArsuRouteDefinition): string {
  const summary = renderArsuRouteSummary(route);
  return `| \`${route.route_ref}\` | ${route.intents.join("; ")} | ${summary.boundary_outputs} | ${summary.prerequisites} | ${summary.formal_gates} | ${summary.risk_cost} | ${summary.confirmation} |`;
}
