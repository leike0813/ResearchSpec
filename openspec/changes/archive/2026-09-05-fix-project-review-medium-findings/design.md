## Context

See proposal.md for the five review findings. The workspace is clean at `7cdb199`; the high-risk fixes and complete packaged technical journeys already exist. Current user-model authority is `docs/user/usage-model.md`.

## Goals / Non-Goals

Preserve runtime interfaces, reviewed vendor production bytes and immutable source audits. No package split, cache, new public command, maturity enum change, historical document rewrite or academic sign-off is needed.

## Decisions

- Use a shared repo-local maintenance module for repeated mechanical operations, with thin vendor entries retaining catalog identity, generator callbacks and vendor policies. Hash Buffer bytes; decode only when parsing text. Preserve semantic-review enforcement and deterministic ordering.
- Refresh the current affected anchor through its maintenance Skill. ToolUniverse's immutable audit JSON has no hash fields; only derived maintenance identities change. Document the old/new identity and reason in review evidence; do not modify immutable audit JSON/report or vendor production packages.
- Return the existing empty extension fields before extension loading when no plugin domain is selected. Selected-domain checks retain current validation. A general lazy registry or persistent cache is unnecessary for this reported case.
- Exclude the complete compiled vendor-converters tree: neither the public CLI nor annotation-intake import closure reaches it. Keep ARSU modules used by the runtime; the installed-package verifier protects the distribution boundary.
- Reference the canonical user model for duplicated rules; preserve machine scenario IDs and fixture schema identities. Track human corrections, resume attempts and successful resumes alongside existing quality scores. Technical fixtures and declared operational maturity do not sign off academic quality.

## Risks / Trade-offs

- Shared maintenance may alter derived hashes or reports: compare inputs, production bytes and generated outputs, explain intended hash differences, and check all six current anchors.
- Empty-selection short-circuit removes unused extension I/O only; selected domains retain existing scan cost. Record before/after measurements without brittle timing assertions.
- Tarball exclusions can break runtime imports: use the existing real installed-package minimal and pipeline journeys with fresh CLI processes.
- Real academic quality remains unverified: leave release checklist items unsigned and provide the current manual evidence contract.

## Rollout

Apply code and documentation together, synchronize the three delta specifications, run maintenance checks, project tests and the authorized installed-package verifier, and attach results to this change. No workspace migration or release action is performed.
