---
sidebar_position: 3
title: Domain Plugins
description: Install and manage domain-specific Skill plugins from 218 ANZSRC research fields
---

# Domain Plugins

ResearchSpec supports **domain Skill plugins** — optional, project-maintained
vendor Skills organized by ANZSRC 2020 Fields of Research.

## What Are Domain Plugins?

Domain plugins are curated Skill bundles that provide domain-specific research
assistance. They are:

- **Static and reviewed** — installation copies reviewed content and resources without executing them
- **Advisory** — they assist semantic work but do not own workflow state
- **Optional** — install only the domains relevant to your research
- **Agent-neutral** — no dependency installation or credential setup

Optional selection controls which domains are projected into your workspace.
Installing the CLI downloads the complete offline bundle, including unselected
domains and literature Adapter assets.

## Discovering Plugins

List all available domain plugins:

```bash
researchspec plugin list
```

Filter to only installed plugins:

```bash
researchspec plugin list --installed
```

Get discovery metadata (compact output):

```bash
researchspec plugin list --summary
```

## Inspecting a Plugin

```bash
researchspec plugin show <plugin-id>
```

Shows the plugin's metadata, provenance, and supported Skills.

For compact Skill descriptions without full provenance:

```bash
researchspec plugin show <plugin-id> --summary
```

## Installing Plugins

```bash
researchspec plugin install <plugin-id>
```

`plugin install` selects and projects plugins into the current workspace. Under
non-interactive use, provide exact domain IDs and explicit consent:

```bash
researchspec plugin install <domain-id> --yes
```

With `--summary`, the command emits the aggregate write-plan impact instead of
individual projections.

## Updating Plugins

Refresh selected plugins:

```bash
researchspec plugin update <plugin-id>
```

Or refresh all installed plugins:

```bash
researchspec plugin update
```

## Uninstalling Plugins

```bash
researchspec plugin uninstall <plugin-id>
```

Removes selected plugins from the current workspace.

## Using Installed Plugins

Read an installed plugin's instructions:

```bash
researchspec plugin instructions <skill-id>
```

This provides immediate advisory use of a hash-clean plugin Skill without
persistent installation artifacts.

## Domain Taxonomy

ResearchSpec uses ANZSRC 2020 Fields of Research (FoR) Groups as the
classification standard. The internal catalog pre-creates 213 discipline
domains plus five coarse tool domains. Empty domains remain hidden from
discovery.

At runtime, the navigation Skill may suggest up to three relevant domains.
Plugin consent is separate from route confirmation, and you always preview
the exact install before proceeding.
