## Why

ResearchSpec can freeze normalized Annotation Sets and trace them through
revision, but users still have to prepare strict JSON candidates before that
flow begins. Human manuscript review is naturally free-form: users annotate a
copy in their own style, directly rewrite passages, mix comments with
CriticMarkup, or provide feedback in conversation. Requiring a fixed Markdown
annotation syntax would move semantic interpretation into brittle parsers and
undercut the intended Agent-assisted experience.

## What Changes

- Add a mutable, non-authoritative manuscript annotation intake session that
  preserves the registered base, review copy, raw feedback snapshots,
  mechanical review delta, Agent interpretation draft, and candidate path.
- Add a review-copy generator with optional document/section or dense block
  annotation slots. Slots are suggestions only; users may ignore, delete, or
  replace them with any annotation style.
- Add an editor-neutral TypeScript adapter API that captures Markdown files and
  conversation feedback, derives block-aware mechanical differences, validates
  Agent interpretations, and materializes deterministic Annotation Set
  candidates without invoking a model or mutating workflow authority.
- Upgrade newly produced Annotation Sets to v2 with hash-bound raw-source and
  delta provenance while retaining Annotation Set v1 compatibility.
- Extend `instructions annotation:<id>` with bounded intake working paths and
  update Navigate and ARSU producer guidance to place free-form recognition and
  ambiguity handling with the Host Agent.
- Package the public adapter API and declarations without adding a top-level
  command, Skill, workflow stage, or runtime dependency.
- Defer VS Code, GitHub Review, DOCX, ODT, LaTeX, and PDF clients; they can reuse
  this headless intake API in later changes.

## Capabilities

### New Capabilities

- `manuscript-annotation-intake-adapters`: Review-copy generation, mutable
  intake sessions, raw-source capture, mechanical deltas, Agent interpretation
  validation, and public adapter API behavior.

### Modified Capabilities

- `manuscript-annotation-system`: Add Annotation Set v2 provenance while
  retaining v1 compatibility and the existing authority boundary.
- `cli-interface`: Advertise bounded intake paths through the existing
  annotation instructions selector without changing the command surface.
- `artifact-submit`: Validate and bind v2 raw-source provenance during
  human-confirmed Annotation Submit.
- `companion-skills`: Route free-form manuscript review through the shared
  intake and Agent interpretation contract.
- `arsu-converter`: Project the same intake boundary into Academic Paper and
  Pipeline producer guidance.
- `arsu-user-model-acceptance`: Exercise free-form review intake and v2
  registration through packaged public interfaces.

## Impact

The change affects annotation contracts and lifecycle validation, artifact and
coverage checks, CLI instruction packets, a new public TypeScript entrypoint,
Navigate and converter-owned ARSU guidance, package verification, runtime
documentation, and annotation user-journey tests. It adds no dependency and
leaves the seventeen top-level commands, fixed Skill surface, patch authority,
Gate authority, and registered manuscript bytes unchanged.
