## Why

The v2 ARSU anchor pipeline still renders replacements from shared structural
templates. Even when a template is nominally used by one anchor, the renderer
adds the same title, section layout, and mutation-boundary boilerplate, so the
generated text can discard useful local instructions or flatten role-specific
semantics. Anchor replacement must instead be authored and reviewed at the
individual upstream occurrence that it replaces.

## What Changes

- **BREAKING** Replace anchor schema v2 and replacement profile v2 with a v3
  one-to-one model: every anchor receives a stable domain-prefixed id and every
  replaceable anchor owns one complete Markdown replacement body.
- Remove `template_id`, the shared template registry, hash-derived marker ids,
  and renderer-injected headings or mutation sections.
- Store semantic metadata on each replaceable anchor and derive its body path
  from the stable anchor id.
- Keep diagnostic anchors numbered but body-free; retain decisions remain
  separate coverage records.
- Preload and validate all replacement bodies before generated output is
  touched, then wrap exact body content only with compact id markers.
- Add a five-anchor before/after calibration gate before the remaining bodies
  are authored and ARSU output is regenerated.
- Preserve the machine manifest and separate human-readable complete
  before/after report.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-converter`: Replace shared semantic templates with stable one-to-one
  anchor identities, dedicated Markdown replacement bodies, exact rendering,
  and v3 validation/reporting.

## Impact

- Anchor DTOs, registry parsing, matching plans, marker validation, manifest
  records, reports, tests, and converter compatibility metadata change to v3.
- Fifty converter-owned Markdown replacement assets are introduced under the
  anchor data directory; the v2 template registry is deleted.
- All generated `skills/arsu` output is atomically regenerated after semantic
  calibration and complete replacement-body authoring.
- No public ResearchSpec CLI commands or runtime LLM dependencies are added.
