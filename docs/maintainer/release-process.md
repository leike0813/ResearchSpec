# ResearchSpec release process

Record the hosted checks, package integrity, dogfooding results, license
sign-off and maintainer approval against one commit SHA. Use the
[release checklist](../../artifacts/release/mvp-release-checklist.md) as the
template for the candidate's evidence record. Keep review evidence in an
access-controlled location when it contains transcripts or research materials.

## Verify the candidate

Use Node.js 22 or 24 from a clean checkout. For a Windows checkout, set
`core.longpaths=true` and `core.autocrlf=false` before checkout to preserve
vendor paths and reviewed bytes. Run the same gates as the
[CI workflow](https://github.com/leike0813/ResearchSpec/blob/main/.github/workflows/ci.yml).
Node tests that exercise Python use the shared local uv environment by default.
The hosted workflow sets `RESEARCHSPEC_TEST_PYTHON_PROJECT` to the locked
test project in `tests/python` and puts its environment outside the checkout.

```sh
git submodule update --init
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm check
pnpm docs:check
pnpm --dir website install --frozen-lockfile
pnpm --dir website build
pnpm release:verify
pnpm dlx @fission-ai/openspec@1.5.0 validate --specs --strict --no-interactive
git diff --check
```

Run the converter and audit steps in CI for the same candidate. The hosted
matrix covers Ubuntu, macOS and Windows on Node.js 22 and 24. Docs checks the
generated documentation, builds both locales and deploys the checked artifact
on pushes to `main`. Record separately any opt-in multilingual search smoke
run, which downloads the pinned model and runtime.

`release:verify` installs the packed tarball with scripts disabled and exercises
the packaged CLI, including fresh workspace creation, the optional Zotero
projection, a minimal graph and an academic pipeline with two revision rounds.
It checks the package contents, docs, asset licenses and runtime closure. The
compressed and unpacked sizes describe the full offline bundle. Domain and
Adapter selections affect what is projected into the workspace.

## Establish main

For the first release, capture the passing `dev-refactor` commit SHA. Confirm
it descends from the local `main` and the current remote default branch tip.
After authorization, fast-forward local `main` to that SHA, create remote
`main`, and make it the default branch. Keep the existing branch history and
require the six CI matrix jobs and the Docs build for subsequent pull requests
into `main`.

In repository settings, choose **GitHub Actions** as the Pages source and
enable private vulnerability reporting. Run or rerun the `main` push workflows
if the initial checks ran before Pages was enabled. Verify all six hosted cells
and the deployed English and Simplified Chinese sites for the candidate SHA.
Confirm the [private reporting form](https://github.com/leike0813/ResearchSpec/security/advisories/new)
is reachable. Set up the `npm-production` environment with required reviewers
and deployments restricted to the `main` branch.

## Sign off human acceptance

Follow the [dogfooding playbook](https://github.com/leike0813/ResearchSpec/blob/main/playbooks/dogfooding/README.md).
The init matrix must pass for all registered targets, including shared
`agents`, in `skills`, `commands` and `both` modes. Run `pnpm dogfood plan`
and then `pnpm dogfood run --no-ui` for the static matrix. On one selected
host, complete `natural-18` with two independent human-reviewed passes per scenario.
Record that host and model versions, session IDs and human corrections,
successful resumes out of attempts, and evidence and deliverable scores. The
host verdict applies to the tested host. Record each manual journey in the
checklist with its evidence.

Have the responsible rights holder or adviser sign off the exact distribution,
including the ARSU noncommercial terms, the corresponding source for the
packaged AGPL Zotero Adapter binaries, and the other bundled licenses and
notices. Record the basis for corresponding-source availability. A check of
tarball contents establishes which bytes are distributed. Human acceptance and
permission to distribute require their own evidence.

## Prepare the release artifact

Use the GitHub Actions **Release** workflow from `main` with mode `prepare`
and the exact version in `package.json`. It requires successful CI and Docs
push runs for that SHA and an unpublished npm version. Download and unzip its
`npm-release` artifact. It contains the exact tarball that the verifier installed
and `release.json` with the version, SHA, size and npm integrity. To retain a
local verification artifact, run `pnpm release:verify --output-dir <new-dir>`.

Verify the downloaded artifact from a checkout of the recorded candidate:

```sh
node scripts/verify-release-artifact.mjs ./npm-release 0.1.0 <candidate-sha>
```

The command prints the tarball path after verifying its identity and bytes.
Treat a changed SHA or tarball as a new candidate and repeat its sign-off.

## Publish 0.1.0

After sign-off and explicit publication authorization, recheck the public npm
name. A registry 404 indicates no public package at that name. Use the
maintainer's npm account with two-factor authentication and publish the
verified tarball from the previous step.

```sh
npm login --registry https://registry.npmjs.org/
npm publish ./npm-release/researchspec-0.1.0.tgz --access public --ignore-scripts
npm view researchspec@0.1.0 dist.integrity --registry https://registry.npmjs.org/
```

Compare the registry integrity to `release.json`. In a disposable directory,
install `researchspec@0.1.0` from npm with `--ignore-scripts` and verify the CLI
version and a minimal workspace smoke test. With authorization, tag the recorded
SHA as `v0.1.0`, push the tag and create the corresponding GitHub Release from
the changelog. The first release's identity is recorded through the artifact
integrity and SHA. GitHub Actions provenance begins with trusted publication.

## Publish later versions with npm Trusted Publishing

In the npm package settings, add a GitHub Actions Trusted Publisher for
`leike0813/ResearchSpec`, workflow file `release.yml` and environment
`npm-production`. Allow direct `npm publish` and complete the first trusted
publication within npm's two-day configuration window. See
[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/).

The publish mode requires `0.1.0` to be present on the registry.

For each subsequent candidate, repeat the checks and human sign-off. Dispatch
`release.yml` on `main` in mode `publish` and approve the pending deployment
after matching its SHA and version to the evidence. The publish job verifies the
downloaded tarball again and uses the GitHub-hosted Node 24 runner's OIDC identity.
Verify registry integrity, public installation and provenance before creating the
corresponding tag and GitHub Release. For a faulty release, prefer a fixed patch
and targeted deprecation when appropriate under npm's policy.
