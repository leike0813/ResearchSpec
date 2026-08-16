## Context

Capability packages are authored by `src/arsu-converter/authoring` and registered under
`skills/capabilities`. Their IDs were a hierarchical taxonomy (`cap.design...`) that reads well as a
type system but is not a legal Open Agent Skills name. ResearchSpec already enforces kebab-case
Skill IDs for domain plugins via `SkillIdSchema`; this change applies the same rule to the bundled
capability registry.

## Decisions

### One identity across four surfaces

A capability package has exactly one identity string: manifest `capability_id`, registry
`source_path`, package directory name, and `SKILL.md` frontmatter `name`. The authoring renderer
already derives `name` from `capability_id`, and the registry now rejects any mismatch with
`source_path`. This removes the class of bugs where a package is referenced under one name and
projected under another.

### Prefix stays, dots become hyphens

The new name keeps the `cap-` prefix and converts the class segment into the first hyphenated
segment: `cap.design.research-question-formulation` becomes
`cap-design-research-question-formulation`. No semantic class information is lost; graph profiles
still encode node kind separately.

### Schema enforcement, not data convention

`CapabilitySkillIdSchema` is enforced in `capability-manifest` and reused by the bundled registry
entry schema, so a future dotted ID fails at authoring or registry load time rather than drifting
into generated output.

## Risks

- The ID rename is breaking for any external consumer that hard-coded dotted IDs. The project has no
  public contract for capability IDs and updates all internal references in the same change.
- Historical extraction artifacts and archived OpenSpec snapshots retain dotted references as
  provenance. They are hash-pinned historical records and are intentionally not rewritten.
