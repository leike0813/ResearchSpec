# Tasks

## 1. Public documentation

- [x] 1.1 Review public docs and update first-use, CLI, licensing and vulnerability reporting guidance. Check local links and generated CLI documentation.
- [x] 1.2 Build both site locales with a frozen lockfile and add a Pages deployment job for the checked output.

## 2. Release infrastructure

- [x] 2.1 Repair the hosted runtime matrix and OpenSpec validation. Check the vendor inputs, workflow definitions and strict spec validation.
- [x] 2.2 Use package metadata for version reporting and retain the verified tarball on request. Run the installed-package checks and verify the artifact metadata.
- [x] 2.3 Add the manual release workflow and update the release runbook. Exercise eligibility and integrity checks without publishing.

## Workflow follow-up

- Synchronize and archive after implementation checks pass.
- Bind the hosted CI, human acceptance, licensing sign-off and release approval to the candidate commit before publication.
