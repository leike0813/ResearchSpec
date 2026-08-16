## 1. Manifest And Projection Contracts

- [x] 1.1 Add `plugin-capability` and `plugin-profile` managed installation source kinds.
- [x] 1.2 Add optional resolved capability/profile IDs to domain resolution snapshots.
- [x] 1.3 Extend plugin projection to install selected extension capabilities and profiles with drift, force, and strict-uninstall semantics.

## 2. Runtime Capability Overlay

- [x] 2.1 Add `loadWorkspaceCapabilityRegistry` merging base and selected plugin extension capabilities.
- [x] 2.2 Validate selected graph profiles against the combined registry in `start`.
- [x] 2.3 Return the capability manifest contract from `instructions node:`.
- [x] 2.4 Pass the combined registry into `advance` validator execution.

## 3. Status And Check

- [x] 3.1 Expose resolved and projected capability/profile IDs in `status --json`.
- [x] 3.2 Extend `check plugins` to validate extension snapshot and projection ownership/hashes.

## 4. Acceptance

- [x] 4.1 Add end-to-end projection and run coverage for the `plugin-ecology-biodiversity` pilot.
- [x] 4.2 Update domain plugin documentation.
- [x] 4.3 Add the OpenSpec change artifacts.
- [x] 4.4 Pass typecheck, lint, and targeted plugin/graph tests.
