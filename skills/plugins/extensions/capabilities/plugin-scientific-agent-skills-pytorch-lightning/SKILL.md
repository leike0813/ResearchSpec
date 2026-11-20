---
name: plugin-scientific-agent-skills-pytorch-lightning
description: "Deep learning framework (PyTorch Lightning / lightning package). Organize PyTorch code into LightningModules, configure Trainers for multi-GPU/TPU, implement data pipelines, callbacks, logging (W&B, TensorBoard, MLflow), distributed training (DDP, FSDP, DeepSpeed), for scalable neural network training."
metadata:
  capability_id: plugin-scientific-agent-skills-pytorch-lightning
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/quick_trainer_setup.py`, `scripts/template_datamodule.py`, `scripts/template_lightning_module.py`. The target Agent must inspect requirements and side effects before execution.

# PyTorch Lightning

## Overview

PyTorch Lightning is a deep learning framework that organizes PyTorch code to eliminate boilerplate while maintaining full flexibility. Automate training workflows, multi-device orchestration, and implement best practices for neural network training and scaling across multiple GPUs/TPUs.

**Reviewed release:** [Lightning 2.6.6](https://github.com/Lightning-AI/pytorch-lightning/releases/tag/2.6.6), including its checkpoint-loading security fixes. CPU tests use Python 3.11, Torch 2.14.1 and Lightning 2.6.6. Use `import lightning as L` with the `lightning` distribution. The alternative `pytorch-lightning` distribution exposes `import pytorch_lightning as pl`; do not mix class namespaces within one application. GPU, TPU, multi-node and online logger examples are source-verified illustrations, not executed training validation.

## Installation

```bash
uv pip install "lightning==2.6.6"
```

Optional extras:

```bash
uv pip install "lightning[extra]==2.6.6"    # loggers, strategies, etc.
uv pip install wandb mlflow        # specific loggers as needed
```

## When to Use This Skill

This skill should be used when:
- Building, training, or deploying neural networks using PyTorch Lightning
- Organizing PyTorch code into LightningModules
- Configuring Trainers for multi-GPU/TPU training
- Implementing data pipelines with LightningDataModules
- Working with callbacks, logging, and distributed training strategies (DDP, FSDP, DeepSpeed)
- Structuring deep learning projects professionally

## Core Capabilities

### 1. LightningModule - Model Definition

Organize PyTorch models into six logical sections:

1. **Initialization** - `__init__()` and `setup()`
2. **Training Loop** - `training_step(batch, batch_idx)`
3. **Validation Loop** - `validation_step(batch, batch_idx)`
4. **Test Loop** - `test_step(batch, batch_idx)`
5. **Prediction** - `predict_step(batch, batch_idx)`
6. **Optimizer Configuration** - `configure_optimizers()`

**Quick template reference:** See `scripts/template_lightning_module.py` for a complete boilerplate.

**Detailed documentation:** Read `references/lightning_module.md` for comprehensive method documentation, hooks, properties, and best practices.

### 2. Trainer - Training Automation

The Trainer automates the training loop, device management, gradient operations, and callbacks. Key features:

- Multi-GPU/TPU support with strategy selection (DDP, FSDP, DeepSpeed)
- Automatic mixed precision training
- Gradient accumulation and clipping
- Checkpointing and early stopping
- Progress bars and logging

**Quick setup reference:** See `scripts/quick_trainer_setup.py` for common Trainer configurations.

**Detailed documentation:** Read `references/trainer.md` for all parameters, methods, and configuration options.

### 3. LightningDataModule - Data Pipeline Organization

Encapsulate all data processing steps in a reusable class:

1. `prepare_data()` - Download/cache on local rank zero per node by default; use global rank zero with shared storage when configured
2. `setup()` - Create datasets and apply transforms (per-GPU)
3. `train_dataloader()` - Return training DataLoader
4. `val_dataloader()` - Return validation DataLoader
5. `test_dataloader()` - Return test DataLoader

**Quick template reference:** See `scripts/template_datamodule.py` for a complete boilerplate.

**Detailed documentation:** Read `references/data_module.md` for method details and usage patterns.

### 4. Callbacks - Extensible Training Logic

Add custom functionality at specific training hooks without modifying your LightningModule. Built-in callbacks include:

- **ModelCheckpoint** - Save best/latest models
- **EarlyStopping** - Stop when metrics plateau
- **LearningRateMonitor** - Track LR scheduler changes
- **BatchSizeFinder** - Auto-determine optimal batch size

**Detailed documentation:** Read `references/callbacks.md` for built-in callbacks and custom callback creation.

### 5. Logging - Experiment Tracking

Integrate with multiple logging platforms:

- CSV locally; TensorBoard is the default only when its optional package is installed
- Weights & Biases (WandbLogger)
- MLflow (MLFlowLogger)
- Comet (CometLogger)
- CSV (CSVLogger)

`NeptuneLogger` was removed in Lightning 2.6.4; the Neptune service shut down March 5, 2026. The bundled helpers use local CSV logging; cloud tracking and model artifact uploads require an intentional choice.

Log metrics with `self.log("metric_name", value)` in supported LightningModule hooks; specify epoch/step reduction and batch size when they matter.

**Detailed documentation:** Read `references/logging.md` for logger setup and configuration.

### 6. Distributed Training - Scale to Multiple Devices

Choose the right strategy based on model size:

- **DDP** - When each device can hold the full model, optimizer state and activations
- **FSDP** - When sharding training state addresses measured memory pressure
- **DeepSpeed** - When its ZeRO/offload features fit the measured workload and CUDA stack

Choose from peak memory and throughput measurements, not a fixed parameter-count threshold.

Configure with: `Trainer(strategy="ddp", accelerator="gpu", devices=4)`

**Detailed documentation:** Read `references/distributed_training.md` for strategy comparison and configuration.

### 7. Best Practices

- Device agnostic code - Use `self.device` instead of `.cuda()`
- Hyperparameter saving - Use `self.save_hyperparameters()` in `__init__()`
- Metric logging - For scalar tensors, cross-device reduction requires `self.log(..., sync_dist=True)`; the default is `False`. Have all ranks participate in synchronized calls. For non-additive metrics such as AUROC, use a stateful TorchMetrics object with its own distributed synchronization instead of averaging per-rank AUROCs. See the [Lightning logging contract](https://lightning.ai/docs/pytorch/stable/extensions/logging.html) and [TorchMetrics integration](https://lightning.ai/docs/torchmetrics/stable/pages/lightning.html).
- Reproducibility - Use `seed_everything()` and `Trainer(deterministic=True)`
- Debugging - Use `Trainer(fast_dev_run=True)` to test with 1 batch

**Detailed documentation:** Read `references/best_practices.md` for common patterns and pitfalls.

## Quick Workflow

Copy the three scripts into a working directory, then run this CPU smoke there:

```python
import lightning as L
from template_datamodule import TemplateDataModule
from template_lightning_module import TemplateLightningModule
from quick_trainer_setup import production_single_gpu_trainer

