# Design

## Context

See `proposal.md` for motivation. ResearchSpec already has a runtime-derived Procedure catalog, shared schema `"1"` activation packets, project-local managed delivery, and a single Navigate entry surface. CLI commands alone mutate workflow state. Host custom-agent formats differ, and not every registered adapter supports a project-local native profile.

## Goals / Non-Goals

**Goals:**

- Reuse packet metadata and managed delivery as the two facts sources.
- Provide fresh execution and independent-review contexts without adding runtime model APIs.
- Render the same two contracts into the 24 already-supported native formats.

**Non-Goals:**

- Runtime cross-host routing, model selection, MCP setup, background workers, worktrees, or shell-enabled workers.
- A role per Procedure class, hidden post-processing review, behavioral quality scoring, or support for Command Code.

## Decisions

### Two roles, selected from manifest semantics

The role set is fixed to Executor and Reviewer. Packet construction derives one advisory recommendation from existing manifest fields in this order: missing manifest, non-`llm` execution, no outputs, producer, then checker/observer. This avoids a second procedure-role registry and leaves coordinators, scripts, and mixed packages in the parent.

The packet keeps schema `"1"`; `delegation` is additive:

```json
{
  "recommended_agent": "researchspec-executor | researchspec-reviewer | null",
  "reason": "llm-producer | llm-independent-review | non-llm | reference-only | coordinator"
}
```

Alternative considered: class-specific agents. The current class taxonomy is dominated by analysis and would create many indistinct profiles without stronger authority boundaries.

### Navigate remains the coordinator

Review packets delegate by default when the host/model boundary is eligible. Producer packets delegate only for useful isolation or independent parallel nodes. Workers execute one packet, never ask the user, never call ResearchSpec mutation commands, and return blockers to Navigate. Navigate validates outputs and serializes `advance`, Gate, Decision, and other mutations.

The common worker contract is rendered from one canonical body, with a short role-specific suffix. Both roles may read/search, use host built-in web retrieval when the Procedure source policy permits it, and write declared outputs. The Reviewer may edit its review output but may not modify evaluated inputs. Neither role uses shell or nested delegation.

Workers return a human-readable fixed brief with `status`, `procedure`, `outputs`, `checks`, and `blocker`; ResearchSpec does not parse this as a new machine protocol.

### Native renderers are data-driven and project-local

One adapter module owns role metadata, the canonical prompts, and host renderers. Existing `ToolDefinition` records opt into an agent-profile target/format. The targets are:

```text
antigravity     .agents/agents/*.md
auggie          .augment/agents/*.md
claude          .claude/agents/*.md
codeartsagent   .codeartsdoer/agents/*.md
codebuddy       .codebuddy/agents/*.md
codex           .codex/agents/*.toml
devin           .devin/agents/*.md
forgecode       .forge/agents/*.md
costrict        .costrict/agents/*.md
cursor          .cursor/agents/*.md
factory         .factory/droids/*.md
gemini          .gemini/agents/*.md
github-copilot  .github/agents/*.agent.md
iflow           .iflow/agents/*.md
junie           .junie/agents/*.md
kilocode        .kilo/agents/*.md
kiro            .kiro/agents/*.md
vibe            .vibe/agents/*.toml and .vibe/prompts/*.md
oh-my-pi        .omp/agents/*.md
opencode        .opencode/agents/*.md
qoder           .qoder/agents/*.md
qwen            .qwen/agents/*.md
rovodev         .rovodev/subagents/*.md
trae            .trae/agents/*.md
```

Where a host supports explicit permissions, the renderer denies shell, user questioning, and nested delegation and allows only read/search/web/write/edit. It uses an inherited-model value only when the host documents one; otherwise the model field is omitted. Profiles are marked non-primary or hidden where supported.

Alternative considered: a generic profile compiler. Twenty-four small formats do not justify a public compiler or runtime router; a private table plus minimal renderer branches is easier to audit.

### Reuse managed ownership

Agent profiles use a new `custom-agent` managed source with `role_id` and `definition` or `prompt` component. Exact target validation derives the only legal path from the tool metadata and role. Existing plan/commit/drift/deselection behavior applies unchanged. Selecting all supported hosts produces 48 definitions plus two Vibe prompts.

No new user configuration is added: selecting a supported tool selects its native profiles. Unsupported tools and the shared `agents` target receive none.

## Risks / Trade-offs

- [Host formats evolve independently] → Keep formats in one table and validate every rendered document with host-appropriate structural tests.
- [Prompt-only restrictions are weaker on some hosts] → Apply native deny controls where available and retain the same explicit contract in every prompt.
- [Reviewer can technically write beyond evaluated files on hosts without path-scoped permissions] → Limit its declared authority and validate outputs in Navigate; do not claim enforcement the host cannot provide.
- [Native delegation may not improve every task] → Keep recommendations advisory and avoid a behavioral-quality claim or benchmark.

## Migration Plan

`init` and `update` add the new managed files for selected supported tools. Later deselection or removal uses the existing hash-owned cleanup and drift preservation. Rollback removes the desired profiles and lets the same reconciliation retire only clean managed files.
