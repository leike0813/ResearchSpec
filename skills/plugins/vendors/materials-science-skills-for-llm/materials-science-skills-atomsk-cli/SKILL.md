---
name: materials-science-skills-atomsk-cli
description: Design and review Atomsk structure-generation, transformation, and format-conversion workflows.
license: MIT
compatibility: Requires a user-preinstalled Atomsk executable and local input files. ResearchSpec does not install binaries or retrieve examples.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: atomsk-cli
  researchspec-role: semantic-helper
---

Use Atomsk for reproducible crystal construction, supercells, orientation,
defects, selections, transformations, and file-format conversion. Begin by
confirming the input structure, coordinate convention, units, target format, and
desired transformation order.

Build the command incrementally and explain each option. Prefer a new output path
and preserve the source file. Before running, show the exact command and files it
will read and write; obtain confirmation when an existing path could be replaced
or the operation is computationally significant. Validate atom counts, cell
vectors, species, periodicity, and output format after conversion.

This package contains no HTML manual or quick-recipes dependency. Use only local
documentation supplied by the user when command semantics need verification.
