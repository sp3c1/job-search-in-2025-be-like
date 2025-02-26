import { Command } from 'commander';

import { NestFactory } from '@nestjs/core';

import { CliModule } from './cli.module';
import { CliService } from './cli.service';

async function bootstrap() {

  const program = new Command();

  program.name('Huggg CLI');

  const importProgram = async (path: string, fakeTimers = false) => {
    require('dotenv').config({ path, override: true });
    const app = await NestFactory.createMicroservice(CliModule);
    const srvc = app.get(CliService);
    srvc.loadBrandsStoresProducts(fakeTimers);
  }

  program.command('import-brands')
    .action(async () => {
      await importProgram('.env')
    });

  // simplify e2e setup
  program.command('import-brands-test')
    .action(async () => {
      await importProgram('.env.test', true);
    });

  program.parse();

}

bootstrap().catch(
  err => {
    console.error(err);
  });
