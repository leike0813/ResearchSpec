---
sidebar_position: 2
title: Quick Start
description: Install ResearchSpec and initialize your first workspace in minutes
---

# Quick Start

## Prerequisites

- **Node.js** >= 22
- **pnpm** (recommended) or npm

## Installation

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

Verify the installation:

```bash
researchspec --version
researchspec --help
```

## Initialize a Workspace

```bash
mkdir my-paper && cd my-paper
researchspec init
```

`researchspec init` is **idempotent** — you can safely run it multiple times.
It installs ARSU Skills, companion Skills, and literature adapter Skills into
your workspace without overwriting your work.

Run `researchspec init --tools all` to install every registered tool, or
`--tools none` to install only the core framework files.

## Your First Workflow

1. **Check status** to see what's available:

   ```bash
   researchspec status --json
   ```

2. **Read instructions** for a returned selector:

   ```bash
   researchspec instructions subflow:deep-research --json
   ```

3. **Start a subflow** (your AI agent does this):

   ```bash
   researchspec start subflow:deep-research \
     --input start.json \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

4. **Submit artifacts** as work progresses:

   ```bash
   researchspec submit <item> --input payload.json \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

5. **Advance transitions** when work is done:

   ```bash
   researchspec advance <transition> \
     --actor-kind agent \
     --actor-name "My Agent"
   ```

## Runtime Profiles

ResearchSpec supports two runtime profiles:

| Profile | Description |
|---------|-------------|
| `adaptive` (default) | Flexible artifact submission with automatic hash binding |
| `strict` | Full plan-bound execution with exact SHA-256 verification |

Initialize with a specific profile:

```bash
researchspec init --profile strict
```

## Next Steps

- Read the [Workflow Guide](/guides/workflow) for the full execution model
- Browse the [CLI Reference](/cli) for every command
- Check the [FAQ](/faq) for common questions
