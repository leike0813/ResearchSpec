import assert from "node:assert/strict";
import { test } from "node:test";
import { parse as parseYaml } from "yaml";

import { ACADEMIC_PIPELINE_PROFILE } from "../src/arsu-converter/workflow/academic-pipeline.js";
import { ACADEMIC_PIPELINE_PROFILE_PROJECTION } from "../src/arsu-converter/workflow/generate.js";
import { ManagedInstallationSchema } from "../src/adapters/installations.js";
import { PipelineProfileSchema } from "../src/core/contracts/pipeline-profile.js";
import { sha256 } from "../src/core/workspace/write-plan.js";

void test("academic pipeline has one strict converter-owned projection contract", () => {
  assert.deepEqual(PipelineProfileSchema.parse(parseYaml(ACADEMIC_PIPELINE_PROFILE_PROJECTION)), ACADEMIC_PIPELINE_PROFILE);
  assert.equal(ACADEMIC_PIPELINE_PROFILE.entries.length, 2);
  assert.ok(ACADEMIC_PIPELINE_PROFILE.children.some((item) => item.round_role === "revision"));
  assert.deepEqual(ACADEMIC_PIPELINE_PROFILE.branches.flatMap((branch) => branch.options.filter((option) => option.option_id === "accepted").map((option) => option.unlocks)), [["format"], ["format"]]);
  assert.ok(ACADEMIC_PIPELINE_PROFILE.transitions.some((item) => item.transition_id === "format-to-final-integrity"));
  assert.equal(ACADEMIC_PIPELINE_PROFILE.transitions.some((item) => item.from === "review" && item.to === "final-integrity"), false);
  assert.deepEqual(ACADEMIC_PIPELINE_PROFILE.children.find((item) => item.node_id === "final-integrity")?.required_input_roles, ["manuscript_source", "formatted_manuscript"]);
  assert.equal(ManagedInstallationSchema.safeParse({
    owner: "framework",
    tool_id: null,
    source: { kind: "framework-profile", profile_id: "academic-pipeline", profile_version: "1" },
    target: { scope: "project", path: "researchspec/profiles/academic-pipeline.yaml", executable: false },
    sha256: sha256(ACADEMIC_PIPELINE_PROFILE_PROJECTION),
  }).success, true);
});
