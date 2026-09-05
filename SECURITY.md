# Security Policy

## Supported Versions

Only the latest `0.1.x` release on supported Node.js 22 and 24 runtimes receives security fixes. Unpublished source snapshots and end-of-life Node releases are not supported release environments.

## Reporting A Vulnerability

Do not include private research data, unpublished manuscripts, credentials, or exploit details in a public issue.

The project does not yet have a public Git remote or configured private vulnerability intake. This is intentionally recorded as an unsigned administrative item in the MVP release checklist. Before public distribution, maintainers must configure a private repository security-advisory channel and document its reachable location here.

Until that channel exists, the package must not be represented as publicly release-authorized. If you received a private evaluation build, report the issue through the same private channel used to receive it.

## Security Boundaries

- ResearchSpec is a local file and CLI control plane; it does not call an LLM API or emit telemetry.
- Installed Agent tools and their model providers are separate trust boundaries.
- Selecting Codex projects Skills into the project's `.agents/skills/` directory. Other selected tools follow their declared installation scopes, including shared global scopes where applicable.
- Context packs contain selected research contracts and run records, but exclude private working material and external deliverable bytes. Contract content and handoff metadata can still be sensitive.
- Manifest hashes detect generated-file drift; they do not establish academic truth or make untrusted content safe.
