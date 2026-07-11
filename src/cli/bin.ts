#!/usr/bin/env node

import { main } from "./main.js";

const result = await main();
process.exitCode = result.exitCode;
