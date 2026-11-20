# ToolUniverse v1.5.10 Skill audit

The pinned source is `mims-harvard/ToolUniverse` at `6b50abef032a702554e2b34a4f592ee674f12f8f`. The root license remains Apache-2.0. `skill-audit.json` covers every directory with a `SKILL.md` directly under the canonical `skills/` tree. The plugin copies, upstream source runtime, and maintenance trees serve as evidence only.

The new inventory has 229 Skills. It adds 53 to the previous inventory and removes nine previously excluded maintenance Skills. The admission set has the same 130 IDs as v1.5.4. Of the other 99 entries, 20 are deferred research candidates, including three carried from the prior audit. The remaining entries cover setup, runtime and platform authority, or upstream maintenance. Every entry has an explicit disposition and Field classification or an unclassified reason. Production domain memberships come from ResearchSpec's domain catalog.

The audit records 245 candidate-to-candidate references. The converter policy retains all eight reviewed hard dependencies and classifies other references as related or routing context. The projection keeps package-local research instructions and resources under the existing ResearchSpec authority boundary.

See [upstream analysis](artifacts/upstream-analysis.md) for evidence about changed tool contracts and [semantic review](05-semantic-review.md) for their treatment in generated capabilities. No upstream scripts, credentials, model services, or live API responses were used to validate this release.
