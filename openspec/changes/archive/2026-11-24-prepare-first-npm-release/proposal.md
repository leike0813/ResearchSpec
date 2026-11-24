# Proposal

## Why

ResearchSpec needs a current public documentation set and a repeatable release path before distributing its first npm package. Existing local package checks cover the CLI, but hosted checks, Pages deployment, and publication need to identify and verify the same release candidate.

## What Changes

- Reconcile public documentation with the current workspace and CLI.
- Run the supported hosted matrix and deploy the checked documentation build through GitHub Pages.
- Retain the verified tarball for manual first publication and protected npm Trusted Publishing for later versions.
- Keep human acceptance, licensing review, and publication approval as separate release gates.

## Capabilities

### Modified Capabilities

- `help-documentation-system` covers hosted documentation validation and Pages deployment.
- `mvp-release-readiness` covers the hosted matrix, verified artifacts, and the manual and trusted publication paths.

## Impact

GitHub Actions, npm package metadata and verification, Docusaurus, public documentation, and maintainer release instructions change.
