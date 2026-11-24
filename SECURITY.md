# Security Policy

## Supported Versions

No release has been published yet. After the first public release, security fixes apply only to the latest supported `0.1.x` release on Node.js 22 and 24 runtimes. Unpublished source snapshots and end-of-life Node releases are not supported release environments.

## Reporting A Vulnerability

Do not include private research data, unpublished manuscripts, credentials, or exploit details in a public issue.

Report vulnerabilities through the repository's private security-advisory form
when reporting is enabled.

<https://github.com/leike0813/ResearchSpec/security/advisories/new>

The first release requires the maintainer to enable GitHub private vulnerability
reporting and verify the form.

If you received a private evaluation build, report the issue through the same private channel used to receive it.

## Security Boundaries

- ResearchSpec is a local file and CLI control plane; it does not call an LLM API or emit telemetry.
- Installed Agent tools and their model providers are separate trust boundaries.
- Selecting Codex projects Skills into the project's `.agents/skills/` directory. `init` and `update` also install the project-level writing guard under `researchspec/hooks/paper-humanizer/` and register ownership entries in the host's native hooks configuration. Other selected tools follow their declared installation scopes, including shared global scopes where applicable.
- Context packs contain selected research contracts and run records, but exclude private working material and external deliverable bytes. Contract content and handoff metadata can still be sensitive.
- Manifest hashes detect generated-file drift; they do not establish academic truth or make untrusted content safe.
