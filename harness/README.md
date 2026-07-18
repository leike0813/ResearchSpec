# Skill Browser Harness

This repository-only harness presents the production-installable ResearchSpec Skill surface in a local, read-only web UI.

```bash
pnpm dev:harness
pnpm dev:harness -- --port 4300
```

The server binds to `0.0.0.0` so it can be reached from containers and remote development environments. It has no authentication; run it only on a trusted development network and use firewall or tunnel controls when needed. The command recompiles current TypeScript sources into the ignored `.harness-dist/` directory before starting. Restart it after changing TypeScript; reload the page after changing Skill files.

The displayed sources are:

- ARSU IDs and generated trees from the same sources used by production delivery;
- Companion Skills rendered in memory from the production manifest and renderer;
- fixed Zotero literature Adapter Skills from the converter-owned generated tree;
- plugin domains assembled without writes from the source-neutral domain catalog and isolated vendor bundles.

The navigation has four top-level branches: ARSU, Companion, Literature Adapter, and Plugin. Plugin Skills are grouped by domain, with direct members separated from dependency-only members. Selecting a Skill opens its real directory tree beside an on-demand file preview; `SKILL.md` is selected initially, and every other enumerated resource remains available from the tree.

The harness does not run converters, install dependencies for bundled Skills, modify registries, or expose workflow mutations. Markdown raw HTML is disabled, executable file types are never embedded, and every file read must belong to the enumerated Skill tree.
