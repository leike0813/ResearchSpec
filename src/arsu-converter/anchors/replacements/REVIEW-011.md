### ResearchSpec Current Owner

Replacement scope: `REVIEW-011` for `academic-paper`.

**IRON RULE — advisory integrity boundary:** standalone `rebuttal-audit` may
reuse comment parsing, but it remains outside Stage 4.5 integrity and produces
only an advisory response-letter QA artifact. Return the coverage table, gap
list, tone/evidence risks, and suggestions for the producing subflow to record
in
`researchspec/subflows/<instance>/handoff.md`. It MUST NOT emit verified
commitment status, apply a draft patch, mark a delivery package ready, or
write ResearchSpec authority files. If its findings imply a change in
accepted response strategy or claim scope, propose that change and wait for a
human decision recorded through
`researchspec/subflows/<instance>/control.yaml`; the audit itself never
certifies acceptance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
