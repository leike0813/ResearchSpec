# Patent fixed-capability packages: attribution notice

These packages adapt the `patent-disclosure-skill` project by handsomestWei.

## Upstream

- Project: patent-disclosure-skill
- Pinned revision: 5073d3d837a5d139ef2bc763c9dd46bb9605df84
- License: MIT, Copyright (c) 2026 handsomestWei
- Full license text: `LICENSE` (shipped with this package)

Reviewed tool and resource sources are copied from the pinned revision. Adapted
tools keep their upstream semantic behavior; each adaptation is recorded by the
ResearchSpec patent authoring manifest.

## Third-party components

- mermaid 11.4.1 (MIT), bundled at `tools/vendor/mermaid.min.js` when present.
  Full license: `tools/vendor/MERMAID_LICENSE`. Source:
  https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js
- three.js r170 (MIT), bundled under `web/vendor/` when present. Full license:
  `web/vendor/THREE_LICENSE`. Source:
  https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js

ResearchSpec distributes static content only and never installs or executes
these components during conversion, installation, or checking.
