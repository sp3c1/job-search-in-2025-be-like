import { PubSubEngine } from 'graphql-subscriptions';

import { FieldMap, withCancel } from '@app/common';
import { ProjectionService, User } from '@app/common/coreModels';
import { Inject } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Context,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';

import { AllowedRoles, Roles } from '../../auth';
import { IContext } from '../config/apollo.config';
import { UserService } from './user.service';

@ArgsType()
class ArgsGetUser {
  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsCreateUser {
  @Field((_) => String)
  email: string;

  @Field((_) => String)
  name: string;
}

@Resolver()
export class UserResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    private projection: ProjectionService,
    private userService: UserService
  ) {}

  @Query((_) => User)
  user(@Args() { id }: ArgsGetUser, @FieldMap() fieldMap) {
    const projection = this.projection.user(fieldMap);
    return this.userService.findOneById(id, projection); // hydrate joins
  }

  @Mutation((_) => User)
  async createUser(@Args() { email, name }: ArgsCreateUser, @FieldMap() fieldMap) {
    const newUser = new User();
    newUser.email = email;
    newUser.name = name;

    await this.userService.insert(newUser);

    this.pubSub.publish('channel', newUser).finally();

    const projection = this.projection.user(fieldMap);
    return this.userService.findOneById(newUser.id, projection); // hydrate joins
  }

  @Roles([AllowedRoles.All])
  @Subscription(() => User, {
    nullable: true,
    filter: async (payload: { id }, variables: { id }, ctx: IContext) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      return payload.id === variables.id;
    },
    resolve: (value) => {
      try {
        return value;
      } catch (_) {
        return null;
      }
    },
  })
  async userChange(@Args() { id }: ArgsGetUser, @Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator('channel'), async () => {
      // discconnect handling
    });
  }

  @Roles([AllowedRoles.All])
  @Subscription(() => User, {
    nullable: true,
    filter: async (payload: { id }, variables: { id }, ctx: IContext) => {
      // FILTER OUT SOCKET ID OR USER ID IF ANONyMOUS
      // return payload.id === variables.id;
      return true;
    },
    resolve: (value) => {
      try {
        return value;
      } catch (_) {
        return null;
      }
    },
  })
  async userCreated(@Context() ctx: IContext) {
    return withCancel(this.pubSub.asyncIterator('user-created'), async () => {
      // discconnect handling
    });
  }
}
