### ResearchSpec Current Owner

Replacement scope: `STATE-006` for `academic-pipeline`.

`researchspec/subflows/<instance>/control.yaml` is the sole runtime authority for
the selected pipeline or child instance. ARSU roles may inspect current context,
prepare outputs, recommend Gate verdicts, and propose transitions, but only the
ResearchSpec CLI validates and commits control changes.

### Write Access Control

| Role | May return | Must not do |
| --- | --- | --- |
| pipeline orchestrator | route, branch, and transition recommendation | edit a control or authorize a child |
| state tracker | progress summary and structured mutation proposal | persist lifecycle, Gate, Decision, or transition state |
| integrity and review roles | reports and Gate recommendations | confirm or advance a Gate |
| phase agents | declared boundary outputs and handoff updates | write another subflow's private work or control |

For a formal change, request current instructions, validate the profile and
actual handoff roles, obtain any required human confirmation, and execute the
single owning CLI action. Keep dialogue summaries and observer reports as
working material or explicit boundary files; they do not advance the frontier.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
