# Scientific Agent Skills v2.72.0 supplemental security review

The source review surfaced two risks outside the carried review inventory. The maintainer confirmed both adaptations against the same v2.72.0 revision. [Decision record](artifacts/maintainer-decisions.json)

## generate-image

- **Inventory and findings.** Three files comprise the entry, a provider-specific model reference and a Python generator. The carried upstream scan contains zero findings. The current Python generator resolves a provider credential, including by searching ancestor environment files, and can transmit prompts and images to the provider. The reference serves that provider-specific runtime.
- **Residual risk and adaptation.** Exclude `scripts/generate_image.py` and `references/models.md`. Curate the entry as a provider-neutral image brief and review procedure. Optional generation uses the target Agent's configured image capability after the user confirms material sharing and costs.
- **Independent blockers and domain.** None for the curated workflow. Existing domain `scientific-visualization-and-communication`.
- **Recommendation and production effect.** `clear-with-adaptation`. Retain the capability under its existing ID with a curated instruction-led entry.

[Candidate inventory](artifacts/source-inventory.json)

## ginkgo-cloud-lab

- **Inventory and findings.** 19 Markdown files comprise the entry and 18 references, with no executable. The historical low finding about a vendor self-citation directive is partially confirmed. The current entry and added plate-reader reference expand the service's intake, upload and paid-order guidance.
- **Residual risk and adaptation.** Keep the entry advisory, covering service categories, quote assumptions, input review and evidence expected back. Exclude the operational service references, including the new plate-reader note. Keep purchases, submission of sample or design material, and account access outside the generated entry.
- **Independent blockers and domains.** None for the curated advisory workflow. Existing domains `control-engineering-mechatronics-and-robotics` and `laboratory-automation-and-informatics`.
- **Recommendation and production effect.** `clear-with-adaptation`. Retain the existing capability with the new ordering reference excluded.

[Candidate inventory](artifacts/source-inventory.json)
