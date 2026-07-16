# DP-GEN parameter and machine files

Read this file only while authoring or auditing concrete DP-GEN stage files. The
main file remains authoritative for scientific advancement, confirmation,
credentials, scheduler authority, retries, and completion.

## Parameter-file review

Record the material system and type map; initial and accumulated data; model
ensemble and training settings; exploration systems and thermodynamic ranges;
model-deviation definition and lower/upper thresholds; selection caps and
sampling; labeling calculator, precision and convergence; iteration limits; and
the evidence required to stop.

Every referenced file or directory must exist in the user-approved workspace.
Paths must not contain credentials or site-private assumptions intended for
publication. Preserve the exact parameter file with the iteration result.

## Machine-file review

For each stage record its configured command, local/remote context, machine or
queue, resource request, concurrency, group size, work and result paths, upload
and download behavior, container/module assumptions, and retry policy. Treat
machine files as user-owned operational configuration; do not synthesize
credentials, endpoints, accounts, or scheduler directives.

## Stage contracts

| Stage | Inputs | Evidence before advancing |
| --- | --- | --- |
| Initialize | structures, provenance, labels, type map | readable data, consistent units/species, explicit split |
| Train | accumulated data, ensemble configs | all intended models, logs, checkpoints, held-out behavior |
| Explore | models, systems, thermodynamic plan | completed trajectories, physical sanity, model deviations |
| Select | deviation records, thresholds, caps | accepted/rejected ledger and coverage slices |
| Label | selected structures, calculator settings | complete outputs, convergence, atom mapping, consistent precision |
| Merge | accepted labels, dataset ledger | hashes, deduplication, split isolation, iteration provenance |

## Recovery catalog

- Training failure: preserve every ensemble member; do not silently continue
  with fewer models when deviation depends on ensemble disagreement.
- Exploration instability: distinguish out-of-domain discovery from numerical or
  setup failure before changing the region.
- Label failure: retain the selected configuration and first relevant error;
  changes to calculator precision require review.
- Scheduler failure: separate infrastructure state from scientific state and ask
  the user to choose resubmission or a configured alternative.
- Partial iteration: do not merge incomplete or inconsistent labels merely to
  make the next iteration runnable.
