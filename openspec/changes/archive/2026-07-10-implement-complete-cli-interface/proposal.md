## Why

ResearchSpec currently exposes only the first framework slice (`init`, `status`,
and `check`), while the documented user workflow depends on a complete,
agent-neutral CLI for inspecting runtime state, delivering ARSU-facing tools,
handling human decisions, and producing derived handoff/context artifacts. The
next phase must turn that interface design into a stable public contract so the
framework can be used end to end without platform-specific or hidden runtime
behavior.

## What Changes

- Replace the minimal hand-written CLI dispatcher with a complete public command
  surface for `init`, `update`, `status`, `check`, `list`, `show`, `handoff`,
  `pack`, `decide`, and `archive`.
- Define one machine-readable result envelope, structured diagnostics, stable
  exit-code classes, canonical item selectors, and consistent TTY/non-TTY
  behavior.
- Add reusable workspace snapshot, write-plan, item-resolution, decision,
  archive, handoff, and deterministic context-pack services.
- Add project-local configuration and a hash-backed installation manifest that
  protect user-owned research contracts and modified generated files.
- Add an agent-tool registry covering every selectable tool supported by the
  bundled OpenSpec 1.5.0 reference, including complete ARSU skill delivery and
  the supported per-tool command formats.
- Upgrade `init` to an interactive, searchable tool-selection flow and add safe
  refresh behavior through `update`.
- Add focused behavioral tests and align the CLI design documentation with the
  now-frozen public contract.

## Capabilities

### New Capabilities

- `cli-interface`: Complete ResearchSpec command, option, output, error,
  selection, decision, handoff, packing, and archive behavior.
- `agent-tool-delivery`: Agent-tool registry, detection, generated skill and
  command delivery, ownership manifests, drift protection, and refresh behavior.

### Modified Capabilities

- `framework-core`: Replace the first-slice CLI boundary with the complete
  workspace metadata, runtime service, validation, and write-safety foundation
  required by the public CLI.

## Impact

- Affected code: `src/cli`, `src/core`, new `src/adapters`, workspace templates,
  and CLI/adapter tests.
- Affected public API: the `researchspec` executable and its JSON/exit-code
  contract.
- Affected workspace surface: new `researchspec/config.yaml`, generated tool
  installation manifest, handoff view, archives, and context bundles.
- Dependencies: formal argument parsing, interactive prompts, YAML/schema
  validation, terminal presentation, and deterministic ZIP generation.
- Packaged assets: the four ARSU-derived skill groups are delivered recursively;
  converter/upstream maintenance remains outside the public CLI.
