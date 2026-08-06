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

`release:verify` packs and installs the real tarball in a temporary directory. It verifies ten fixed
base Skills, the explicitly selected seven-Skill Zotero Adapter, sixteen top-level commands, sixteen
wrappers for each of 28 command-capable tools when `delivery` includes commands, selected Zotero runtime metadata, a fresh schema `"1"` workspace, unsupported-workspace zero-write
behavior, packaged current documentation, and absence of retired public runtime modules.

## 2. Hosted matrix

Ubuntu, macOS, and Windows must pass on Node 22 and Node 24. Checked-in CI has no publish job; a local
run cannot replace the hosted matrix.

## 3. Manual dogfooding

Use the repository-only playbook in a disposable project and record evidence for standalone resume,
bounded context export, Gate challenge/reverification/override, and an end-to-end pipeline with at
least two independently confirmed revision rounds. Do not repair a failed journey by editing
`control.yaml` or generated profile bytes.

## 4. Administrative gates

Before publication, establish canonical package metadata and private security reporting, recheck the
npm name, configure protected provenance-capable publishing, complete required license review, and
bind hosted CI plus dogfood evidence to the exact release commit.

## 5. Publication boundary

Commit, tag, push, GitHub Release, and npm publication require separate explicit authorization after
every checklist item is complete. Prefer a fixed patch release and deprecation notice over destructive
unpublishing, subject to registry policy and incident severity.
