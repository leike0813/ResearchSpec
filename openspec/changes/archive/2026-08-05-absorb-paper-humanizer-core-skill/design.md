# Design

`paper-humanizer` owns document parsing, sentence statistics, protected-region handling, review diagnostics, candidate validation, and round-trip serialization. Runtime state is written below a subflow `work/paper-humanizer/` directory; `control.yaml`, Gates, Decisions, and transitions remain ResearchSpec-owned.

The route catalog uses an owner registry so standalone profiles are selected by route owner instead of a `review-response:` prefix. The Paper Humanizer profile contains two one-shot entries: `review` has no formal Gate; `full` requires `paper-humanizer-acceptance`.

The packaged Skill is authored and checked locally. No Python dependency, upstream executable, network call, or additional public CLI command is introduced.

