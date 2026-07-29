## 1. Shared Path Contract

- [x] 1.1 Add the runtime-aware Artifact path root, resolver, containment result, and POSIX serializer.
- [x] 1.2 Migrate workflow inspection and pack inclusion to the shared path contract.

## 2. Runtime Consumers

- [x] 2.1 Migrate Doctor receipt, candidate, dependency, and hash binding checks to the runtime-aware basis.
- [x] 2.2 Migrate patch lifecycle base, precondition, revised Artifact, report, and receipt paths without dual-root fallback.
- [x] 2.3 Migrate contract lifecycle receipt lookup and receipt registry writes to the shared path contract.

## 3. Writers And Migration

- [x] 3.1 Serialize strict and adaptive Artifact Submit candidate and receipt paths through the shared module.
- [x] 3.2 Resolve strict source Artifacts and serialize adaptive target paths through the shared module during explicit runtime migration.

## 4. Tests And Documentation

- [x] 4.1 Extend adaptive and strict submission/runtime tests for shared checks, dependency trust, deterministic dual-location selection, and lifecycle outputs.
- [x] 4.2 Extend CLI pack and Doctor recovery tests for adaptive paths, containment, receipts, candidates, and dependencies.
- [x] 4.3 Document the adaptive workspace-relative rule, strict compatibility exception, and explicit migration boundary.

## 5. Validation And Completion

- [x] 5.1 Run focused type checks and tests, lint, the full test suite, and strict OpenSpec validation.
- [x] 5.2 Verify requirement, scenario, design, and task coverage with no unresolved CRITICAL issue.
- [x] 5.3 Confirm the delta-spec sync set and archive with default spec synchronization, then validate main specs.
