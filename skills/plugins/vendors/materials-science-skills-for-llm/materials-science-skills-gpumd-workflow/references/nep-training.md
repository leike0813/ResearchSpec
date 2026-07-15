# NEP Training & Prediction (`nep`)

## Inputs
- `nep.in` — model & optimizer settings (cutoff, descriptor order, loss weights, batch size, learning rate, epochs, regularization, optional dipole/polarizability flags).
- `train.xyz` — required; extended XYZ frames with **lattice**, **energy**, **properties=species:S:1:pos:R:3:force:R:3** (plus optional `virial`, `stress`, `weight`, `dipole`, `pol`, `bec`). Units: Å, eV, eV/Å.
- `test.xyz` — optional; same format for validation.

## Typical `nep.in` skeleton
```text
general cutoff 6.0 type 2 1  # cutoff (Å); element list (here Si)
model 4 18 2                  # example descriptor/order settings
loss energy 1.0 force 1.0 virial 0.01
optim batch 32 lr 0.001 steps 50000
output_freq 100               # write metrics every 100 steps
```
Adjust fields to match the target system; see GPUMD manual section `nep/input_parameters` for full options.

## Run commands
- Train: `path/to/nep` inside the folder containing the three inputs. Uses all visible GPUs; set `CUDA_VISIBLE_DEVICES` to limit.
- Predict only: add `predict 1` in `nep.in` (or provide `predict.in`) and run `nep` to write descriptor/energy/force predictions for provided xyz.

## Key outputs to monitor
- `loss.out` (append): total loss + per-term RMSE over generations.
- `nep.txt`: final potential to use with `gpumd` (`potential nep.txt`).
- `nep.restart`: resume training.
- `{energy,force,virial,stress,dipole,polarizability}_{train,test}.out`: target vs predicted comparisons.
- `descriptor.out`: descriptors for training set in prediction mode.

## Health checks
- Stable decreasing `loss.out`; force RMSE should match target accuracy.
- Spot-check `energy_test.out`/`force_test.out` columns for bias.
- Validate `nep.txt` by running a short `gpumd` simulation with `dump_observer` to compare multiple models if you have an ensemble.
