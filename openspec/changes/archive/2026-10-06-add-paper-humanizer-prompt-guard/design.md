# Design

## Context

Bootstrap already reconciles generated installations in one write plan. Project-entry regions demonstrate partial ownership with full-file transaction preconditions. The pinned Paper Humanizer snapshot already contains the upstream guard, but delivery deliberately excludes it.

## Goals / Non-Goals

Deliver reviewed writing context on every prompt and on verified subagent-start interfaces. Preserve existing configuration. No session flags, extra Procedures, model services, permission changes or automatic host trust decisions.

## Decisions

- Keep one adapted `hooks/paper-humanizer/guard.md` and a dependency-free CommonJS publisher. Project resources are copied to `<workspace>/hooks/paper-humanizer/`; host plugins read that guard directly.
- Add hook metadata to the tool catalog: configuration path, protocol, events, source URL, review date and prerequisites. The 18 reviewed targets are claude, qwen, qoder, codebuddy, codex, trae, gemini, factory, cursor, cline, kiro, github-copilot, junie, antigravity, opencode, kilocode, pi and oh-my-pi.
- Store hook entries in the existing installation manifest using a new source kind. Shared JSON ownership hashes the canonical owned entries only; a whole-file hash protects each write. Standalone scripts and resources use normal whole-file ownership. Preserve unowned collisions and malformed config without force adoption.
- Keep this reconciler separate from ordinary Skill retirement so framework-owned resources and partial JSON ownership remain intact. Retained hooks keep the shared resources even after off/deselection.
- Use explicit protocol arguments rather than guessing the harness from environment variables. Absolute, safely shell-quoted publisher paths handle subdirectory invocation; in-process plugins derive the guard location relative to their own module.
- Codex receives developer context with a 5000-token limit; Copilot CLI uses `userPromptTransformed` and preserves transformed input; Antigravity uses ephemeral system context; OpenCode/Kilo/Pi/OMP preserve existing system content. Verified Claude/Codex/Qwen/Qoder/Copilot subagent events share the publisher.
- Add PH-KP-04 verbatim extraction and optional `delivery_assets` in owned-vendor anchors. Refresh shared catalog identities and the existing ARSU aggregate without changing unaffected capability bytes.

## Risks / Trade-offs

- Host trust, EAP and private Cursor interfaces may prevent activation: report prerequisites and validation scope; static installation never certifies loading.
- Context increases on each prompt: inject only the bounded complete guard with no fallback duplicate or transcript reads.
- Existing conflicting configuration can prevent activation: retain it and report incomplete installation/retirement.

## Migration Plan

Current schema 2 configurations without the optional preference resolve to on. Explicit off disables delivery. Older schemas remain unsupported. Host configuration is not migrated; reviewed native formats only are edited.
