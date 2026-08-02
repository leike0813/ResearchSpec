## Why

ResearchSpec currently pins ARS before v3.19.0 and republishes upstream model-
specific delegation guidance that can be mistaken for permission to configure or
call model services directly. The new stable upstream release also introduces a
reviewer-panel checker whose deterministic local closure is not yet packaged.

## What Changes

- Pin `vendor/ars` to ARS v3.19.0 at commit
  `828ef3b613b0e8b91830da3328a1e33d4eb5ab4c` and refresh the immutable source
  audit.
- Add a converter-owned runtime-policy catalog and fail-closed rewrite planner
  for model delegation, model tiering, credential, endpoint, and direct-API
  guidance.
- Preserve heterogeneous-model review only through user-confirmed host-native
  subagents, with single-model fallback and no ResearchSpec model configuration.
- Package the two-script reviewer-panel checker closure while leaving Python and
  `jsonschema` installation under user control.
- Regenerate the ARSU tree and expose runtime-policy evidence in its manifest and
  report.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-converter`: admit ARS v3.19.0, apply a complete runtime-policy catalog,
  and package the bounded reviewer-panel checker closure.
- `arsu-user-routing`: keep alternate-model consent separate from route start
  confirmation and scope it to one confirmed subflow instance.
- `companion-skills`: present and enforce the same bounded host-native delegation
  rules in generated navigation guidance.

## Impact

The change affects the ARS submodule, ARSU converter policy and generated tree,
Companion guidance, current specifications, documentation, and focused tests. It
adds no public command, workspace schema, workflow-state field, dependency, or
runtime model integration.
