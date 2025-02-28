import { createReadStream } from 'fs';

import {
  AckRmq,
  QUEUE_QueueIngredientsCsv,
  QUEUE_QueueIngredientsCsv_TMPL,
  QUEUE_QueueIngredientsCsvSingle,
  QUEUE_QueueIngredientsCsvSingle_TMPL,
  RmqPublish,
  RmqService,
  RmqSubscribe,
} from '@app/common';
import {
  Injectable,
  Logger,
} from '@nestjs/common';

const csv = require('csv-parser');

@Injectable()
export class IngredientCsvMircoServiceService {
  constructor(
    private readonly publisher: RmqService
  ) { }


  private parseCsvStream(filePath) {
    return new Promise<{ name; supplier }[]>((resolve, reject) => {
      const results = [];

      createReadStream(filePath)
        .pipe(csv(['name', 'supplier']))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  @RmqPublish({
    routingKey: QUEUE_QueueIngredientsCsvSingle
  })
  @RmqSubscribe({
    queue: QUEUE_QueueIngredientsCsv,
    prefetch: 3
  })
  async handleMessage(message: QUEUE_QueueIngredientsCsv_TMPL, delivery: AckRmq) {
    // Process incoming messages from the channel
    Logger.log(`Received message on channel(${message.requestId}): ${JSON.stringify(message)}`);
    try {
      // would expect those to come with s3 links to download
      // but I do not have spare s3 to use to implement, so we went with direct upload in GQL
      const parseFile = await this.parseCsvStream(message.filePath);

      // could later rework this to shart to actually one supplier - less checks
      for (const line of parseFile?.slice?.(1) ?? []) {
        if (!line.name || !line.supplier) {
          Logger.log(`Skipping entry for name ${line.name} ${line.supplier}`);
          continue;
        }

        await this.publisher.send({ routingKey: QUEUE_QueueIngredientsCsvSingle }, <QUEUE_QueueIngredientsCsvSingle_TMPL>{
          requestId: message.requestId,
          ingredientName: line.name,
          supplierName: line.supplier,
        });

      }
      delivery.ack()
    } catch (err) {
      Logger.error(err);
      delivery.nack()
    }
    // Add custom logic to handle the message
  }
}
