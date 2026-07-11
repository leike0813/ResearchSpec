## Context

The public CLI and canonical ARSU user model are complete, but release concerns are still coupled to the development compiler output. `tsconfig.json` currently emits both `src` and `tests` into `dist`, does not remove files for deleted sources, and emits declarations and source maps that the CLI package does not expose as a library API. `npm pack` consequently includes compiled tests and six retired Companion workflows. The package also names README and LICENSE files that do not exist.

ARSU runtime trees are derived from a CC BY-NC 4.0 upstream and are copied independently into Agent tool directories. A root-only notice would not follow those copied trees. Companion Skills are rendered during delivery and have the same independent-copy concern for their MIT notice. There is no Git remote, so this change can create deterministic CI and release gates but cannot truthfully report a successful hosted matrix or dogfood signoff.

## Goals / Non-Goals

**Goals:**

- Produce a clean npm tarball from source with only production JavaScript, packaged ARSU assets, and release documentation.
- Make package verification exercise the installed CLI and delivery surface from a real tarball on Linux and Windows.
- Preserve applicable license and attribution information in every independently copied Skill directory.
- Make supported Node versions, privacy boundaries, mixed licensing, and release authorization explicit.
- Keep generated ARSU licensing files converter-owned and deterministic.

**Non-Goals:**

- Publishing, reserving the npm name, configuring a Git remote, committing, tagging, or creating a GitHub Release.
- Adding a publish workflow, project dependency, runtime API, CLI command, workspace migration, or new Agent surface.
- Splitting the core and ARSU Skill pack into separate packages or claiming commercial rights to ARSU-derived content.
- Marking hosted CI or manual dogfood journeys complete without their actual evidence.

## Decisions

### Use separate clean production and test outputs

`tsconfig.json` remains the shared strict type-check configuration. `tsconfig.build.json` emits `src/**/*.ts` to `dist` with declarations and source maps disabled; `tsconfig.test.json` emits `src` plus `tests` to `.test-dist`. A small Node cleanup script accepts only a fixed allowlist of output directory names before recursively deleting them. This prevents stale production modules without introducing shell-specific commands or a general deletion primitive.

Alternative considered: rely on `tsc` incremental output or npm ignore patterns. That would hide, rather than prevent, stale compiled files and would leave development and production output coupled.

### Verify the packed installation, not repository internals

`prepack` runs the clean production build. A cross-platform Node release verifier invokes `npm pack` into a temporary directory, rejects paths outside the package allowlist and known forbidden output classes, installs that tarball in another temporary project, and invokes its platform-specific bin shim. It initializes Codex with an isolated `CODEX_HOME`, checks the eight installed Skills and eight prompts, confirms the fifteen-command help surface, and runs strict workspace validation.

The verifier owns and cleans only OS temporary directories. It does not write release evidence into runtime state and does not access a registry except for installing the tarball's declared dependencies.

### Use an explicit mixed-license boundary

ResearchSpec-authored framework, documentation, tests, Companion Skills, and adapter wrappers use MIT with `ResearchSpec contributors` attribution. Vendored ARS, generated `skills/arsu/**`, and specifically enumerated ARSU-derived catalog/profile projections remain under CC BY-NC 4.0. Root `LICENSE`, `NOTICE`, and `LICENSES/` describe the mapping, and `package.json` uses `SEE LICENSE IN LICENSE` because a single SPDX identifier would be misleading.

The converter copies the authoritative upstream license and generates a concise source/modification notice into every ARSU Skill root before manifest hashing. Companion delivery writes canonical MIT license text next to each generated Companion `SKILL.md`. These files participate in existing manifest ownership, drift protection, validation, and idempotence. Command wrappers remain minimal ResearchSpec adapter projections and do not duplicate substantive ARSU content.

Alternative considered: license the entire package CC BY-NC or split the package. The former unnecessarily restricts the generic framework; the latter changes the MVP distribution and delivery architecture.

### Treat release readiness and release authorization as separate states

Automated release readiness is satisfied by local gates and a checked-in read-only CI matrix for Node 22/24 on Ubuntu and Windows. Actual release authorization additionally requires a green hosted matrix, the documented manual dogfood journeys, npm-name recheck, and external account/repository setup. The technical OpenSpec change can be verified and archived while the release checklist truthfully remains blocked.

CI uses pinned `pnpm dlx @fission-ai/openspec@1.5.0` instead of adding a project dependency. No publish job or write permission is configured.

## Risks / Trade-offs

- **Mixed-license boundaries may still require legal review** → document the mapping conservatively, retain upstream source and notices, and explicitly block commercial claims without separate review or permission.
- **Package verification installs dependencies from npm** → keep it a release/CI gate rather than a unit test and install only into an OS temporary directory.
- **Full four-cell CI is slower** → retain the matrix because Windows path and bin-shim behavior are part of the supported CLI contract.
- **Raising Node to 22 excludes working Node 20 installations** → make the support break explicit; no workspace data migration is required.
- **No remote means CI cannot be observed in this change** → leave hosted-CI and dogfood checklist entries unchecked and prohibit tag/publish until signed.
