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

ResearchSpec uses a **workspace root** convention. Any project containing
`researchspec/` is a workspace. Initialize one:

```bash
mkdir my-research && cd my-research
researchspec init
```

The `init` command:

- Creates the `researchspec/` workspace directory
- Installs the single base entry, `researchspec-navigate`
- Keeps ARSU, Companion, core, and plugin Procedures available through on-demand CLI activation
- Offers the optional seven-Skill Zotero literature Adapter after tool selection
- Writes initial contract files (`specs/`, `config.yaml`)
- Refuses a non-empty initialization target; use `update` for an existing workspace

### Tool Selection

| Flag | Behavior |
|------|----------|
| (interactive default) | Select detected Agent tools, then optionally select literature Adapters |
| `--tools all` | Project Navigate to all compatible registered Agent tools |
| `--tools none` | Skip Agent tool projection |
| `--tools codex,claude` | Select specific Agent tools |
| `--literature-adapters zotero-library` | Install the optional Zotero Adapter |
| `--literature-adapters none` | Install no literature Adapter |

The `zotero-library` Adapter requires Zotero with the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents). ResearchSpec
shows this prerequisite during interactive init but does not install or probe it.

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

Removing the CLI does not remove project files, Agent projections, or an optional
`.zotero-bridge/` directory. Use `researchspec update --literature-adapters none`
before uninstalling when you want ResearchSpec to remove clean managed Adapter files.

## Troubleshooting

See `researchspec doctor` for runtime diagnostics. See `researchspec check` to
validate workspace integrity.
