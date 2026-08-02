# Host-Native Independent Model Review

Independent model review is optional. All ARSU workflows work with the current
session model alone. ResearchSpec does not configure model providers or perform
model transport; an independent pass is available only when the target host
already exposes the confirmed model through its native subagent mechanism.

Before dispatch, the main Agent must:

1. finish and freeze its own judgment in the same structured form expected from
   the independent reviewer;
2. propose a model that is actually available in the host;
3. disclose the category of material to be shared and the expected cost; and
4. obtain consent for this exact subflow instance.

The dispatched payload contains only the minimum de-anchored evidence needed for
the check. It excludes the main Agent's decision, scores, and reasoning. A child,
branch, or revision round needs a fresh confirmation and, if independent review
is proposed, fresh model consent. Consent remains session context and is never
written to stable specs, controls, handoffs, or model configuration.

Compare structured results directly. Agreement may increase confidence but does
not establish truth. Disagreement triggers a targeted evidence review; it is
never resolved by voting or averaging, and the independent reviewer cannot
silently rewrite the main judgment. If dispatch fails or the returned result is
malformed, disclose the failure and continue using the frozen single-model
judgment with an explicit limitation note.
