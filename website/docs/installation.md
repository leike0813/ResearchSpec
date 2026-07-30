---
sidebar_position: 3
title: Installation
description: Detailed installation instructions for ResearchSpec
---

# Installation

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | >= 22 |
| Package manager | pnpm (recommended) or npm |

## Global Installation

<Tabs>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add -g researchspec
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm install -g researchspec
```

</TabItem>
</Tabs>

## Verify

```bash
researchspec --version
```

You should see the current version number (e.g., `0.1.0`).

Run `researchspec --help` to see the full command list.

## Workspace Setup

ResearchSpec uses a **workspace root** convention. Any directory containing
`.researchspec/` is a workspace. Initialize one:

```bash
mkdir my-research && cd my-research
researchspec init
```

The `init` command:

- Creates the `.researchspec/` workspace directory
- Installs ARSU Skills (`deep-research`, `academic-paper`,
  `academic-paper-reviewer`, `academic-pipeline`)
- Installs companion Skills (`researchspec-navigate`,
  `researchspec-propose`, `researchspec-decide`, `researchspec-verify`)
- Installs Zotero literature adapter Skills (7 in total)
- Writes initial contract files (`specs/`, `config.yaml`)
- Is **idempotent** — safe to re-run

### Tool Selection

| Flag | Behavior |
|------|----------|
| (default) | Install core ARSU, companion, and literature adapter tools |
| `--tools all` | Install all 31 registered tools |
| `--tools none` | Skip tool installation |
| `--tools tooluniverse,materials-science` | Install specific tool subsets |

## Updating

Update ResearchSpec itself:

```bash
pnpm update -g researchspec
```

Refresh workspace files after an update:

```bash
researchspec update
```

This regenerates managed agent files without overwriting your research content.

## Uninstalling

```bash
pnpm remove -g researchspec
```

ResearchSpec does not modify files outside of `.researchspec/` within your
workspace, so uninstalling the CLI does not affect your research data.

## Troubleshooting

See `researchspec doctor` for runtime diagnostics. See `researchspec check` to
validate workspace integrity.
