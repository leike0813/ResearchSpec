# DeePTB command planning

Use the executable and subcommands exposed by the user's existing DeePTB
environment. Before proposing a command, verify the installed version's local
help because flags and configuration schemas can differ.

For each preparation, training, testing, or prediction command, record:

- configuration and dataset paths;
- working and output directories;
- device and resource expectations;
- whether existing checkpoints or results may be changed;
- the validation command and success criteria.

Show the exact command for confirmation before training or any stateful action.
Do not include environment creation or dependency setup commands.
