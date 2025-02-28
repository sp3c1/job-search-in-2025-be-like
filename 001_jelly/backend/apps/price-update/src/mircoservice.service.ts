import { RedisPubSub } from 'graphql-redis-subscriptions';

import {
  AckRmq,
  PUBSUB_QueueIngredientsPriceChange,
  PUBSUB_QueueIngredientsPriceChange_TMPL,
  QUEUE_QueueIngredientsPrice,
  QUEUE_QueueIngredientsPrice_TMPL,
  RmqSubscribe,
} from '@app/common';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  IngredientPriceService,
  IngredientService,
} from './services';

@Injectable()
export class MircoServiceService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private ingredientPriceService: IngredientPriceService,
    private ingredientService: IngredientService
  ) { }


  @RmqSubscribe({
    queue: QUEUE_QueueIngredientsPrice
  })
  async handleMessage(message: QUEUE_QueueIngredientsPrice_TMPL, delivery: AckRmq) {
    // Process incoming messages from the channel
    Logger.log(`Received message on channel(${message.requestId}): ${JSON.stringify(message)}`);
    try {
      // ------------------------------------
      await this.ingredientService.getManager().transaction(async (manager) => {
        let ingredient = await this.ingredientService.findOneByName(message.name, [], manager);
        if (!ingredient) {
          // recove
          const newIngredient = new Ingredient();
          newIngredient.name = message.name;
          ingredient = await this.ingredientService.insert(newIngredient, manager).catch(async _ => {
            // instead of readoing a call through queue, try to recover
            return await this.ingredientService.findOneByName(message.name, [], manager);
          })
        }

        if (!ingredient) {
          // if still missing put on deadleater / dispose
          delivery.nack()
          return;
        }

        const lastPrice = await this.ingredientPriceService.findLatestByIngredientId(ingredient.id);
        const newPrice = new IngredientPrice();
        newPrice.ingredientId = ingredient.id;
        newPrice.changedAt = new Date(message.changedAt);
        newPrice.price = +message.price;

        await this.ingredientPriceService.insert(newPrice, manager);
        delivery.ack();

        const priceReplace = !!lastPrice && lastPrice.changedAt < newPrice.changedAt;

        if (priceReplace || !lastPrice) {
          this.pubSub
            .publish(PUBSUB_QueueIngredientsPriceChange, <PUBSUB_QueueIngredientsPriceChange_TMPL>{
              changedAt: newPrice.changedAt,
              ingredientId: newPrice.ingredientId,
              price: newPrice.price,
              requestId: message.requestId,
            })
            .finally();
        }
      });

    } catch (err) {
      // todo handle backfall either back on queue or on deadqueue
      Logger.error(err);
      delivery.nack()
    }
  }
}
