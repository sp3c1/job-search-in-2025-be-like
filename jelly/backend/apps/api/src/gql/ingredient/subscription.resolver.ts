import { PubSubEngine } from 'graphql-subscriptions';

import {
  PUBSUB_QueueIngredientsPriceChange,
  PUBSUB_QueueIngredientsPriceChange_TMPL,
  withCancel,
} from '@app/common';
import { Inject } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Context,
  Field,
  Int,
  Resolver,
  Subscription,
} from '@nestjs/graphql';

import {
  AllowedRoles,
  Roles,
} from '../../auth';
import { IContext } from '../config/apollo.config';

@ArgsType()
class ArgsGetIngredientById {
  @Field((_) => Int)
  id: number;
}

@Resolver()
export class IngredientSubscriptionResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine) { }

  @Roles([AllowedRoles.All])
  @Subscription(() => PUBSUB_QueueIngredientsPriceChange_TMPL, {
    nullable: true,
    filter: async (
      payload: PUBSUB_QueueIngredientsPriceChange_TMPL,
      variables: ArgsGetIngredientById,
      ctx: IContext
    ) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      return payload.ingredientId === variables.id;
    },
    resolve: (value: PUBSUB_QueueIngredientsPriceChange_TMPL) => {
      try {
        return <PUBSUB_QueueIngredientsPriceChange_TMPL>{
          requestId: value.requestId,
          changedAt: new Date(value.changedAt),
          ingredientId: value.ingredientId,
          price: value.price,
        };
      } catch (_) {
        return null;
      }
    },
  })
  async trackIngredientPrice(@Args() { id }: ArgsGetIngredientById, @Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator(PUBSUB_QueueIngredientsPriceChange), async () => {
      // discconnect handling
    });
  }
}
