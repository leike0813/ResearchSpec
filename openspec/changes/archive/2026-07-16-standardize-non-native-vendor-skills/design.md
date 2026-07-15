## Context

ResearchSpec converts two kinds of vendor sources. Native Skill upstreams already provide authored `SKILL.md` trees that can be preserved and reviewed. Non-native upstreams such as HistAgent, FinRobot, and Materials-Science-Skills-For-LLM provide applications, modules, prompts, or project documentation that must first be designed as Skills.

The current non-native converters encode their own output shapes. FinRobot assembles a shared contract and short fragments into uniform prose. The HistAgent draft goes further and treats `runner.json`, generic input/output schemas, a fixed JSON envelope, and several diagnostic files as mandatory. No ResearchSpec runtime consumes that protocol. Critical behavior is consequently split into short references while the user-visible `SKILL.md` remains too thin to direct execution.

The new standard is based on the complete main-path organization in `literature-digest` and the selective progressive disclosure used by `literature-translator`, `literature-explainer`, and `paper-drafter`. Their product-specific runner assets are evidence of a separate execution environment, not a contract to copy into ResearchSpec.

## Goals / Non-Goals

**Goals:**

- Define the minimum complete instruction contract for a non-native vendor-derived Skill.
- Preserve different Skill thicknesses through one baseline and optional script-assisted, stateful, and resource-backed extensions.
- Make each advertised capability traceable to a concrete execution mechanism.
- Make `references/` optional and context-saving while keeping all execution-critical rules in `SKILL.md`.
- Provide a maintainer-side validator and hash-bound human review boundary without creating a user runtime protocol.
- Record current HistAgent, FinRobot, and Materials gaps and a safe migration sequence.

**Non-Goals:**

- Rewriting or republishing HistAgent, FinRobot, or Materials Skills in this change.
- Applying mandatory rewrites to ToolUniverse, Scientific Agent Skills, or other native Skill upstreams.
- Adding a public CLI, runner, schema envelope, dependency installer, provider integration, or workflow authority.
- Proving semantic instruction quality through word counts or brittle full-text assertions.

## Decisions

### Use authored complete trees rather than prose assembly

The standard supplies authoring scaffolds, not converter fragments. A converter may copy, adapt, and validate a complete reviewed tree, but it SHALL NOT obtain its runtime instructions by concatenating a common contract with short capability fragments. This makes vendor-specific workflow, failure handling, authority, and examples reviewable together.

The baseline scaffold contains the sections every final Skill needs: purpose and scope; inputs and prerequisites; workflow; hard constraints; responsibilities; outputs and completion; failure handling; and examples. Authors remove unused sections and all authoring placeholders before admission.

### Keep critical instructions in `SKILL.md`

`SKILL.md` owns the first action, main workflow, mode or state routing, non-negotiable constraints, side effects and authority, LLM/script boundary, output semantics, completion definition, and failure recovery. A reference may expand a rule with long examples, domain tables, stage playbooks, or external interface detail, but it cannot introduce the only copy of mandatory behavior.

Every reference is optional, substantial enough to save main-context capacity, directly linked from `SKILL.md`, and paired with an explicit read condition. The validator checks routing and declared read conditions; the hash-bound human review decides whether the material genuinely belongs outside the main file. No byte or line threshold substitutes for that decision.

### Model thickness as baseline plus orthogonal extensions

All non-native vendor Skills use the baseline. They add only the extensions their behavior needs:

- `script-assisted`: deterministic bundled commands with documented invocation, input, output, side effects, dependencies, and failure handling.
- `stateful`: Skill-local state with an explicit authority boundary, transitions, gates, resume procedure, and completion condition. Skill-local state never becomes ResearchSpec workflow authority.
- `resource-backed`: templates, data, prompts, or adapters that are named at their exact point of use.

An instruction-led Skill may use only the baseline when an Agent can execute the capability from complete semantic procedures. Python and machine JSON are not prerequisites for that class.

### Bind capability claims to execution mechanisms

The maintainer-only `NonNativeVendorSkillDefinition` records the Skill ID, selected extensions, reference routes, and capability implementations. Each capability selects exactly one primary mechanism:

- `agent-procedure`: a concrete procedure anchored in `SKILL.md`;
- `bundled-script`: a packaged script and an invocation shown in `SKILL.md`;
- `bundled-resource`: a packaged resource and its documented use point;
- `external-tool`: a named user-configured tool or service with authority, dependency, and failure guidance in `SKILL.md`.

The definition is converter input and review evidence. It is not emitted as a Skill runner manifest or consumed during user invocation.

### Validate stable structure and leave semantic sufficiency to review

The shared validator returns diagnostics with stable codes instead of asserting complete prose. It checks file uniqueness and safe relative paths, final frontmatter, required main-file sections, placeholders, capability anchors, reference routing, bundled script/resource existence and documentation, undeclared executable files, distribution metadata, and unsupported private runtime conventions.

`runner.json` and `RUNTIME.json` are rejected for this standard. Generic `input.schema.json`, `output.schema.json`, or `parameter.schema.json` files are rejected when they merely recreate the absent private runner convention. A domain schema is allowed only when a bundled script or resource actually consumes it and the Skill documents that use.

Automated validation is followed by existing per-vendor complete-tree hash review. The reviewer evaluates instruction detail, examples, reference placement, dependency honesty, portability, and whether the advertised capability is truly executable.

### Stage migration without breaking current publication

The standard records current gaps without applying the validator as an unconditional production-registry gate. Migration order is HistAgent first, FinRobot second, and Materials third. `ingest-histagent` remains paused; it must be redesigned and re-reviewed against this standard before work resumes. FinRobot and Materials receive separate future changes. Native Skill upstreams remain under their existing preservation and adaptation rules.

## Risks / Trade-offs

- **[Structural checks are mistaken for semantic proof]** → Emit stable diagnostics only for observable structure and require hash-bound human approval for instruction sufficiency.
- **[Templates create another family of generic wrappers]** → Treat them as authoring scaffolds, reject placeholders, and prohibit fragment concatenation as the final instruction source.
- **[References duplicate or hide rules]** → Require direct routing and human review that every hard constraint remains in `SKILL.md`.
- **[The validator breaks admitted vendors immediately]** → Keep adoption opt-in per migration change and publish a baseline report rather than changing the current registry gate.
- **[A legitimate schema is confused with the private protocol]** → Allow schemas only when a concrete bundled consumer and documented use exist; reject the unconsumed convention.

## Migration Plan

1. Add the OpenSpec delta, maintainer standard, scaffolds, typed definition, validator, and focused tests.
2. Assess current HistAgent draft, FinRobot production, and Materials production without changing their trees.
3. Update project guidance and validate the new change.
4. Replan and resume `ingest-histagent` only after adopting the standard and obtaining a new complete-tree review.
5. Migrate FinRobot and Materials through independent changes.

Rollback removes this unarchived change, shared authoring module, documentation, tests, baseline report, and guidance update. No runtime or published registry migration is involved.

## Open Questions

None.
