# Scientific Agent Skills v2.72.0 manual security review, round 9

This is the final partial batch of the 42 previously catalogued review targets. The [upstream report](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/docs/security-report.json) supplies historical findings. The maintainer deferred `autoskill` and cleared `waypoint-bio`. [Decision record](artifacts/maintainer-decisions.json)

## autoskill

- **Inventory and findings.** 16 files, with ten scripts, three references and separate configuration. Seven carried critical-report findings remain partially confirmed at the behavior level. The revised source still handles local activity capture, model-backed processing and agent-skill promotion. The new proxy reference extends the documented external data path. Static inspection alone cannot establish control of every deployment's collection and outbound transmission.
- **Residual risk and adaptation.** Activity capture may contain confidential material and crosses the boundary of an advisory research procedure. Keep the entire entry and resource tree outside the production bundle.
- **Independent blocker and domain.** Outside the plugin's authority. No production domain is proposed.
- **Recommendation and production effect.** `defer` the candidate security clearance. The authority blocker independently keeps this Skill excluded.

[Upstream release inventory](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/docs/skills.md)

## waypoint-bio

- **Inventory and findings.** Eight files including two scripts and five references. Both carried findings remain false positives. The examples in `references/python-api.md` show model inference mode and a documented fixed argument-list launch. The bundled scripts handle local format conversion and vocabulary review. The new reference distinguishes local checks from externally provisioned model work.
- **Residual risk and adaptation.** External package, model and data requirements remain outside the bundled static review. Keep advice bounded to user-authorized data and services. Any future production reconsideration needs its own resource decision.
- **Independent blocker and domain.** ToolUniverse overlap. No production domain is proposed.
- **Recommendation and production effect.** `clear` for the two carried findings. The independent overlap keeps this Skill excluded.

[Upstream release inventory](https://github.com/K-Dense-AI/scientific-agent-skills/blob/v2.72.0/docs/skills.md)
