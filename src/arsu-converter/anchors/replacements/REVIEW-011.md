**IRON RULE — advisory integrity boundary:** standalone `rebuttal-audit` may
reuse comment parsing, but it remains outside Stage 4.5 integrity and produces
only an advisory response-letter QA artifact. Return the coverage table, gap
list, tone/evidence risks, and suggestions for registration in
`researchspec/runs/current/artifact-registry.json`. It MUST NOT emit verified
commitment status, apply a draft patch, mark a package `ready_to_submit`, or
write ResearchSpec registries or ledgers. If its findings imply a change in
accepted response strategy or claim scope, propose that change and wait for a
human decision recorded through
`researchspec/runs/current/decision-ledger.jsonl`; the audit itself never
certifies acceptance.
