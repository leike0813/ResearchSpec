import assert from "node:assert/strict";
import { test } from "node:test";
import { parse as parseYaml } from "yaml";

import { ARSU_ROUTING_CATALOG } from "../src/arsu-converter/routing/catalog.js";
import {
  ACADEMIC_PIPELINE_PROFILE,
  validateAcademicPipelineProfileRouting,
} from "../src/arsu-converter/workflow/academic-pipeline.js";
import { validateArsuWorkflowCatalog } from "../src/arsu-converter/workflow/catalog.js";
import {
  ACADEMIC_PIPELINE_PROFILE_PROJECTION,
  renderAcademicPipelineProfile,
} from "../src/arsu-converter/workflow/generate.js";
import { PipelineProfileSchema } from "../src/core/contracts/pipeline-profile.js";
import { getWorkspaceTemplates } from "../src/core/workspace/layout.js";

void test("current ARSU routing and academic-pipeline profile form one validated workflow catalog", () => {
  assert.deepEqual(validateArsuWorkflowCatalog(), []);
  assert.deepEqual(validateAcademicPipelineProfileRouting(), []);

  const routes = ARSU_ROUTING_CATALOG.skills.flatMap((skill) => skill.routes);
  assert.equal(routes.filter((route) => route.route_kind === "mode").length, 25);
  assert.equal(routes.filter((route) => route.route_kind === "entry").length, 2);
  assert.equal(routes.every((route) => route.start_confirmation === "required"), true);

  const routeMap = new Map(routes.map((route) => [route.route_ref, route]));
  for (const entry of ACADEMIC_PIPELINE_PROFILE.entries) {
    assert.equal(routeMap.get(entry.route_ref)?.route_kind, "entry", entry.route_ref);
  }
  for (const child of ACADEMIC_PIPELINE_PROFILE.children) {
    assert.equal(routeMap.get(child.route_ref)?.route_kind, "mode", child.route_ref);
  }

  const invalid = structuredClone(ACADEMIC_PIPELINE_PROFILE);
  const firstChild = invalid.children[0];
  assert.ok(firstChild);
  firstChild.route_ref = "deep-research:missing";
  assert.ok(validateAcademicPipelineProfileRouting(invalid).some((issue) => issue.startsWith("profile_child_route_missing:")));
});

void test("workspace projects only the canonical current academic-pipeline profile", () => {
  assert.equal(renderAcademicPipelineProfile(), ACADEMIC_PIPELINE_PROFILE_PROJECTION);
  assert.equal(ACADEMIC_PIPELINE_PROFILE_PROJECTION.endsWith("\n"), true);
  assert.equal(ACADEMIC_PIPELINE_PROFILE_PROJECTION.endsWith("\n\n"), false);
  assert.deepEqual(
    PipelineProfileSchema.parse(parseYaml(ACADEMIC_PIPELINE_PROFILE_PROJECTION)),
    ACADEMIC_PIPELINE_PROFILE,
  );

  const templates = getWorkspaceTemplates();
  const profile = templates.find((item) => item.relativePath === "profiles/academic-pipeline.yaml");
  assert.equal(profile?.content, ACADEMIC_PIPELINE_PROFILE_PROJECTION);
  assert.equal(templates.some((item) => item.relativePath === "specs/workflow.yaml"), false);
  assert.equal(templates.some((item) => item.relativePath.startsWith("runs/")), false);
});
