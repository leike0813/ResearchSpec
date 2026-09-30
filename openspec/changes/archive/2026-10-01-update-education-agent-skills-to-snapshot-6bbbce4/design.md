# Design

## Context

See proposal.md. The two upstream changes that reach production are the added
root license notice and the corrected evidence wording in two learner Skills.
Everything else in the 40-path upstream diff is installer, MCP runtime, test,
dependency or project documentation surface that ResearchSpec audits but never
distributes.

## Goals / Non-Goals

Keep a reviewed, source-bound static projection whose unaffected bytes survive an
incremental update, and make the approval boundary of an incremental update
explicit. No upstream script execution, dependency installation, credential
configuration or external service access is part of maintenance.

## Decisions

The audit identity, production policy and evidence paths derive from the audit
module instead of repeated release literals, so the pin lives in one place.
Admission decisions carry a per-Skill `source_release` and `source_revision`.
When a Skill's source hash still matches a retained previous audit and the bytes
at that revision verify, the decision keeps the earlier identity; otherwise it
takes the current pin. The notice and frontmatter read that per-Skill value, so a
global pin bump rewrites only the Skills whose content actually changed.

The extension generator reads release, revision and anchor from the vendor
bundle, and all generated writes are content-conditional, so regenerating an
unchanged projection leaves both bytes and modification times alone.

Every incremental update produces a full preview whose exact aggregate must be
approved before production conversion. The review decision binds the production
policy hash, candidate aggregate, approver and time; conversion refuses to write
when any of them disagree. The previous anchor stays readable as history.

The root license notice is treated as source authorization for Gareth Manning's
own content. It does not clear embedded original frameworks or separately
attributed third-party content, so the 19 and 10 exclusion sets are unchanged
and the audit keeps a blocking license-scope finding.

## Risks / Trade-offs

Retained identity means one checkout intentionally carries more than one
reviewed identity. Conversion input stays the single new pin; identity is only a
byte-stability signal, and a Skill whose upstream bytes moved is never given the
old identity.

Requiring a fresh approval adds a step to every incremental update. Reusing the
previous approval would let content changes ship without anyone reviewing the
new aggregate, so the gate stays closed by default and is opened only by the
exact hash.

The corrected evidence wording is verified against the cited PNAS paper for the
statements it makes. That check is scoped to those declarations; it does not
upgrade claim support for the other works.
