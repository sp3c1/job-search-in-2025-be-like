import { PubSubEngine } from 'graphql-subscriptions';

import {
  PUBSUB_QueueAddedSupplier,
  PUBSUB_QueueAddedSupplier_TMPL,
  withCancel,
} from '@app/common';
import { Inject } from '@nestjs/common';
import {
  Context,
  Resolver,
  Subscription,
} from '@nestjs/graphql';

import {
  AllowedRoles,
  Roles,
} from '../../auth';
import { IContext } from '../config/apollo.config';

@Resolver()
export class SupplierSubscriptionResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine) { }

  @Roles([AllowedRoles.All])
  @Subscription(() => PUBSUB_QueueAddedSupplier_TMPL, {
    nullable: true,
    filter: async (payload: PUBSUB_QueueAddedSupplier_TMPL, variables, ctx: IContext) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      return true;
    },
    resolve: (value: PUBSUB_QueueAddedSupplier_TMPL) => {
      try {
        return value;
      } catch (_) {
        return null;
      }
    },
  })
  async trackSupplierCreation(@Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator(PUBSUB_QueueAddedSupplier), async () => {
      // discconnect handling
    });
  }
}
