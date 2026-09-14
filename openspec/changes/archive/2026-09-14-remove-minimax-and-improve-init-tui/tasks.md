## 1. Tool catalog and delivery

- [x] 1.1 Remove MiniMax Code from the Agent-tool registry and parser surface; verify registry tests report exactly 36 tools and reject `minimax-code`.
- [x] 1.2 Collapse current Skill delivery and detection to project-local roots while preserving bounded legacy ownership handling; verify adapter and managed-path tests pass.
- [x] 1.3 Update package verification and project guidance for the reduced catalog; verify package surface checks no longer expect a global Skill-root tool.

## 2. Interactive initialization

- [x] 2.1 Render the navigation, selection, confirmation, and cancellation guide below searchable choices; verify the guide remains visible in a PTY init session.
- [x] 2.2 Translate native `Ctrl+C` prompt cancellation into the stable `cancelled` CLI error before writes; verify the init regression test leaves existing configuration bytes unchanged.

## 3. Verification

- [x] 3.1 Run TypeScript checking, lint, focused Agent-tool/init tests, and the full test suite; verify all commands complete successfully.
- [x] 3.2 Validate the OpenSpec change strictly and run build/package verification after all artifacts are present.
