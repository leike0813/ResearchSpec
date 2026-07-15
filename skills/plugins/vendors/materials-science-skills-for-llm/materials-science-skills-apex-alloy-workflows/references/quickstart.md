# APEX alloy workflow

1. Confirm the target property, structure, units, and required accuracy.
2. Ask the user to identify an already configured local or remote APEX runtime.
3. Select property parameters and validate that referenced potentials and input
   structures exist locally.
4. Render a run plan listing commands, target environment, estimated cost, and
   expected outputs.
5. Execute only after explicit confirmation. Treat remote and scheduler actions
   as stateful operations requiring fresh confirmation.
6. Check convergence and provenance before interpreting results. Report failed
   or incomplete calculations without silently resubmitting them.

Do not substitute fixed endpoints, images, credentials, or site configuration.
