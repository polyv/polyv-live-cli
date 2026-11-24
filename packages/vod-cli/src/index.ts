#!/usr/bin/env node

/**
 * polyv-vod-cli entry point.
 */
import { config as loadDotenv } from 'dotenv';

import { createContext, toConsole } from './core/context';
import { run } from './program';

// A `.env` next to the caller may hold POLYV_VOD_* variables; real environment variables win.
loadDotenv({ quiet: true });

const args = process.argv.slice(2);

// An empty invocation shows the help, the same way `--help` does.
if (args.length === 0) {
  args.push('--help');
}

run(args, toConsole(createContext()))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
