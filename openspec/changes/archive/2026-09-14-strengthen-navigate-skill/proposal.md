## Why

The sole host-visible `researchspec-navigate` Skill is too small to operate the current dialogue-first, graph-governed workflow without excessive trial-and-error discovery. The detailed CLI contract also exists as a separate hidden Companion even though it is supporting material for Navigate rather than an independently meaningful procedure.

## What Changes

- Expand Navigate into a self-contained controller for standalone procedure selection, root-run entry, resume, governance, source-policy, plugin, Adapter, and alternate-model decisions.
- Generate two Navigate references from existing sources of truth: the complete CLI handbook and the ARSU routing projection.
- Remove the independent `researchspec-cli-handbook` Companion identity and serve the same generated handbook only as Navigate reference content and public user documentation.
- Make Agent delivery, the Skill browser harness, package verification, and documentation consume the same deterministic Navigate file-tree renderer.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-skills`: Define four canonical Companions and the reference-backed, self-contained Navigate contract.
- `agent-tool-delivery`: Deliver Navigate with its generated references while keeping all other Companions hidden.
- `arsu-user-routing`: Route vague, graph, and CLI-help requests through Navigate and its local references.
- `arsu-routing-catalog`: Project catalog-owned ARSU route guidance into Navigate's route reference.
- `cli-interface`: Project the canonical generated handbook into Navigate without a handbook procedure identity.
- `skill-browser-harness`: Expose the complete generated Navigate file tree in the read-only harness.
- `mvp-release-readiness`: Verify the one-Skill base surface and its generated reference files in the installed tarball.
- `domain-skill-plugin-registry`: Keep the sixth-vendor registry contract aligned with the one-Skill base surface.

## Impact

- Companion manifest, renderer, Navigate instructions, Agent delivery, harness catalog, package verifier, and focused tests.
- User/developer documentation and the eight listed current specs.
- No public CLI command, schema, dependency, runtime state, or workflow authority changes.
