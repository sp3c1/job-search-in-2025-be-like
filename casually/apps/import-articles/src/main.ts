import { Command } from 'commander';
import { extname } from 'path';

import { NestFactory } from '@nestjs/core';

import { ImportIndexModule } from './import-index.module';
import { ImportIndexService } from './import-index.service';
import { isEmpty } from 'lodash';

async function bootstrap() {
  require('dotenv').config({ path: './.env.cli' });
  const app = await NestFactory.createMicroservice(ImportIndexModule, { logger: false });

  const srvcArticles = app.get(ImportIndexService);
  const program = new Command();

  program.name('Create Articles Elastic Index');
  program.requiredOption('-f, --file <path>', 'ndjson load file');
  program.requiredOption('-i, --index <name>', 'for example, `articles`');
  program.parse();

  const file = program.opts().file;
  const ext = extname(file);

  if (ext != '.ndjson') {
    console.error(`Require file to be ndjson`);
    process.exit(0);
  }

  const index = program.opts().index;

  if(isEmpty(index)){
    console.error(`Require a valid non empty name`);
    process.exit(0);
  }

  await srvcArticles.ensureIndex(index);
  await srvcArticles.loadInFile(index, file);
}
bootstrap()
  .catch((err) => {
    console.error(err);
  })
  .finally();
