# ARSU User Usage Model v0.1 Acceptance

This acceptance layer verifies the canonical user model through the packaged ResearchSpec CLI and installed Agent surface. It complements focused unit tests; it does not introduce a runtime capability or simulate academic quality.

## Authority Boundary

- Every authoritative workflow mutation is executed by a fresh `dist/src/cli/main.js` process.
- The harness may create minimal text or binary candidates only at paths returned by `instructions`, matching the role of an ARSU producer.
- Start, Submit, Gate, Decision, Advance, handoff, and pack writes use complete dry-run payloads followed by the identical hash- or plan-bound execution.
- Tests never import core planners to perform transactions and never edit state, artifact registry, receipts, Gate ledger, or Decision ledger.
- ForgeCode is used for delivery assertions so acceptance never writes shared-global prompts.

## Stable Journeys

The suite exposes eleven stable IDs: `bootstrap`, `vague-routing`, `expert-direct-route`, `standalone`, `pipeline`, `parallel-join`, `gate-challenge-override`, `revision-round`, `resume`, `context-export`, and `terminal-completion`.

The authoritative requirement/scenario mapping is [the traceability manifest](../tests/fixtures/arsu-user-model-traceability.json). This document deliberately does not duplicate that matrix.

## Verification

Run:

```bash
pnpm test
pnpm lint
pnpm arsu:check
pnpm arsu:idempotence
openspec validate --specs --strict --no-interactive
```

Acceptance is complete only when the journey suite, exact traceability check, all OpenSpec verification dimensions, and the full repository validation set pass. A journey failure must be repaired in its owning implementation; weakening the expected user model or adding a test-only state bypass is not an acceptable fix.
