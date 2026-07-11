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
- Codex prompts may be written to the shared `$CODEX_HOME/prompts` scope after explicit Codex selection.
- Context packs exclude registered artifacts by default, but metadata and contract content can still be sensitive.
- Hashes and receipts detect drift; they do not establish academic truth or make untrusted content safe.
