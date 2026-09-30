---
name: plugin-scientific-agent-skills-pymoo
description: "Multi-objective optimization framework. NSGA-II, NSGA-III, MOEA/D, Pareto fronts, constraint handling, benchmarks (ZDT, DTLZ), for engineering design and optimization problems."
metadata:
  capability_id: plugin-scientific-agent-skills-pymoo
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: MIT
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/custom_problem_example.py`, `scripts/decision_making_example.py`, `scripts/many_objective_example.py`, `scripts/multi_objective_example.py`, `scripts/single_objective_example.py`. The target Agent must inspect requirements and side effects before execution.

# Pymoo - Multi-Objective Optimization in Python

## Overview

Pymoo is a comprehensive Python framework for optimization with emphasis on multi-objective problems. Solve single and multi-objective optimization using state-of-the-art algorithms (NSGA-II/III, MOEA/D, SPEA2), benchmark problems (ZDT, DTLZ), customizable genetic operators, and multi-criteria decision making methods. Excels at finding trade-off solutions (Pareto fronts) for problems with conflicting objectives. Current stable release: **pymoo 0.6.1.6** (November 2025).

## Installation

```bash
uv pip install pymoo
```

For reproducible environments, pin a version: `uv pip install "pymoo==0.6.1.6"`.

**Dependencies:** NumPy (2.x compatible since 0.6.1.3), SciPy, matplotlib (visualization). Autograd is optional for gradient-based features (since 0.6.1.3).

**Documentation:** https://pymoo.org/ — LLM-friendly index: https://pymoo.org/llms.txt

## When to Use This Skill

This skill should be used when:
- Solving optimization problems with one or multiple objectives
- Finding Pareto-optimal solutions and analyzing trade-offs
- Implementing evolutionary algorithms (GA, DE, PSO, NSGA-II/III)
- Working with constrained optimization problems
- Benchmarking algorithms on standard test problems (ZDT, DTLZ, WFG)
- Customizing genetic operators (crossover, mutation, selection)
- Visualizing high-dimensional optimization results
- Making decisions from multiple competing solutions
- Handling binary, discrete, continuous, or mixed-variable problems

## Core Concepts

### The Unified Interface

Pymoo uses a consistent `minimize()` function for all optimization tasks:

```python
from pymoo.optimize import minimize

