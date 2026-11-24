---
sidebar_position: 3
title: Installation
description: How to install the ResearchSpec 0.1.0 release candidate
---

# Installation

ResearchSpec 0.1.0 is a release candidate. The npm package is not published until the
release checklist is signed, so the supported way to evaluate it today is a source
checkout.

## Requirements

| Requirement | Version |
| --- | --- |
| Node.js | 22 or 24 |
| Package manager | pnpm 10.13.1 for source installs |
| Agent | One supported Agent host, for example Codex |

Node 20 has reached end of life and is outside the supported Node and OS matrix.

## Install the release candidate from source

```bash
git clone https://github.com/leike0813/ResearchSpec.git
cd ResearchSpec
corepack enable
pnpm install --frozen-lockfile
pnpm build
npm link
researchspec --version
```

`npm link` is a local development and internal trial installation. It does not mean
the npm package has been published.

## Install the published package

Once the first release is authorized, the same CLI is installed from npm:

```bash
npm install --global researchspec
researchspec --version
```

## Create a workspace

ResearchSpec uses the `researchspec/` directory as its workspace root. Initialize one
in any project directory:

```bash
mkdir my-research && cd my-research
researchspec init . --tools codex
```

The `init` command:

- creates the `researchspec/` workspace with schema `"2"`;
- writes four stable specs, preset graph profiles, and the project configuration;
- installs the single base entry `researchspec-navigate`;
- keeps ARSU, Companion, core, and plugin Procedures available through on-demand CLI
  activation instead of projecting them into the host Skill catalog;
- offers the optional seven-Skill Zotero literature Adapter after tool selection.

`init` initializes a new workspace and reconfigures an existing current workspace.
Run it again on the same project when the complete tool or Adapter selection should
change. `researchspec update` refreshes managed projections after a CLI upgrade
without touching research content.

### Tool Selection

| Flag | Behavior |
| --- | --- |
| (interactive default) | Select detected Agent tools, then optionally select literature Adapters |
| `--tools all` | Project Navigate to all compatible registered Agent tools |
| `--tools none` | Skip Agent tool projection |
| `--tools codex,claude` | Replace the selection with specific Agent tools |
| `--delivery skills` | Project the Skill surface only |
| `--delivery commands` | Project the command surface only |
| `--delivery both` | Project both supported entry forms |
| `--literature-adapters zotero-library` | Install the optional Zotero Adapter |
| `--literature-adapters none` | Install no literature Adapter |

The `zotero-library` Adapter requires Zotero with the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents). ResearchSpec shows
this prerequisite during interactive init but never installs or probes it.

## Update

Update the CLI itself, then refresh the workspace projections:

```bash
researchspec update
```

`update` regenerates managed Agent files without overwriting research content. Old or
unknown workspaces are reported as unsupported and are left unchanged; ResearchSpec
provides no migration, rollback, or semantic repair for them.

## Uninstall

```bash
npm uninstall --global researchspec
```

Removing the CLI does not remove project files, Agent projections, or an optional
`.zotero-bridge/` directory. Run `researchspec update --literature-adapters none`
before uninstalling when you want ResearchSpec to remove clean managed Adapter files.

## Troubleshooting

`researchspec doctor` reports runtime diagnostics without repairing anything, and
`researchspec check` validates workspace integrity.
