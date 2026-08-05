---
sidebar_position: 4
title: Literature Adapters
description: Zotero library integration — query, acquisition, analysis, synthesis, and curation
---

# Literature Adapters

ResearchSpec offers an optional seven-Skill Zotero literature Adapter for managing
academic literature through your Zotero library. It requires Zotero with the
[Zotero-Agents plugin](https://github.com/leike0813/zotero-agents).

## Adapter Overview

| Adapter | Role |
|---------|------|
| `zotero-library-agent` | Routes and coordinates bounded library research tasks |
| `zotero-library-query` | Retrieves current library content for source-grounded answers |
| `zotero-literature-acquisition` | Discovers, evaluates, and imports literature |
| `zotero-literature-analysis` | Analyzes literature with traceable source evidence |
| `zotero-research-synthesis` | Synthesizes literature into research context |
| `zotero-library-curation` | Plans and applies approved library maintenance |
| `zotero-bridge-cli` | Low-level Zotero operations and command discovery |

## How They Work

ResearchSpec packages the reviewed Adapter under `literature-adapters/zotero/`.
When selected, it projects:

- **Skill instructions** (SKILL.md) for the agent
- **Bundled binaries** (where applicable)
- **Manifest files** for catalog registration

The adapters are **static** — ResearchSpec never executes binaries or contacts
Zotero directly. Status and checks are read-only. When an agent invokes a
literature adapter, it follows the Skill instructions using its own configured
tools.

## Installation

Interactive `researchspec init` offers the Adapter after Agent tool selection and
leaves it unselected by default. For non-interactive setup:

```bash
researchspec init . --tools codex --literature-adapters zotero-library
```

For an existing workspace, selection is replaced explicitly:

```bash
researchspec update --literature-adapters zotero-library
researchspec update --literature-adapters none
```

Omitting the option during `update` preserves the current choice. Verify static
installation health with:

```bash
researchspec check literature-adapters
```

Status lists the catalog entry as `not-selected` when disabled. It does not report
missing runtime or Skill projections until the Adapter is selected.

## Versioning

Bundle, CLI, and Skill versions are component-local identities. Never compare
patch versions across components. Admission follows the fixed release-set,
protocol/schema, build fingerprint, command checksum, and reviewed hashes.

## Project Files

Literature adapter runtime and profile files live under `.zotero-bridge/`
within your workspace. These files are managed by the adapters and should not
be edited by hand.
