---
name: plugin-scientific-agent-skills-pennylane
description: "Builds and differentiates PennyLane quantum circuits, hybrid PyTorch or JAX models, molecular VQE and QAOA workflows. Use for variational quantum algorithms, quantum machine learning, simulator validation, and moving validated circuits to provider plugins. For hardware-specific compilation use qiskit or cirq; for open-system dynamics use qutip."
metadata:
  capability_id: plugin-scientific-agent-skills-pennylane
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: Apache-2.0
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

# PennyLane

## When to use

Use PennyLane to optimize parameterized circuits, build hybrid quantum-classical
models, estimate molecular energies, or compare a validated circuit across devices.
This skill targets stable PennyLane 0.45.1. The local examples use small synthetic
systems; successful optimization does not establish quantum advantage, molecular
accuracy, or hardware fidelity.

## Installation

Create a dedicated environment; provider plugins and compiler dependencies should
be resolved separately from unrelated scientific packages:

```bash
uv venv --python 3.13 .venv-pennylane
uv pip install --python .venv-pennylane/bin/python "pennylane==0.45.1"
```

PennyLane 0.45 requires NumPy 2+. Core installation includes Lightning. For ML,
use the tested JAX 0.7.1/JAXlib 0.7.1 pair or PyTorch; do not assume the latest JAX
is supported by this PennyLane release. See [device setup](references/devices_backends.md)
for optional plugin versions and their verification limits.

## Workflow

1. Fix the problem convention: feature ordering and label encoding for ML;
   Hamiltonian sign for optimization; units, charge, multiplicity, basis, active
   space and mapping for chemistry.
2. Build a small analytic `default.qubit` circuit. Keep the quantum function
   separate from the QNode when reusing it on another backend.
3. Check a known value and a gradient against an analytic or finite-difference
   result before training. Use trainable `pennylane.numpy` arrays for Autograd,
   framework-native tensors for Torch/JAX.
4. Optimize while recording objective, gradient norm, seeds, ansatz shape and
   package versions. `step_and_cost` returns the cost **before** its update;
   evaluate the objective again for final reporting.
5. Validate independently: held-out examples and classical baselines for ML;
   particle number and a sector-appropriate classical reference for VQE;
   enumerated small instances for QAOA.
6. Introduce finite shots/noise, report uncertainty, inspect decomposed resources,
   then select a current accessible hardware backend and execution budget.
   Plugin portability does not guarantee identical gates, measurements or gradients.

## Quick start: value, gradient and optimization

This self-contained example is executed by the skill's tests.

```python
import pennylane as qml
from pennylane import numpy as np

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev, interface="autograd", diff_method="backprop")
def energy(theta):
    qml.RY(theta, wires=0)
    return qml.expval(qml.Z(0))

theta = np.array(0.3, requires_grad=True)
assert np.allclose(energy(theta), np.cos(theta))
assert np.allclose(qml.grad(energy)(theta), -np.sin(theta))
opt = qml.GradientDescentOptimizer(stepsize=0.2)
for _ in range(80):
    theta = opt.step(energy, theta)
final_energy = float(energy(theta))
assert final_energy < -0.999
print(f"[OK] final expectation = {final_energy:.6f}")
```

## Load the relevant reference

- [Getting started](references/getting_started.md): QNodes, shots, random streams,
  trainability, batched parameters and simulator selection.
- [Quantum circuits](references/quantum_circuits.md): controls, measurement feedback,
  wire ordering, QFT, transforms and current resource access.
- [Quantum ML](references/quantum_ml.md): executed TorchLayer and JAX training,
  stable classifier loss, feature scaling and evaluation.
- [Quantum chemistry](references/quantum_chemistry.md): H2 UCCSD, units, particle
  sector checks, dipoles, active spaces, geometry and excited-state caveats.
- [Devices](references/devices_backends.md): simulators, provider contracts,
  credentials, current target discovery and source-only integration boundaries.
- [Optimization](references/optimization.md): gradient checks, SPSA, QNG, MaxCut
  sign and exact QUBO-to-Ising conversion.
- [Advanced features](references/advanced_features.md): templates, noise,
  parametrized Hamiltonian evolution, Catalyst and error-correction examples.

## Failure checks

- Samples/counts require finite shots; states require a supporting simulator.
  Use `qml.set_shots` on the QNode rather than mutating device shots.
- Mid-circuit measurement values are symbolic. Use `qml.cond`, not Python `if m`.
- `qml.specs` in 0.45.1 returns `CircuitSpecs`; access `.resources`, not obsolete
  top-level dictionary keys. Record the transform level and account for split tapes.
- `qml.qaoa.maxcut` produces **negative cut size**. Minimize it directly.
- A zero/flat gradient can mean an unused parameter, symmetry, saturated encoding,
  shot noise or differentiation failure. It does not by itself diagnose a barren plateau.
- Chemistry geometry defaults to bohr. State units explicitly; an unconstrained
  ansatz can leave the intended electron/spin sector.
- A simulator seed initializes a random stream. Successive executions consume new
  draws; reconstructing an equally seeded device reproduces the stream.

## Upstream references and verification

Reviewed the [stable documentation](https://docs.pennylane.ai/en/stable/),
[0.45.1 source](https://github.com/PennyLaneAI/pennylane/tree/v0.45.1),
[deprecations](https://docs.pennylane.ai/en/stable/development/deprecations.html),
and linked per-topic API pages. Local simulator/ML examples have numerical tests.
Provider hardware, GPU, Catalyst native compilation and external chemistry backends
are explicitly illustrative/source-checked, with no authenticated jobs executed.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `sas-references-advanced-features.md` from `references/advanced_features.md`.
- Load knowledge ID `sas-references-devices-backends.md` from `references/devices_backends.md`.
- Load knowledge ID `sas-references-getting-started.md` from `references/getting_started.md`.
- Load knowledge ID `sas-references-optimization.md` from `references/optimization.md`.
- Load knowledge ID `sas-references-quantum-chemistry.md` from `references/quantum_chemistry.md`.
- Load knowledge ID `sas-references-quantum-circuits.md` from `references/quantum_circuits.md`.
- Load knowledge ID `sas-references-quantum-ml.md` from `references/quantum_ml.md`.

Follow the reviewed procedure and its resource guidance. ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_scientific_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
