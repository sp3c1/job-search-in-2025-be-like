import { RedisPubSub } from 'graphql-redis-subscriptions';

import {
  AckRmq,
  cleanString,
  PUBSUB_QueueAddedIngredient,
  PUBSUB_QueueAddedIngredient_TMPL,
  PUBSUB_QueueAddedSupplier,
  PUBSUB_QueueAddedSupplier_TMPL,
  QUEUE_QueueIngredientsCsvSingle,
  QUEUE_QueueIngredientsCsvSingle_TMPL,
  RmqSubscribe,
} from '@app/common';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  IngredientService,
  SupplierService,
  SupplierToIngredientService,
} from './services';

@Injectable()
export class MircoServiceService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private supplierService: SupplierService,
    private ingredientService: IngredientService,
    private supplierToIngredient: SupplierToIngredientService
  ) { }


  @RmqSubscribe({ queue: QUEUE_QueueIngredientsCsvSingle })
  async handleMessage(message: QUEUE_QueueIngredientsCsvSingle_TMPL, delivery: AckRmq) {
    // Process incoming messages from the channel
    Logger.log(`Received message on channel(${message.requestId}): ${JSON.stringify(message)}`);
    try {
      // if we had filter method we could establish pair of working entities
      // for now doing them separately
      // ------------------------------------
      // this does not work as good as hoped on fresh insert - would marked that for rework
      let supplier, ingredient;
      await Promise.allSettled([
        (async () => {
          await this.supplierService.getManager().transaction(async (manager) => {
            const name = cleanString(message.supplierName).toUpperCase();
            try {
              supplier = await this.supplierService.findOneByName(name, [], manager);
            } catch (err) {
              Logger.error(err, { requestId: message.requestId });
            }
            // to avoid race condition
            if (!supplier) {
              const newSupplier = new Supplier();
              newSupplier.name = name;
              supplier = await this.supplierService.insert(newSupplier, manager);

              this.pubSub
                .publish(PUBSUB_QueueAddedSupplier, <PUBSUB_QueueAddedSupplier_TMPL>{
                  requestId: message.requestId,
                  id: supplier.id,
                  name: supplier.name,
                })
                .finally();
            }
          });
        })(),
        (async () => {
          await this.ingredientService.getManager().transaction(async (manager) => {
            const name = cleanString(message.ingredientName).toUpperCase();
            try {
              ingredient = await this.ingredientService.findOneByName(name, [], manager);
            } catch (err) {
              Logger.error(err, { requestId: message.requestId });
            }
            if (!ingredient) {
              try {
                const newIngredient = new Ingredient();
                newIngredient.name = name;
                ingredient = await this.ingredientService.insert(newIngredient, manager);
                this.pubSub
                  .publish(PUBSUB_QueueAddedIngredient, <PUBSUB_QueueAddedIngredient_TMPL>{
                    requestId: message.requestId,
                    id: ingredient.id,
                    name: ingredient.name,
                  })
                  .finally();
              } catch (err) {
                Logger.error(err, { requestId: message.requestId });
              }
            }
          });
        })(),
      ]);

      if (supplier && ingredient) {
        await this.supplierToIngredient.getManager().transaction(async (manager) => {
          const existing = await this.supplierToIngredient.findOneBySupplierAndIngridient(
            supplier.id,
            ingredient.id,
            [],
            manager
          );

          if (!existing) {
            const entry = new SupplierToIngredient();
            (entry.ingredientId = ingredient.id), (entry.supplierId = supplier.id);

            await this.supplierToIngredient.insert(entry);
          }
        });
      }

      delivery.ack();
    } catch (err) {
      // todo handle backfall either back on queue or on deadqueue
      Logger.error(err);
      delivery.nack();
    }
  }
}
