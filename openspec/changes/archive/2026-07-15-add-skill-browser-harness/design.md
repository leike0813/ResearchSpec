## Context

ResearchSpec has no single checked-in directory for its complete Skill surface. ARSU is installed from converter-owned generated trees, Companion Skills are rendered from TypeScript manifests at delivery time, and plugin Skills are grouped through a source-neutral catalog plus isolated vendor bundles. A directory-only browser would therefore omit Companion Skills or create a second source of truth.

The harness is for repository developers. It must remain separate from the public CLI and npm runtime, preserve the existing converter ownership model, and treat bundled third-party resources as untrusted display content.

## Goals / Non-Goals

**Goals:**

- Provide one local web UI for the production-installable ARSU, Companion, and plugin projections.
- Reuse production renderers, validators, assemblers, and dependency resolution rather than duplicate domain rules or Skill content.
- Expose domain membership, dependencies, metadata, complete file trees, Markdown previews, and source views.
- Keep all requests read-only and confine file access to enumerated Skill roots.

**Non-Goals:**

- Running converters or showing unadmitted upstream Skill trees.
- Editing, installing, updating, or executing Skills and their bundled scripts.
- Adding a public `researchspec` command, authenticated deployment service, or published runtime dependency.
- Providing TypeScript hot reload; source-code changes take effect after harness restart.

## Decisions

### Compile into an isolated development output

`pnpm dev:harness` invokes the repository's pinned TypeScript compiler and emits `src/` plus `harness/` into ignored `.harness-dist/`. The normal production build continues to compile only `src/`, so the harness does not enter the package's runtime output.

Using the normal compiler was chosen over a new bundler or TypeScript runtime loader. It keeps module resolution identical to production and avoids another development toolchain.

### Project the production-installable surface

- ARSU identity comes from `ARSU_SKILL_IDS`, while content comes from `skills/arsu/<skill-id>` and existing output validation.
- Companion content is generated in memory from `COMPANION_INTENTS`, `renderCompanionSkill`, and the shared license constant.
- Plugin domains are assembled with `write: false` from the domain catalog and vendor bundles, then passed through the existing registry validator and dependency resolver.

The harness deliberately does not run converters into temporary directories. That alternative would be slow, require every maintainer checkout, and couple browsing to converter-side setup rather than the bytes production delivery installs.

### Use a refreshable server-side catalog snapshot

Loading `/api/catalog` rebuilds and validates the catalog. Skill detail requests reuse that snapshot, while file bytes are read from their approved source when requested. A page reload therefore discovers file-tree and registry changes without paying full registry assembly cost on every file click. TypeScript changes still require process restart.

### Present navigation and files as independent trees

The global browser uses exactly three top-level branches: ARSU, Companion, and Plugin. ARSU and Companion contain their Skills directly. Plugin contains domain branches, and each non-empty domain separates direct catalog members from Skills present only through the dependency closure. A Skill with several domain memberships appears in every applicable branch but retains one global ID and detail route.

Search filters this hierarchy in place and expands matching ancestors instead of replacing it with a flat result list. Empty domains remain hidden unless explicitly requested.

Each Skill detail is a workspace with a directory tree and a separate preview pane. The server derives the nested tree from the existing sorted flat file metadata; the flat files remain the only file-access whitelist. Selecting a Skill opens `SKILL.md` by default, selecting another file updates the preview, and directories containing the selected file remain expanded.

### Enforce a read-only file and rendering boundary

The HTTP server accepts GET only and binds to `0.0.0.0` so container and remote-development hosts can reach it. It is an unauthenticated development service and must be used only on a trusted network or behind developer-controlled firewall or tunnel boundaries. Every file request must match an enumerated file for a known Skill. Path traversal, NULs, backslash paths, symbolic links, and files outside the resolved Skill root are rejected.

Markdown is rendered with `markdown-it` as a development dependency with raw HTML disabled. Relative links are rewritten to harness routes. Only PNG, JPEG, GIF, and WebP are embedded; HTML, JavaScript, SVG, and unknown binary files are shown as source or attachment and never executed. Text previews are capped at 1 MiB, and responses carry a restrictive CSP and related security headers.

## Risks / Trade-offs

- **Generated ARSU or vendor bundles may lag converter source changes** → The harness intentionally reports the production-installable projection and surfaces existing validation or registry drift instead of silently regenerating outputs.
- **Full plugin assembly makes initial load slower** → Cache one validated snapshot for detail/file navigation and rebuild only on catalog reload.
- **Bundled content may contain hostile markup or paths** → Disable raw HTML, restrict embedded image formats, require enumerated paths, reject symbolic links, and serve executable formats as non-executable content.
- **Binding all IPv4 interfaces exposes the unauthenticated harness to reachable peers** → Document the trusted-network boundary and require developers to use host firewall or tunnel controls in shared environments.
- **The development script remains visible in published package metadata** → Keep harness files outside the package `files` allowlist and name the command `dev:harness` so it is clearly repository-only.
