## 1. Extension Registry Contract And Loader

- [x] 1.1 Add `skills/plugins/extensions/registry.json` schema 1 with capabilities, profiles, and domain assignments.
- [x] 1.2 Add `src/plugins/extensions.ts` with schema, hash validation, manifest/profile validation, graph reference validation, and domain resolution.
- [x] 1.3 Author the `plugin-ecology-biodiversity` pilot capability package and one-node graph profile.

## 2. Check And Discovery Integration

- [x] 2.1 Extend `check plugins` with extension registry load, collision, and profile reference diagnostics.
- [x] 2.2 Expose extension capability/profile counts through `plugin list` and `plugin show`.
- [x] 2.3 Add loader, collision, and CLI discovery regression tests.

## 3. Acceptance

- [x] 3.1 Document the extension registry bridge in `docs/domain_skill_plugins.md`.
- [x] 3.2 Add the OpenSpec change artifacts.
- [x] 3.3 Pass typecheck, lint, and targeted plugin/graph tests.
