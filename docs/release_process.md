# ResearchSpec MVP Release Process

This document separates technical release readiness from authorization to publish. Passing local automation does not authorize a Git tag, GitHub Release, or npm publication.

## 1. Technical Gates

Run from a clean checkout on a supported Node release:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm check
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
pnpm dlx @fission-ai/openspec@1.5.0 validate --specs --strict --no-interactive
git diff --check
```

`release:verify` runs the package lifecycle, inspects the real tarball, verifies all seven packaged Zotero runtimes and fourteen opaque runtime-metadata assets, installs it into an OS temporary directory, invokes the installed bin, initializes an isolated Codex delivery with fifteen fixed Skills and eight wrappers, and completes `check all --strict` without executing the Adapter runtime, runners, or output schemas. Repository source or internal planners are not substitutes for this check.

The Scientific Agent Skills gates also require all 40 manual-security targets to have finding-level maintainer decisions consistent with admission, resource curation, dependencies, and generated hashes. Upstream scanner labels alone are neither release approval nor a production blocker override.

The Education Agent Skills gates require the immutable 165-Skill audit, all 872
evidence declarations, all 813 advisory relationships, and the generated
136-Skill tree to remain bound to the approved aggregate SHA-256
`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`.
Any source, policy, evidence, license, or generated-byte drift requires a new
human approval.

## 2. Hosted Matrix

The checked-in CI workflow must pass for all six cells:

| Operating system | Node 22 | Node 24 |
| --- | --- | --- |
| Ubuntu | required | required |
| macOS | required | required |
| Windows | required | required |

The workflow is read-only and contains no publish job. A local run cannot be used to mark the hosted matrix complete.

## 3. Manual Dogfooding

Follow `playbooks/dogfooding/README.md` in a disposable research project using an adapter that satisfies the playbook's isolation contract. The playbook, synthetic benchmark, scenario catalog, adapters, and evidence templates are maintainer-only repository assets and are intentionally excluded from the npm package. Sign all of these journeys in `artifacts/mvp_release_checklist.md`:

- quick standalone;
- cross-session resume;
- context export;
- Gate challenge, reverification, and override;
- end-to-end academic pipeline with at least two revision rounds.

Do not repair a failed journey by editing runtime state, registries, ledgers, or receipts.

## 4. Administrative Gates

Before publication:

1. Establish the canonical Git remote and add accurate repository, homepage, bugs, and private security-reporting metadata.
2. Recheck that the npm name `researchspec` is available; a prior E404 does not reserve it.
3. Configure npm account protection and a trusted publishing or equivalent provenance-capable path.
4. Obtain any legal review needed for the MIT/CC BY-NC 4.0 mixed distribution and commercial-use claims.
5. Confirm the release commit is the exact commit whose hosted matrix and dogfood evidence were signed.

## 5. Publication Boundary

This repository intentionally provides no automated publication workflow at MVP release-readiness stage. Commit, tag, push, GitHub Release, and npm publication require a separate explicit authorization after every checklist item is complete.

If a published package is defective, prefer a fixed patch release and npm deprecation notice over destructive unpublishing, subject to registry policy and incident severity.
