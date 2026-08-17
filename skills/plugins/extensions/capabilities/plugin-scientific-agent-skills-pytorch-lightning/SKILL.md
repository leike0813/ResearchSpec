---
name: plugin-scientific-agent-skills-pytorch-lightning
description: "Deep learning framework (PyTorch Lightning / lightning package). Organize PyTorch code into LightningModules, configure Trainers for multi-GPU/TPU, implement data pipelines, callbacks, logging (W&B, TensorBoard, MLflow), distributed training (DDP, FSDP, DeepSpeed), for scalable neural network training."
metadata:
  capability_id: plugin-scientific-agent-skills-pytorch-lightning
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: MIT
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/quick_trainer_setup.py`, `scripts/template_datamodule.py`, `scripts/template_lightning_module.py`. The target Agent must inspect requirements and side effects before execution.

# PyTorch Lightning

## Overview

PyTorch Lightning is a deep learning framework that organizes PyTorch code to eliminate boilerplate while maintaining full flexibility. Automate training workflows, multi-device orchestration, and implement best practices for neural network training and scaling across multiple GPUs/TPUs.

**Current upstream:** lightning 2.6.4 (PyPI, May 2026). Docs: [lightning.ai/docs/pytorch/stable](https://lightning.ai/docs/pytorch/stable/). Use `import lightning as L` (the `pytorch-lightning` package name still installs the same library).

## Installation

```bash
uv pip install lightning
```

Optional extras:

```bash
uv pip install lightning[extra]    # loggers, strategies, etc.
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

1. `prepare_data()` - Download and process data (single-process)
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

- TensorBoard (default)
- Weights & Biases (WandbLogger)
- MLflow (MLFlowLogger)
- Comet (CometLogger)
- CSV (CSVLogger)

Note: `NeptuneLogger` was removed in lightning 2.6.4. Use W&B, MLflow, or TensorBoard instead.

Log metrics using `self.log("metric_name", value)` in any LightningModule method.

**Detailed documentation:** Read `references/logging.md` for logger setup and configuration.

### 6. Distributed Training - Scale to Multiple Devices

Choose the right strategy based on model size:

- **DDP** - For models <500M parameters (ResNet, smaller transformers)
- **FSDP** - For models 500M+ parameters (large transformers, recommended for Lightning users)
- **DeepSpeed** - For cutting-edge features and fine-grained control

Configure with: `Trainer(strategy="ddp", accelerator="gpu", devices=4)`

**Detailed documentation:** Read `references/distributed_training.md` for strategy comparison and configuration.

### 7. Best Practices

- Device agnostic code - Use `self.device` instead of `.cuda()`
- Hyperparameter saving - Use `self.save_hyperparameters()` in `__init__()`
- Metric logging - Use `self.log()` for automatic aggregation across devices
- Reproducibility - Use `seed_everything()` and `Trainer(deterministic=True)`
- Debugging - Use `Trainer(fast_dev_run=True)` to test with 1 batch

**Detailed documentation:** Read `references/best_practices.md` for common patterns and pitfalls.

## Quick Workflow

1. **Define model:**
   ```python
   class MyModel(L.LightningModule):
       def __init__(self):
           super().__init__()
           self.save_hyperparameters()
           self.model = YourNetwork()

       def training_step(self, batch, batch_idx):
           x, y = batch
           loss = F.cross_entropy(self.model(x), y)
           self.log("train_loss", loss)
           return loss

       def configure_optimizers(self):
           return torch.optim.Adam(self.parameters())
   ```

2. **Prepare data:**
   ```python
   # Option 1: Direct DataLoaders
   train_loader = DataLoader(train_dataset, batch_size=32)

   # Option 2: LightningDataModule (recommended for reusability)
   dm = MyDataModule(batch_size=32)
   ```

3. **Train:**
   ```python
   trainer = L.Trainer(max_epochs=10, accelerator="gpu", devices=2)
   trainer.fit(model, train_loader)  # or trainer.fit(model, datamodule=dm)
   ```

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

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