result = minimize(
    problem,        # What to optimize
    algorithm,      # How to optimize
    termination,    # When to stop
    seed=1,
    verbose=True
)
```

**Result object contains:**
- `result.X`: Decision variables of optimal solution(s)
- `result.F`: Objective values of optimal solution(s)
- `result.G`: Constraint violations (if constrained)
- `result.algorithm`: Algorithm object with history

### Problem Definition Styles

Pymoo supports three problem definition styles:

- **`Problem`**: Vectorized — `_evaluate` receives a batch of solutions (matrix)
- **`ElementwiseProblem`**: One solution per call — recommended for custom problems and parallel evaluation
- **`FunctionalProblem`**: Define objectives and constraints as separate functions without subclassing

### Problem Types

**Single-objective:** One objective to minimize/maximize
**Multi-objective:** 2-3 conflicting objectives → Pareto front
**Many-objective:** 4+ objectives → High-dimensional Pareto front
**Constrained:** Objectives + inequality/equality constraints
**Mixed-variable:** Continuous, integer, binary, and categorical variables in one problem
**Dynamic:** Time-varying objectives or constraints

## Quick Start Workflows

Nine runnable workflows are in
[references/quick_start_workflows.md](references/quick_start_workflows.md):

| # | Workflow | Use when |
| --- | --- | --- |
| 1 | Single-objective optimization | one objective, GA or DE |
| 2 | Multi-objective (2-3 objectives) | NSGA-II and a Pareto front |
| 3 | Many-objective (4+ objectives) | NSGA-III or reference-direction methods |
| 4 | Custom problem definition | subclassing `Problem` / `ElementwiseProblem` |
| 5 | Constraint handling | inequality and equality constraints |
| 6 | Decision making from a Pareto front | scalarization and MCDM selection |
| 7 | Visualization | scatter, PCP, radviz, and heatmap views |
| 8 | Parallel evaluation | threads, processes, or Dask for expensive objectives |
| 9 | Mixed-variable optimization | integer, binary, and categorical variables |

## Algorithm Selection Guide

### Single-Objective Problems

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **GA** | General-purpose | Flexible, customizable operators |
| **DE** | Continuous optimization | Good global search |
| **PSO** | Smooth landscapes | Fast convergence |
| **CMA-ES** | Difficult/noisy problems | Self-adapting |

### Multi-Objective Problems (2-3 objectives)

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **NSGA-II** | Standard benchmark | Fast, reliable, well-tested |
| **SPEA2** | Archive-based MOO | Strength-based fitness, external archive |
| **R-NSGA-II** | Preference regions | Reference point guidance |
| **MOEA/D** | Decomposable problems | Scalarization approach |

### Many-Objective Problems (4+ objectives)

| Algorithm | Best For | Key Features |
|-----------|----------|--------------|
| **NSGA-III** | 4-15 objectives | Reference direction-based |
| **RVEA** | Adaptive search | Reference vector evolution |
| **AGE-MOEA** | Complex landscapes | Adaptive geometry |

### Constrained Problems

| Approach | Algorithm | When to Use |
|----------|-----------|-------------|
| Feasibility-first | Any algorithm | Large feasible region |
| Specialized | SRES, ISRES | Heavy constraints |
| Penalty | GA + penalty | Algorithm compatibility |

**See:** `references/algorithms.md` for comprehensive algorithm reference

## Benchmark Problems

### Quick problem access:
```python
from pymoo.problems import get_problem

# Single-objective
problem = get_problem("rastrigin", n_var=10)
problem = get_problem("rosenbrock", n_var=10)

# Multi-objective
problem = get_problem("zdt1")        # Convex front
problem = get_problem("zdt2")        # Non-convex front
problem = get_problem("zdt3")        # Disconnected front

# Many-objective
problem = get_problem("dtlz2", n_obj=5, n_var=12)
problem = get_problem("dtlz7", n_obj=4)
```

**See:** `references/problems.md` for complete test problem reference

## Genetic Operator Customization

### Standard operator configuration:
```python
from pymoo.algorithms.soo.nonconvex.ga import GA
from pymoo.operators.crossover.sbx import SBX
from pymoo.operators.mutation.pm import PM

