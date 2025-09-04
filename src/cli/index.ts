#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { syncCommand } from "./sync.js";
import { migrateCommand } from "./migrate.js";
import { trialCommand } from "./trial.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf-8"),
);

const program = new Command();

program
  .name("contentful-code-models")
  .description("CLI tools for managing Contentful content models through code")
  .version(pkg.version);

program.addCommand(syncCommand);
program.addCommand(migrateCommand);
program.addCommand(trialCommand);

program.parse();
