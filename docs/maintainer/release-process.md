# ResearchSpec MVP Release Process

Passing technical checks does not authorize a Git tag, GitHub Release, or npm publication.

## 1. Technical gates

Run from a clean checkout on a supported Node release:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm check
pnpm docs:check
pnpm arsu:anchors:check
pnpm arsu:runtime-policy:check
pnpm arsu:check
pnpm arsu:idempotence
pnpm zotero-adapter:audit
pnpm zotero-adapter:check
pnpm zotero-adapter:idempotence
pnpm tooluniverse:check
pnpm tooluniverse:idempotence
pnpm scientific-agent-skills:check
pnpm scientific-agent-skills:idempotence
pnpm materials-science-skills-for-llm:check
pnpm materials-science-skills-for-llm:idempotence
pnpm finrobot:check
pnpm finrobot:idempotence
pnpm histagent:check
pnpm histagent:idempotence
pnpm education-agent-skills:audit:check
pnpm education-agent-skills:evidence:check
pnpm education-agent-skills:check
pnpm education-agent-skills:idempotence
pnpm release:verify
openspec validate --specs --strict --no-interactive
git diff --check
```

`release:verify` packs and installs the real tarball in a temporary directory with installation scripts
disabled. It verifies the registry-derived fixed base Skills, the explicitly selected seven-Skill Zotero Adapter, sixteen top-level commands, sixteen
wrappers for each of 28 command-capable tools when `delivery` includes commands, selected Zotero runtime metadata, a fresh schema `"2"` workspace, unsupported-workspace zero-write
behavior, packaged current documentation, and absence of retired public runtime modules.

The installed CLI completes both the minimal graph and an academic pipeline with research, writing,
review, two revision/re-review rounds, Markdown formatting and final integrity. Each command starts a
fresh process; status and instructions recover work at child, Gate and Decision boundaries. Acceptance
checks persisted root and child completion, no active runs, an empty frontier and strict workspace
health. Producer fixtures write external materials through the declared instructions; workflow state
changes only through public CLI commands. This does not execute research tools or certify the academic
quality of those fixtures. Tests using `.test-dist` are compiled-CLI tests, not installed-package tests.

The tarball excludes compiled vendor converters, source audits and evidence-maintenance modules.
Runtime-referenced ARSU contract modules and reviewed distributable resources remain included.
Record compressed and unpacked tarball sizes for the release candidate: optional domain and Adapter
selection controls workspace projection, while installing the CLI downloads the complete offline bundle.

## 2. Hosted matrix

Ubuntu, macOS, and Windows must pass on Node 22 and Node 24. Checked-in CI has no publish job; a local
run cannot replace the hosted matrix.

## 3. Manual dogfooding

Use the repository-only [dogfooding playbook](../../playbooks/dogfooding/README.md) in a disposable project and record evidence for standalone resume,
bounded context export, Gate challenge/reverification/override, and an end-to-end pipeline with at
least two revision rounds with their own Gate and Decision confirmations. Do not repair a failed journey by editing
run/node state or generated profile bytes.

Record human correction counts, resume attempts and successful resumes alongside evidence-discipline
and artifact-usability scores. Report the recovery rate as successes/attempts, or not applicable if no
resume was attempted. The manifest's `operational` maturity means a curated execution procedure is
present; parity reports establish static content coverage. Neither signs off real-Agent academic
quality. Keep manual checklist items unsigned until the corresponding evidence is reviewed.

## 4. Administrative gates

Before publication, establish canonical package metadata and private security reporting, recheck the
npm name, configure protected provenance-capable publishing, complete required license review, and
bind hosted CI plus dogfood evidence to the exact release commit.

## 5. Publication boundary

Commit, tag, push, GitHub Release, and npm publication require separate explicit authorization after
every checklist item is complete. Prefer a fixed patch release and deprecation notice over destructive
unpublishing, subject to registry policy and incident severity.
