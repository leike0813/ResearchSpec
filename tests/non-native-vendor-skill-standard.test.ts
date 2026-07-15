import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateNonNativeVendorSkill,
  type NonNativeSkillDiagnosticCode,
  type NonNativeVendorSkillDefinition,
  type NonNativeVendorSkillFile,
} from "../src/vendor-converters/shared/non-native-skill-standard/index.js";

interface Fixture {
  definition: NonNativeVendorSkillDefinition;
  files: NonNativeVendorSkillFile[];
}

void test("instruction-led non-native Skill passes without a runner or machine schema", () => {
  const fixture = baselineFixture();
  const result = validateNonNativeVendorSkill(fixture.definition, fixture.files);
  assert.equal(result.ok, true, result.diagnostics.map((item) => item.code).join(", "));
  assert.deepEqual(result.diagnostics, []);
});

void test("script, state, resource, reference, and external-tool extensions compose without becoming a runner protocol", () => {
  const fixture = extendedFixture();
  const first = validateNonNativeVendorSkill(fixture.definition, fixture.files);
  const second = validateNonNativeVendorSkill(fixture.definition, fixture.files);
  assert.equal(first.ok, true, first.diagnostics.map((item) => `${item.code}:${item.subject ?? ""}`).join(", "));
  assert.deepEqual(first, second);
  assert.equal(fixture.files.some((file) => /(?:runner|runtime)\.json$/iu.test(file.path)), false);
});

void test("non-native Skill validation returns stable diagnostics for observable contract failures", () => {
  const cases: Array<{
    name: string;
    code: NonNativeSkillDiagnosticCode;
    mutate: (fixture: Fixture) => void;
  }> = [
    {
      name: "missing main instructions",
      code: "missing-main-section",
      mutate: (fixture) => replaceSkill(fixture, "## Failure handling", "## Recovery details"),
    },
    {
      name: "template placeholder",
      code: "placeholder-content",
      mutate: (fixture) => appendSkill(fixture, "\n<<finish this workflow>>\n"),
    },
    {
      name: "missing first action",
      code: "missing-first-action",
      mutate: (fixture) => { fixture.definition.firstActionAnchor = "First, use an absent action."; },
    },
    {
      name: "capability without procedure anchor",
      code: "missing-capability-anchor",
      mutate: (fixture) => {
        const capability = fixture.definition.capabilities[0];
        assert.ok(capability?.implementation.kind === "agent-procedure");
        capability.implementation.procedureAnchor = "Undocumented semantic procedure";
      },
    },
    {
      name: "orphan reference",
      code: "orphan-reference",
      mutate: (fixture) => { fixture.files.push({ path: "references/orphan.md", content: "# Orphan\n" }); },
    },
    {
      name: "reference without read condition",
      code: "missing-reference-read-condition",
      mutate: (fixture) => {
        fixture.files.push({ path: "references/cases.md", content: "# Detailed cases\n" });
        fixture.definition.references.push({ path: "references/cases.md", readWhen: "Read this only for contradictory witnesses." });
        appendSkill(fixture, "\nSee `references/cases.md`.\n");
      },
    },
    {
      name: "undeclared script",
      code: "missing-script-contract",
      mutate: (fixture) => { fixture.files.push({ path: "scripts/helper.py", content: "print('ok')\n" }); },
    },
    {
      name: "undeclared resource",
      code: "missing-resource-contract",
      mutate: (fixture) => { fixture.files.push({ path: "assets/template.md", content: "# Template\n" }); },
    },
    {
      name: "unsafe path",
      code: "unsafe-path",
      mutate: (fixture) => { fixture.files.push({ path: "../secret.txt", content: "not distributed\n" }); },
    },
    {
      name: "missing distribution evidence",
      code: "missing-distribution-file",
      mutate: (fixture) => { fixture.definition.distribution.provenancePath = "DERIVATION.json"; },
    },
    {
      name: "private runner manifest",
      code: "unsupported-runner-contract",
      mutate: (fixture) => { fixture.files.push({ path: "assets/runner.json", content: "{}\n" }); },
    },
    {
      name: "unconsumed generic input schema",
      code: "unsupported-runner-contract",
      mutate: (fixture) => { fixture.files.push({ path: "assets/input.schema.json", content: "{}\n" }); },
    },
  ];

  for (const scenario of cases) {
    const fixture = baselineFixture();
    scenario.mutate(fixture);
    const result = validateNonNativeVendorSkill(fixture.definition, fixture.files);
    assert.equal(result.ok, false, scenario.name);
    assert.ok(result.diagnostics.some((item) => item.code === scenario.code), `${scenario.name}: expected ${scenario.code}, got ${result.diagnostics.map((item) => item.code).join(", ")}`);
  }
});

