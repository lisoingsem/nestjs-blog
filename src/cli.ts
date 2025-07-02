#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli/cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule, {
    logger: false,
    errorHandler: (error) => {
      // Don't treat help output as an error
      if (error.message.includes('outputHelp') || error.message.includes('help')) {
        process.exit(0);
      }
      console.error('CLI Error:', error.message);
      process.exit(1);
    },
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start CLI:', error.message);
  process.exit(1);
}); 