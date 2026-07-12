## Why

The generated ARSU entrypoints currently lose one stable patch-protocol exception and retain seven operational references to upstream-only files. Structural validation still passes, so agents can receive incomplete or unusable instructions without converter diagnostics.

## What Changes

- Preserve stable prohibitions, exceptions, and applicability boundaries when audited ARS spans are replaced with ResearchSpec contract guidance.
- Replace legacy phase-boundary enforcement references in the public skill entrypoints with ResearchSpec workflow/state boundaries.
- Reject unresolved operational `docs/` and root `scripts/` code-span paths in the four public ARSU entrypoints.
- Keep cross-skill copies on the same anchor replacement path while reserving routing descriptions and Contract Preflight for the four public entrypoints.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-converter`: Strengthen semantic replacement integrity, public-entrypoint reference validation, and cross-skill replacement guarantees.

## Impact

- Affects ARSU anchor definitions and replacement assets, generated-output validation, converter tests, and regenerated `skills/arsu` artifacts.
- Does not change the public ResearchSpec CLI, ARSU route descriptions, runtime schemas, or dependency set.