void test("generic schemas are allowed only as documented resources of a real bundled consumer", () => {
  const fixture = extendedFixture();
  const schema = fixture.files.find((file) => file.path === "assets/input.schema.json");
  assert.ok(schema);

  const resource = fixture.definition.resources[0];
  assert.ok(resource);
  fixture.definition.resources[0] = {
    ...resource,
    consumer: { kind: "agent-procedure", anchor: "Use the schema manually." },
  };
  appendSkill(fixture, "\nUse the schema manually.\n");
  const result = validateNonNativeVendorSkill(fixture.definition, fixture.files);
  assert.ok(result.diagnostics.some((item) => item.code === "unsupported-runner-contract"));
});

function baselineFixture(): Fixture {
  const skill = `---
name: archive-source-review
description: Review an identified archival source and produce provenance-aware findings. Use when a user supplies a source image or transcription for historical analysis.
license: Apache-2.0
metadata:
  vendor: example-archive
  vendor-release: snapshot-1234567
---

# Archive source review

## Purpose and scope

Review an identified source. Route broad literature searches to a research Skill.

## Inputs and prerequisites

Require a source locator, the available image or transcription, and the user's question.
First, inspect the supplied source dossier and record which evidence layers are present.

## Workflow

1. Confirm identity and provenance.
2. Compare every claim to a visible source layer.
3. Separate observation, transcription, correction, translation, and interpretation.
4. Deliver a provenance table and a bounded interpretation.

## Hard constraints

Never present reconstructed text as raw observation. Do not overwrite user material.

## Responsibilities

The Agent judges meaning, uncertainty, and historical context. Deterministic tools only hash or validate files.

## Outputs and completion

Deliver a provenance table. Completion requires every interpretation to cite its supporting layer.

## Failure handling

Stop when source identity cannot be established. Preserve verified observations and label the result incomplete.

## Examples

A successful request supplies a ledger image and asks about authorship evidence. A near-miss asks for a general web history without a source.
`;
  return {
    definition: {
      skillId: "archive-source-review",
      extensions: [],
      firstActionAnchor: "First, inspect the supplied source dossier",
      capabilities: [{
        id: "source-review",
        implementation: {
          kind: "agent-procedure",
          procedureAnchor: "Compare every claim to a visible source layer",
          outputAnchor: "Deliver a provenance table",
          failureAnchor: "Stop when source identity cannot be established",
        },
      }],
      references: [],
      scripts: [],
      resources: [],
      distribution: {
        licensePath: "LICENSE",
        noticePath: "NOTICE",
        provenancePath: "PROVENANCE.md",
      },
    },
    files: [
      { path: "SKILL.md", content: skill },
      { path: "LICENSE", content: "Example license\n" },
      { path: "NOTICE", content: "Example notice\n" },
      { path: "PROVENANCE.md", content: "# Provenance\n\nDerived from audited example sources.\n" },
    ],
  };
}

