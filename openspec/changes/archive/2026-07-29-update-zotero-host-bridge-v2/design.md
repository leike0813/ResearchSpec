## Context

The Zotero adapter is a fixed, static bundle. Its catalog, immutable audit,
generated tree, installation manifest resolution, and project-local runtime all
refer to one reviewed release-set. The upstream v0.8.3 bundle changes the Host
Bridge protocol from v1 to v2 and the CLI schema from v4 to v5, including a
new `/bridge/v2` default profile and new platform binaries.

## Goals / Non-Goals

**Goals:**

- Admit the exact v2 upstream release with complete offline hash evidence.
- Regenerate all derived adapter bytes from the existing deterministic
  converter, leaving the seven-Skill surface and authority boundaries intact.
- Prove that a forced workspace refresh replaces managed v1 bytes and commits
  the v2 release identity without executing adapter assets.

**Non-Goals:**

- Adding a public command, adapter selector, compatibility shim, or dual v1/v2
  installation.
- Interpreting runner/output-schema content, probing Zotero, or migrating user
  credentials and user-owned configuration.

## Decisions

- Pin `host-bridge/hbrs-8c6de08010d459a0e87e74f2` rather than the mutable
  upstream branch. Its bundle commit, tree, source commit, component
  identities, content digests, and binary checksums form the admission basis.
- Keep the existing converter and delivery model. They already derive release
  identity from the audit and treat runtime metadata as opaque, so only the
  reviewed source facts and generated output change.
- Preserve default drift protection. The selected upgrade journey uses the
  existing global `--force`, which refreshes manifest-owned files only; unowned
  paths remain conflicts. This upgrades managed v1 workspaces without granting
  a broad overwrite capability.
- Update current OpenSpec specifications and user-facing release attribution;
  archived historical documents remain historical evidence.

## Risks / Trade-offs

- [Protocol v2 requires the matching Zotero plugin] → deliver the upstream v2
  profile and CLI command cards together, bind them to one release-set, and do
  not claim runtime readiness during static checks.
- [Large generated binary/reference diff] → regenerate only through the
  converter and validate audit, output, and idempotence before package checks.
- [A forced refresh may replace deliberate edits to managed files] → retain the
  existing explicit `--force` opt-in and keep unowned paths protected.
