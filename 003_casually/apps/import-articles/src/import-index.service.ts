import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import { Article } from '@app/causaly';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ImportIndexService {
  private readonly logger = console;

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async deleteIndex(index) {
    return this.elasticsearchService.indices.delete({
      index
    });
  }

  async indexExists(index) {
    return this.elasticsearchService.indices.exists({
      index
    });
  }

  fatal() {
    process.exit(1);
  }

  async ensureIndex(index, fatal = true): Promise<void> {
    try {
      const exists = await this.indexExists(index);

      // will not guarante if there is no race condition happening -
      // to do that this would need to be moved to some queue/worker flow
      if (exists.statusCode == 200) {
        this.logger.log(`Index "${index}" already exists.`);
        if (fatal) {
          this.fatal();
        }

        return;
      }

      this.logger.log(`Index "${index}" does not exist. Creating...`);
      const createResponse = await this.elasticsearchService.indices.create({
        index,
        body: {
          mappings: {
            properties: {
              uuid: {
                type: 'keyword',
                ignore_above: 256,
                normalizer: 'to_lowercase',
              },
              title: {
                type: 'text',
                analyzer: 'standard',
              },
              abstract: {
                type: 'text',
                analyzer: 'standard',
              },
              tags: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                    normalizer: 'to_lowercase',
                  },
                },
                analyzer: 'standard',
              },
              relationships: {
                type: 'nested',
                properties: {
                  cause_concept_name: {
                    type: 'keyword',
                    ignore_above: 256,
                    normalizer: 'to_lowercase',
                  },
                  effect_concept_name: {
                    type: 'keyword',
                    ignore_above: 256,
                    normalizer: 'to_lowercase',
                  },
                },
              },
            },
          },
          settings: {
            index: {
              analysis: {
                normalizer: {
                  to_lowercase: {
                    filter: ['lowercase'],
                    type: 'custom',
                  },
                },
              },
            },
          },
        },
      });

      this.logger.log(`Index "${index}" created successfully.`);
      this.logger.log(`Create index response:`, createResponse);
    } catch (error) {
      this.logger.error(`Error ensuring index "${index}": ${error.message}`, error.stack);
      process.exit(1);
    }
  }

  async loadInFile(index: string, filePath: string): Promise<void> {
    this.logger.log(`Loading file ${filePath}`);

    const fileStream = createReadStream(filePath);

    // Create a readline interface using the promises API.
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity, // Treat all instances of CR LF ('\r\n') as a single line break.
    });

    const articles: Article[] = [];

    // gethiering results here to one array, but should rather send them to worker
    for await (const line of rl) {
      // Process the line NDJSON
      try {
        articles.push(JSON.parse(line));
      } catch (err) {
        this.logger.error(err);
      }
    }

    this.logger.log(`Adding ${articles.length} entries`);

    return this.chunkedInsertData(index, articles, 3);
  }

  // would be better to resolve with queue/worker to limit global writes instead of just local
  // could spawn node worker that could do that
  // Promise.allSettled that processes 3 at a time is also an option
  async chunkedInsertData(index: string, data: Article[], chunks: number = 3) {
    if (chunks <= 0) {
      throw new Error('The number of chunks must be greater than 0.');
    }

    if (!data.length) {
      throw new Error('Nothing to import');
    }

    const promises: Promise<any>[] = [];

    for (let i = 0; i < chunks; i++) {
      promises.push(this.insertDataWhile(index, data));
    }

    await Promise.allSettled(promises);
  }

  async insertDataWhile<T extends Partial<{ uuid: string }>>(index: string, data: T[] = []) {
    while (data.length) {
      const entry = data.shift();

      if (!entry) {
        return;
      }

      try {
        this.logger.log(`Inserting ${entry.uuid}`);
        await this.insertEntry(index, entry);
      } catch (error) {
        this.logger.error(
          `Error ensuring insertin "${index}": ${error.message} ${JSON.stringify(entry)}`,
          error.stack
        );
      }
    }
  }

  insertEntry<T extends Partial<{ uuid: string }>>(index:string, document: T) {
    return this.elasticsearchService.index({
      index: index,
      body: {
        ...(document.uuid && { id: document.uuid.toLowerCase() }),
        ...document,
      },
    });
  }
}