L.seed_everything(42, workers=True)
model = TemplateLightningModule(hidden_dim=16)
dm = TemplateDataModule(num_samples=64, batch_size=8, num_workers=0)
trainer = production_single_gpu_trainer(
    max_epochs=1, accelerator="cpu", precision="32-true",
    log_dir="logs", checkpoint_dir="checkpoints",
)
trainer.fit(model, datamodule=dm)
trainer.test(model, datamodule=dm, ckpt_path="best", weights_only=True)
```

The synthetic vectors match the model input and use separate validation
transforms and held-out test generation. Random labels test mechanics only.
All helpers monitor `val/loss`. Use a fresh model/Trainer plus
`fit(..., ckpt_path=path, weights_only=True)` to resume full training state;
`load_from_checkpoint` alone loads a model. A normal short fit checks callbacks
and checkpoints; `fast_dev_run` disables much of that behavior.

For real science, split independent subjects/groups/time periods before fitting
preprocessing, preserve split IDs, and reserve test data from model selection.
Final DDP evaluation can duplicate padded samples: use one device for exact
sample coverage or validate a nonduplicating distributed evaluator.

## Resources

### scripts/
Executable Python templates for common PyTorch Lightning patterns:

- `template_lightning_module.py` - Complete LightningModule boilerplate
- `template_datamodule.py` - Complete LightningDataModule boilerplate
- `quick_trainer_setup.py` - Common Trainer configuration examples

### references/
Detailed documentation for each PyTorch Lightning component:

- `lightning_module.md` - Comprehensive LightningModule guide (methods, hooks, properties)
- `trainer.md` - Trainer configuration and parameters
- `data_module.md` - LightningDataModule patterns and methods
- `callbacks.md` - Built-in and custom callbacks
- `logging.md` - Logger integrations and usage
- `distributed_training.md` - DDP, FSDP, DeepSpeed comparison and setup
- `best_practices.md` - Common patterns, tips, and pitfalls

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


- Load knowledge ID `sas-references-best-practices.md` from `references/best_practices.md`.
- Load knowledge ID `sas-references-callbacks.md` from `references/callbacks.md`.
- Load knowledge ID `sas-references-data-module.md` from `references/data_module.md`.
- Load knowledge ID `sas-references-distributed-training.md` from `references/distributed_training.md`.
- Load knowledge ID `sas-references-lightning-module.md` from `references/lightning_module.md`.
- Load knowledge ID `sas-references-logging.md` from `references/logging.md`.
- Load knowledge ID `sas-references-trainer.md` from `references/trainer.md`.
- Load knowledge ID `sas-scripts-quick-trainer-setup.py` from `scripts/quick_trainer_setup.py`.
- Load knowledge ID `sas-scripts-template-datamodule.py` from `scripts/template_datamodule.py`.
- Load knowledge ID `sas-scripts-template-lightning-module.py` from `scripts/template_lightning_module.py`.

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