algorithm = GA(
    pop_size=100,
    crossover=SBX(prob=0.9, eta=15),
    mutation=PM(eta=20),
    eliminate_duplicates=True
)
```

### Operator selection by variable type:

**Continuous variables:**
- Crossover: SBX (Simulated Binary Crossover)
- Mutation: PM (Polynomial Mutation)

**Binary variables:**
- Crossover: TwoPointCrossover, UniformCrossover
- Mutation: BitflipMutation

**Permutations (TSP, scheduling):**
- Crossover: OrderCrossover (OX)
- Mutation: InversionMutation

**See:** `references/operators.md` for comprehensive operator reference

## Performance and Troubleshooting

### Common issues and solutions:

**Problem: Algorithm not converging**
- Increase population size
- Increase number of generations
- Check if problem is multimodal (try different algorithms)
- Verify constraints are correctly formulated

**Problem: Poor Pareto front distribution**
- For NSGA-III: Adjust reference directions
- Increase population size
- Check for duplicate elimination
- Verify problem scaling

**Problem: Few feasible solutions**
- Use constraint-as-objective approach
- Apply repair operators
- Try SRES/ISRES for constrained problems
- Check constraint formulation (should be g <= 0)

**Problem: High computational cost**
- Reduce population size
- Decrease number of generations
- Use simpler operators
- Enable parallel evaluation via `elementwise_runner` (see Workflow 8)

### Best practices:

1. **Normalize objectives** when scales differ significantly
2. **Set random seed** for reproducibility
3. **Save history** to analyze convergence: `save_history=True`
4. **Visualize results** to understand solution quality
5. **Compare with true Pareto front** when available
6. **Use appropriate termination criteria** (generations, evaluations, tolerance)
7. **Tune operator parameters** for problem characteristics

## Resources

This skill includes comprehensive reference documentation and executable examples:

### references/
Detailed documentation for in-depth understanding:

- **algorithms.md**: Complete algorithm reference with parameters, usage, and selection guidelines
- **problems.md**: Benchmark test problems (ZDT, DTLZ, WFG) with characteristics
- **operators.md**: Genetic operators (sampling, selection, crossover, mutation) with configuration
- **visualization.md**: All visualization types with examples and selection guide
- **constraints_mcdm.md**: Constraint handling techniques and multi-criteria decision making methods
- **parallelization.md**: Parallel evaluation with StarmapParallelization and JoblibParallelization

**Search patterns for references:**
- Algorithm details: `grep -r "NSGA-II\|NSGA-III\|MOEA/D" references/`
- Constraint methods: `grep -r "Feasibility First\|Penalty\|Repair" references/`
- Visualization types: `grep -r "Scatter\|PCP\|Petal" references/`

### scripts/
Executable examples demonstrating common workflows:

- **single_objective_example.py**: Basic single-objective optimization with GA
- **multi_objective_example.py**: Multi-objective optimization with NSGA-II, visualization
- **many_objective_example.py**: Many-objective optimization with NSGA-III, reference directions
- **custom_problem_example.py**: Defining custom problems (constrained and unconstrained)
- **decision_making_example.py**: Multi-criteria decision making with different preferences

**Run examples:**
```bash
python3 scripts/single_objective_example.py
python3 scripts/multi_objective_example.py
python3 scripts/many_objective_example.py
python3 scripts/custom_problem_example.py
python3 scripts/decision_making_example.py
```

## Additional Notes

**Common patterns:**
- Use `ElementwiseProblem` for custom problems (or `FunctionalProblem` for function-based definitions)
- Use `vars` dict with typed variables for mixed-variable problems
- Constraints formulated as `g(x) <= 0` and `h(x) = 0`
- Reference directions required for NSGA-III
- Normalize objectives before MCDM
- Use appropriate termination: `('n_gen', N)` or `get_termination("f_tol", tol=0.001)`

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


- Load knowledge ID `sas-references-algorithms.md` from `references/algorithms.md`.
- Load knowledge ID `sas-references-constraints-mcdm.md` from `references/constraints_mcdm.md`.
- Load knowledge ID `sas-references-operators.md` from `references/operators.md`.
- Load knowledge ID `sas-references-parallelization.md` from `references/parallelization.md`.
- Load knowledge ID `sas-references-problems.md` from `references/problems.md`.
- Load knowledge ID `sas-references-quick-start-workflows.md` from `references/quick_start_workflows.md`.
- Load knowledge ID `sas-references-visualization.md` from `references/visualization.md`.
- Load knowledge ID `sas-scripts-custom-problem-example.py` from `scripts/custom_problem_example.py`.
- Load knowledge ID `sas-scripts-decision-making-example.py` from `scripts/decision_making_example.py`.
- Load knowledge ID `sas-scripts-many-objective-example.py` from `scripts/many_objective_example.py`.
- Load knowledge ID `sas-scripts-multi-objective-example.py` from `scripts/multi_objective_example.py`.
- Load knowledge ID `sas-scripts-single-objective-example.py` from `scripts/single_objective_example.py`.

Run any packaged script only through the host Agent's configured Python runtime; ResearchSpec never executes packaged resources.

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
