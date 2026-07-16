## Context

The bundled registry contains 56 non-empty domains and hundreds of reviewed
Skills. Existing `plugin list --json` emits full provenance for every Skill and
is too large for routine Agent discovery, while domain descriptions alone are
usually taxonomy labels. The packaged `SKILL.md` frontmatter already contains
the semantic description needed for matching and the Skill Browser Harness
independently parses it.

Plugin installation already uses a deterministic write plan and safe manifest
ownership, but non-interactive execution is not bound to the preview. Newly
projected Skill files also may not become native host capabilities until a new
session, depending on the Agent tool.

## Goals / Non-Goals

**Goals:**

- Let the Agent discover likely domain and Skill assistance from compact,
  source-derived metadata.
- Require one explicit human confirmation per proposed installation batch.
- Bind non-interactive installation to the exact previewed plan.
- Allow immediate read-only use of a newly installed Skill without assuming
  host hot reload.
- Keep core ARSU work fully functional when plugins are declined, unavailable,
  drifted, or fail to install.

**Non-Goals:**

- Deterministic keyword routing, embeddings, telemetry, recommendation history,
  or a second route catalog.
- Silent installation, plugin-owned workflow nodes, plugin-produced receipts,
  or automatic authority over network, credentials, scripts, or learner data.
- New public top-level commands, wrappers, Registry Schema 1 fields, or changes
  to the four ARSU producer identities.

## Decisions

### Packaged Skill frontmatter is the discovery SSOT

The plugin loader SHALL parse every packaged `SKILL.md` entry once and retain
its validated description and SHA-256. Compact list output contains only domain
identity, state, and counts. Compact show output contains direct and resolved
Skill IDs, descriptions, dependencies, and entry hashes. Full views retain
current license and provenance detail.

The Harness SHALL consume the same parser instead of maintaining a second
frontmatter implementation.

### Semantic matching remains an Agent judgment

Navigate and ARSU Skills ask the CLI for compact facts, then reason about the
user's research need. The CLI does not score or recommend domains. The Agent
evaluates opportunities only for a new or materially changed route, a newly
ready work item, or an explicit specialist request, and proposes at most three
domains in one batch.

### Installation uses preview-confirm-execute binding

`plugin install` dry-run computes a SHA-256 over the registry identity, selected
domain versions, resolved Skill set, configured tools, and summarized write
plan. Non-interactive execution requires both `--yes` and the matching
`--expected-plan-sha256`. A mismatch is a write conflict and performs no write.
Interactive execution retains its prompt and may execute without an externally
supplied hash.

The Agent presents the compact impact summary and obtains one explicit human
confirmation for the whole batch. Declining is ordinary conversation context,
not a Decision-ledger event.

### Plugin invocation is nested semantic assistance

An installed plugin Skill receives a bounded helper brief from the current ARSU
producer: current task, necessary inputs, expected response, and forbidden
ResearchSpec authority writes. Its result returns to that producer as working
material. The producer remains responsible for validation, integration,
candidate generation, and Submit.

Plugins never become subflows, work items, workflow dependencies, Gates,
Decisions, transitions, receipts, or alternate producers.

### Read-only instruction bridge provides immediate activation

`researchspec plugin instructions <skill-id>` succeeds only when:

- the Skill is in the current selected-domain closure;
- every selected domain providing it is available;
- every configured tool has the complete projected Skill tree;
- each projected file exists and matches the manifest hash.

The packet returns the exact `SKILL.md`, its hash, resource paths, domains,
projected tools, and an advisory authority statement. A host that hot-loads the
Skill may invoke it natively; otherwise the Agent follows this packet in the
current session. The command never executes a resource.

### Core work always degrades safely

Plugin discovery, installation, activation, and invocation failures are
non-blocking for the canonical ARSU route. The Agent reports the unavailable
augmentation and continues with the fixed base Skills. Formal external-tool,
network, credential, privacy, and sensitive-data permissions remain governed by
the selected Skill and host policy, not installation consent.

## Risks / Trade-offs

- [Compact metadata becomes stale] → Parse it directly from packaged Skill
  entries and bind it to entry hashes.
- [Large domains are installed for one useful Skill] → Show direct/resolved
  counts and specific matching Skills before consent.
- [Repeated suggestions become noisy] → Evaluate only at defined semantic
  boundaries and suppress declined suggestions for the current conversation.
- [Host cannot hot-load Skills] → Use the checked read-only instruction bridge.
- [Plugin instructions attempt authority writes] → Add the helper brief and
  packet boundary; authoritative writes remain impossible outside existing CLI.

## Migration Plan

No workspace migration is required. Existing configs, manifests, Registry
Schema 1, and plugin selections remain valid. Compact options and the new
subcommand are additive. Existing interactive installs retain their confirmation
flow; Agent-driven non-interactive installs adopt plan-hash binding.

## Open Questions

None.
