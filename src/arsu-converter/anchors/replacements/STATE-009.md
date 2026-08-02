### ResearchSpec Current Owner

Replacement scope: `STATE-009` for `shared`.

Treat any external state bundle as an ordinary immutable input file. Record only
its current role, type, path, purpose, and limits in the consuming subflow's
handoff. Do not copy its state fields into the current control or infer a Gate,
Decision, checkpoint, transition, or completion result from it.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
