# Uni-Mol local workflow modes

Read this file only after selecting a mode. The main file owns resource
provenance, user confirmation, no-download/no-upload rules, output separation,
applicability, and completion.

## Representation extraction

Verify molecular identifiers, conformers and coordinate conventions; model
family/version; token/atom vocabulary; preprocessing; maximum size; batching;
device and precision; representation layer/pooling; and output-to-input mapping.
Store embeddings with stable molecular identifiers, conformer identity, model
checksum, layer/pooling choice, dtype and shape. An embedding is not a property
prediction or validated similarity metric by itself.

## Property inference

Verify the checkpoint's task, label definition, units, preprocessing, molecular
domain, architecture/runtime compatibility and output transform. Preserve raw
model output before inverse transforms or interpretation. Evaluate on an
appropriate held-out population and report calibration or uncertainty when the
model supplies it. Identify molecules outside training chemistry, size,
conformation or charge/spin scope.

## User-managed training

Use only the installed entrypoint and local version help to form a command.
Training plans must state dataset/split, target and units, model initialization,
checkpoint source, objective/metrics, batching, optimizer/schedule, stopping,
evaluation, device/precision, output/checkpoint directories and resume policy.

Common entrypoint families include `unicore-train`, `torchrun`-launched local
training, and a user-provided Uni-Mol Python/CLI entrypoint. Their flags and
schemas vary; do not copy a command across model generations without checking
the installed version and repository-local documentation supplied by the user.

## Data contracts

| Concern | Required evidence |
| --- | --- |
| Identity | stable molecule and conformer IDs; no silent row reordering |
| Structure | accepted molecular/coordinate format, atom order, charge/spin assumptions |
| Target | semantic definition, units, missing-value policy, transform |
| Split | group/scaffold/time policy, leakage checks, untouched test population |
| Model | source, license, checksum, architecture, task, preprocessing, vocabulary |
| Output | row mapping, shape, dtype, units/transform, raw and interpreted paths |

## Failure and anti-example cases

- Runtime and checkpoint architecture differ: stop rather than partially load
  weights without an explicit reviewed compatibility mechanism.
- Molecules exceed model limits or use unsupported atoms: report them separately;
  do not silently truncate or drop.
- Evaluation duplicates training scaffolds or conformers: invalidate the metric
  and redesign the split.
- A GPU error suggests an environment change: preserve logs and ask the user;
  do not install packages or switch images.
- A local command attempts remote model/data retrieval: stop before execution.
