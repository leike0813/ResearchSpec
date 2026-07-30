---
sidebar_position: 4
title: Literature Adapters
description: Zotero library integration — query, acquisition, analysis, synthesis, and curation
---

# Literature Adapters

ResearchSpec includes seven Zotero literature adapter Skills for managing
academic literature through your Zotero library.

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

Adapters operate through the `literature-adapters/zotero/` directory in your
workspace. They provide:

- **Skill instructions** (SKILL.md) for the agent
- **Bundled binaries** (where applicable)
- **Manifest files** for catalog registration

The adapters are **static** — ResearchSpec never executes binaries or contacts
Zotero directly. Status and checks are read-only. When an agent invokes a
literature adapter, it follows the Skill instructions using its own configured
tools.

## Installation

Literature adapters are installed by default with `researchspec init`. You can
verify their presence:

```bash
researchspec check literature-adapters
```

## Versioning

Bundle, CLI, and Skill versions are component-local identities. Never compare
patch versions across components. Admission follows the fixed release-set,
protocol/schema, build fingerprint, command checksum, and reviewed hashes.

## Project Files

Literature adapter runtime and profile files live under `.zotero-bridge/`
within your workspace. These files are managed by the adapters and should not
be edited by hand.
