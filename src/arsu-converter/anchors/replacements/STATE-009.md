### ResearchSpec Current Owner

Replacement scope: `STATE-009` for `shared`.

Treat any external state bundle as an ordinary immutable input file. Record only
its current role, type, path, purpose, and limits in the consuming run's
handoff. Do not copy its state fields into the current control or infer a Gate,
Decision, checkpoint, transition, or completion result from it.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `researchspec/runs/<run-id>/handoff.md`
