# Non-Native Vendor Skill Standard

## Purpose

This standard governs Skills authored from upstream projects that do not provide
a production-ready Open Agent Skill. It currently applies to HistAgent,
FinRobot, and Materials-Science-Skills-For-LLM. It does not require rewrites of
native Skill upstreams such as ToolUniverse or Scientific Agent Skills.

The output is a ResearchSpec-maintained Skill, not a wrapper around the upstream
repository. A target Agent must be able to understand the task, choose the next
action, use any packaged implementation, and recognize completion or failure
from the reviewed Skill tree alone.

## Source And Architecture Decision

Before writing files, record the upstream evidence, preserved capability,
excluded behavior, license basis, authority boundary, expected inputs and
outputs, and known failure modes. Then select the lowest sufficient thickness:

| Layer | Use it when | Required result |
| --- | --- | --- |
| Baseline | Always | Complete Agent-executable instructions in `SKILL.md` |
| Script-assisted | Deterministic work benefits from a bundled command | Documented, portable command with honest dependencies and failure handling |
| Stateful | Work must resume across stages or context loss | Skill-local state authority, gates, resume procedure, and completion rule |
| Resource-backed | Execution consumes templates, prompts, tables, adapters, or data | Exact resource path and point of use in `SKILL.md` |

These layers are orthogonal. A stateful Skill may also be script-assisted and
resource-backed. Do not add an extension merely to make the tree look complete.

## Complete `SKILL.md` Contract

The main file is the runtime controller. It must contain all information that
an Agent needs on the ordinary path and every non-negotiable rule:

1. Frontmatter with a directory-matching kebab-case `name` and a description
   that states both capability and trigger conditions.
2. Purpose, supported outcomes, near-miss boundary, and behavior that remains
   outside the Skill.
3. Inputs, prerequisites, source discovery, dependency ownership, and the
   conditions that require user clarification.
4. The first action and an ordered main workflow. Each step identifies its
   input, semantic or deterministic action, produced evidence or artifact, and
   exit condition.
5. Mode, branch, or state routing when more than one path exists.
6. Hard constraints, authority, side effects, credential behavior, network or
   filesystem access, overwrite policy, and confirmation points.
7. A clear responsibility boundary: the Agent performs semantic judgment;
   scripts perform deterministic parsing, validation, transformation, state,
   hashing, and rendering.
8. Output contents, provenance expectations, validation, delivery, and the
   definition of done.
9. Failure classification and recovery. The Agent must know when to retry,
   request information, use an alternate reviewed mechanism, preserve partial
   work, or stop.
10. At least one representative happy path and one near-miss or failure case.
11. Direct reference routes with explicit read conditions, if references exist.
12. For every bundled script, its path, invocation time, minimal command,
    inputs, outputs or side effects, dependencies, and failure behavior.

Headings may be made more domain-specific, but the final main file must retain
these semantics. The shared validator uses the canonical scaffold headings for
new conversions so omissions are visible and consistent.

## Progressive Disclosure

`references/` is optional. Create a reference only when detailed material would
consume significant main-context capacity and is not needed on every ordinary
invocation. Suitable content includes:

- long stage playbooks;
- large domain tables or controlled vocabularies;
- extensive worked examples and anti-examples;
- external tool or file-format detail used by one mode;
- detailed prompt or adapter documentation;
- lengthy recovery catalogs.

Every reference must be linked directly from `SKILL.md` with language such as
“Read `references/collation-cases.md` when two witnesses conflict.” The main file
must already state the governing constraint and the ordinary decision rule.
References may explain or illustrate that rule, but cannot introduce its only
copy.

Do not create references for short prerequisite lists, one-paragraph output
rules, universal safety constraints, script invocation summaries, or other
material that belongs in the main path. Do not use nested reference chains. A
hash-bound reviewer, rather than a line-count threshold, decides whether each
reference saves meaningful context.

## Capability Implementation Map

Each advertised capability has exactly one primary implementation mechanism in
the maintainer definition:

- `agent-procedure`: `SKILL.md` contains a complete semantic procedure with
  decision points, expected output, and failure behavior.
- `bundled-script`: the tree contains the deterministic implementation and the
  main file contains its concrete invocation contract.
- `bundled-resource`: the tree contains the resource and the main file names its
  exact use point and expected contribution.
- `external-tool`: the main file names the user-configured tool or service,
  required configuration, authority and data boundary, expected result, and
  recovery when unavailable.

Provider-neutral does not mean implementation-free. The Skill must either carry
the implementation or tell the Agent how to use a real user-configured one. It
must not say only “use an appropriate provider,” “analyze the source,” or “run
the workflow” and leave the actual capability to the host.

An instruction-led capability can be executable without Python. Conversely, a
Python file does not prove executability if the Skill omits when and how to call
it or expects undeclared dependencies.

## Scripts, Resources, And Schemas

Use scripts for deterministic actions, not for historical interpretation,
financial judgment, scientific reasoning, summarization, or other semantic
work. Every formal command must:

- be included in the published tree;
- avoid repository-local imports and paths;
- declare user-managed commands, modules, services, and versions honestly;
- avoid automatic installation or credential discovery;
- expose file writes, network calls, process execution, destructive behavior,
  and expensive work before execution;
- provide a representative offline or mocked copied-tree test when execution is
  part of admission.

Use `assets/` only for resources consumed during execution. A JSON Schema is
valid when a bundled command or resource actually consumes it and `SKILL.md`
documents that use. It is not evidence of executability by itself.

ResearchSpec has no generic Skill runner contract. Do not add or require
`runner.json`, `RUNTIME.json`, `input.schema.json`, `output.schema.json`,
`parameter.schema.json`, fixed stdout envelopes, doctor commands, or validators
merely to imitate another project's normalization protocol. A future explicit
ResearchSpec capability may define such a consumer; until then these names and
shapes have no runtime authority here.

## Distribution And Review

Every published vendor-derived tree retains the Skill-level license, required
notices, and immutable provenance or derivation evidence. These files support
distribution and review; they are not execution instructions.

The maintainer validator checks observable structure and emits stable diagnostic
codes. It cannot decide that prose is scientifically adequate or genuinely
executable. Production admission therefore also requires a human review bound
to the hash of the complete generated tree. The reviewer confirms:

- another Agent can perform the advertised capability from the tree;
- the workflow and failure paths are detailed enough for the chosen thickness;
- references save context and contain no unique hard constraints;
- all dependencies, providers, permissions, and side effects are honest;
- examples anchor the intended and near-miss behavior;
- provenance, license, safety adaptations, and excluded upstream content match
  the source audit;
- the tree remains usable when copied outside this repository.

## Authoring And Converter Flow

1. Audit the upstream and freeze capability, source, license, and safety
   decisions.
2. Choose the baseline and necessary extensions.
3. Copy the authoring scaffolds into a vendor-owned source tree and replace all
   placeholders with domain-specific instructions.
4. Declare each capability implementation and every optional reference route in
   the maintainer definition.
5. Validate the complete source tree before preview generation.
6. Generate only deterministic metadata or reviewed adaptations; do not compose
   `SKILL.md` from generic prose fragments.
7. Run representative copied-tree checks for included commands and state.
8. Bind human approval to the complete generated-tree hash before admission.

The shared standard is opt-in during migration. It is not a global registry gate
for existing vendor trees until their dedicated changes adopt it.
