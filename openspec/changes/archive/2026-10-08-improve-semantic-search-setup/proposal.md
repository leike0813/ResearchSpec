# Proposal

## Why

Semantic search setup currently presents one long confirmation, runs without progress, and only prints a recovery command after failure. The shared user cache has no supported inspection or cleanup entry.

## What Changes

- Separate download and privacy disclosures from the short confirmation.
- Report preparation stages, actual download bytes, index progress and cache reuse.
- Offer an explicit retry or temporary offline continuation after interactive failures, retaining hybrid preference.
- Add workspace-independent `doctor search-cache` inspection and explicitly confirmed `--clear`, with dry-run support and bounded deletion of managed resources.
- Coordinate cache preparation and clearing across processes, and synchronize generated CLI documentation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `local-semantic-search`: setup progress, interactive recovery and shared-cache lifecycle.
- `cli-interface`: the optional doctor search-cache maintenance subcommand, while ordinary doctor stays read-only.

## Impact

The semantic runtime, bootstrap prompts, typed CLI catalog, machine results, user documentation and relevant tests change. No dependency, model, project schema or top-level command is added. Cache clearing affects every project sharing that cache, never their configuration or research files.
