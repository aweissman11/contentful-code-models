#!/usr/bin/env node

import { Command } from "commander";
import { syncCommand } from "./sync.js";
import { migrateCommand } from "./migrate.js";

const program = new Command();

program
  .name("ccm")
  .description("CLI tools for managing Contentful content models through code")
  .version("2.0.1");

program.addCommand(syncCommand);
program.addCommand(migrateCommand);

program.parse();
