## 1. Runtime Contracts And Authority

- [x] 1.1 Add the shared safe project-relative path schema to graph handoff, input, output and validator contracts; verify focused schema tests reject absolute, traversing, backslash and `researchspec/` paths.
- [x] 1.2 Separate Gate and Decision action records from execution-node completion; verify decide/frontier tests prove confirmations never write execution completion.
- [x] 1.3 Require capability and validator registries for execution submission and make policy/schema dispatch fail closed; verify missing and unknown validators produce zero writes.

## 2. Child-Run Subgraphs And Runtime Introspection

- [x] 2.1 Extend graph profile/run contracts with subgraph `entry_id`, typed authorization origin and parent binding; verify parsing and cross-profile validation tests.
- [x] 2.2 Implement idempotent child-run start and parent-state/output derivation; verify duplicate, mismatched, incomplete and completed child-run scenarios.
- [x] 2.3 Expose pending child starts, structured ineligible-node blockers, resolved bounded node-card inputs and frozen/current profile drift; verify CLI JSON tests and bounded status behavior.

## 3. Generated Profile And Projection Ownership

- [ ] 3.1 Move preset profile data into a converter-owned generated registry and make bootstrap load it; verify registry cross-validation and generator idempotence.
- [x] 3.2 Add core capabilities and profiles to the common ownership-aware transactional write plan and route project-change decisions through CAS/atomic writes; verify drift preservation and zero partial writes.
- [ ] 3.3 Remove hard-coded core graph modules and obsolete route/subflow/control/handoff contracts after all consumers migrate; verify production source and generated public surfaces contain no removed selectors.

## 4. Current Agent Guidance

- [ ] 4.1 Update ARSU converter contract injections and regenerate the four ARSU Skills with graph-only status/instructions/start/decide/advance guidance; verify converter checks and idempotence.
- [ ] 4.2 Update all five Companion workflow sources and regenerate their Skills and payload/help catalogs; verify navigation, decision and verification tests use only graph selectors.
- [ ] 4.3 Update the canonical usage model, architecture/runtime/CLI documentation, stable current-state specs and `AGENTS.md`; verify repository searches find no operational schema `"1"` or subflow guidance.

## 5. Vendor Metadata And Release Gates

- [x] 5.1 Make Scientific extension licensing derive as MIT and regenerate all 49 packages through its maintenance workflow; verify manifests, hashes, maintenance check and idempotence.
- [x] 5.2 Make Education extension licensing derive as CC-BY-SA-4.0 and regenerate all 136 packages through its maintenance workflow; verify manifests, hashes, maintenance check and idempotence.
- [ ] 5.3 Derive package verification expectations from packaged ARSU, Companion, capability, profile and Adapter registries; verify a fresh schema `"2"` tarball installs the complete current surface.
- [ ] 5.4 Add the hash-verified authored-whitespace gate and repair authored whitespace without changing reviewed byte-preserved resources; verify altered or unhashed exemptions fail.

## 6. Integrated Verification

- [x] 6.1 Run focused graph/runtime, converter, delivery and package tests and fix all failures attributable to this change.
- [ ] 6.2 Run type checking, build, strict OpenSpec validation, applicable vendor maintenance checks, full tests and `pnpm release:verify`; record any unavailable external release evidence without weakening the technical gates.
