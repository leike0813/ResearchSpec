# Skill Browser Harness

This repository-only harness presents the visible Agent entries and hidden Procedure inventory in a local, read-only web UI.

```bash
pnpm dev:harness
pnpm dev:harness -- --port 4300
```

The server binds to `0.0.0.0` so it can be reached from containers and remote development environments. It has no authentication; run it only on a trusted development network and use firewall or tunnel controls when needed. The command recompiles current TypeScript sources into the ignored `.harness-dist/` directory before starting. Restart it after changing TypeScript; reload the page after changing Skill files.

The displayed sources are separated into:

- eight visible entries: Navigate plus seven fixed Zotero literature Adapter Skills;
- runtime-derived ARSU, hidden Companion, core capability, and plugin extension Procedures;
- plugin domains assembled without writes for Procedure grouping and availability diagnostics.

Navigation keeps visible entries separate from hidden ARSU, Companion, Core, and Plugin Procedure branches. Plugin Procedures are grouped by domain. Selecting an entry or Procedure opens its validated package tree beside an on-demand preview; `SKILL.md` is selected initially.

The harness does not run converters, install dependencies for bundled Skills, modify registries, or expose workflow mutations. Markdown raw HTML is disabled, executable file types are never embedded, and every file read must belong to the enumerated Skill tree.
