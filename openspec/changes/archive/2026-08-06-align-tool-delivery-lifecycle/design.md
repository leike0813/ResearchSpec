# Design

`src/adapters/tools.ts` remains the single tool catalog. Tool definitions describe project and global Skill roots, legacy roots, detection paths, aliases, and optional command adapters. A delivery planner derives the desired set from the selected tools and configured delivery mode.

The planner first computes all writes, migrations, removals, and diagnostics. `init` and `update` share this plan and reject any blocking conflict before executing it. Generated files remain manifest-owned; drift, symlinks, unknown files, and namespace-external files are preserved. The shared `.agents/skills` tree is rendered once and marked with the selected ResearchSpec writer.

Codex legacy prompts are read only through an explicit allowlist and are removed only after replacement Skills exist. Kimi legacy `.kimi/skills` trees are migrated to `.kimi-code/skills`. MiniMax uses a global Skill root and is never removed by workspace reconciliation.

Human and JSON output expose aggregate directory/action counts. Individual paths are retained only in structured drift or conflict diagnostics.