function extendedFixture(): Fixture {
  const fixture = baselineFixture();
  fixture.definition.extensions = ["script-assisted", "stateful", "resource-backed"];
  fixture.definition.references = [{
    path: "references/collation-cases.md",
    readWhen: "Read this when two witnesses conflict",
  }];
  fixture.definition.scripts = [{
    path: "scripts/validate_layers.py",
    invocation: "python scripts/validate_layers.py --input run/layers.json --schema assets/input.schema.json",
    useWhenAnchor: "Run the layer validator after semantic transcription",
    inputAnchor: "Input is run/layers.json",
    outputAnchor: "The command writes run/validation.json",
    dependencyAnchor: "The command uses the Python standard library only",
    failureAnchor: "On validation failure, preserve the transcription and repair only the invalid layer",
  }];
  fixture.definition.resources = [{
    path: "assets/input.schema.json",
    usageAnchor: "Use assets/input.schema.json to validate the five source layers",
    failureAnchor: "If the schema is missing, stop before recording state",
    consumer: { kind: "bundled-script", scriptPath: "scripts/validate_layers.py" },
  }];
  fixture.definition.state = {
    authorityAnchor: "run/state.json is authoritative only for this Skill run",
    transitionAnchor: "Transition from transcribed to validated only after validation succeeds",
    resumeAnchor: "Resume by reading run/state.json and rerunning the validation gate",
    completionAnchor: "The run is complete only when state is complete and the provenance table exists",
  };
  fixture.definition.capabilities.push(
    { id: "layer-validation", implementation: { kind: "bundled-script", scriptPath: "scripts/validate_layers.py" } },
    { id: "layer-schema", implementation: { kind: "bundled-resource", resourcePath: "assets/input.schema.json" } },
    {
      id: "catalog-lookup",
      implementation: {
        kind: "external-tool",
        toolName: "user-configured archive catalog",
        usageAnchor: "Query the catalog only after local identity evidence is exhausted",
        authorityAnchor: "Send only the query terms the user authorized",
        failureAnchor: "If the catalog is unavailable, retain the local finding and mark lookup pending",
      },
    },
  );
  fixture.files.push(
    { path: "scripts/validate_layers.py", content: "from pathlib import Path\nprint(Path.cwd())\n" },
    { path: "assets/input.schema.json", content: "{\"type\":\"object\"}\n" },
    { path: "references/collation-cases.md", content: "# Detailed collation cases\n\nA substantial collection of worked conflicts, witness rankings, ambiguous abbreviations, and documented resolutions belongs here.\n" },
  );
  appendSkill(fixture, `

## Bundled commands

Run the layer validator after semantic transcription.

Path: \`scripts/validate_layers.py\`

Command: \`python scripts/validate_layers.py --input run/layers.json --schema assets/input.schema.json\`.
Input is run/layers.json. The command writes run/validation.json. The command uses the Python standard library only. On validation failure, preserve the transcription and repair only the invalid layer.

## Bundled resources

Use \`assets/input.schema.json\` to validate the five source layers. If the schema is missing, stop before recording state.

## Skill-local state and gates

\`run/state.json\` is authoritative only for this Skill run. Transition from transcribed to validated only after validation succeeds. Resume by reading \`run/state.json\` and rerunning the validation gate. The run is complete only when state is complete and the provenance table exists.

## External tools

Use the user-configured archive catalog. Query the catalog only after local identity evidence is exhausted. Send only the query terms the user authorized. If the catalog is unavailable, retain the local finding and mark lookup pending.

## Reference loading

Read this when two witnesses conflict: \`references/collation-cases.md\`.
`);
  return fixture;
}

function replaceSkill(fixture: Fixture, search: string, replacement: string): void {
  const skill = fixture.files.find((file) => file.path === "SKILL.md");
  assert.ok(skill && typeof skill.content === "string");
  skill.content = skill.content.replace(search, replacement);
}

function appendSkill(fixture: Fixture, content: string): void {
  const skill = fixture.files.find((file) => file.path === "SKILL.md");
  assert.ok(skill && typeof skill.content === "string");
  skill.content += content;
}
