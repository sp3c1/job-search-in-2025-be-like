import { PubSubEngine } from 'graphql-subscriptions';

import { FieldMap, Pagination } from '@app/common';
import { ProjectionService } from '@app/common/coreModels';
import { Reciepie } from '@app/common/coreModels/models/reciepe.entity';
import { ReciepieToIngredient } from '@app/common/coreModels/models/reciepeToIngredient.entity';
import { Inject } from '@nestjs/common';
import { Args, ArgsType, Field, InputType, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AllowedRoles, Roles } from '../../auth';
import { ReciepieService, ReciepieToIngredientService } from './reciepe.service';

@ArgsType()
class ArgsGet {
  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsEditReciepie {
  @Field((_) => Int)
  id: number;

  @Field((_) => String)
  name: string;
}

@ArgsType()
class ArgsCreateReciepe {
  @Field()
  name: string;

  @Field((_) => [IngredientsWithQuantity])
  ingredients: IngredientsWithQuantity[];
}

@InputType()
class IngredientsWithQuantity {
  @Field((_) => Int)
  ingredientId: number;

  @Field((_) => Int)
  quantity: number;
}

@InputType()
class ArgsIngerdienReciepeInput {
  @Field((_) => Int)
  ingredientId: number;

  @Field((_) => Int)
  quanty: number;
}

@ArgsType()
class ArgsIngerdienReciepe {
  @Field((_) => [ArgsIngerdienReciepeInput])
  changes: ArgsIngerdienReciepeInput[];

  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsRemove {
  @Field((_) => [Int])
  ingredientIds: number[];

  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsPagi {
  @Field((_) => Pagination)
  pagination: Pagination;
}

@Resolver()
export class ReciepieResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    private projection: ProjectionService,
    private reciepieService: ReciepieService,
    private reciepieToIngredientService: ReciepieToIngredientService
  ) {}

  @Roles([AllowedRoles.All])
  @Query((_) => Reciepie)
  async reciepe(@Args() { id }: ArgsGet, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);

    const target = await this.reciepieService.findOneById(id, relations);
    return target;
  }

  @Roles([AllowedRoles.All])
  @Query((_) => [Reciepie])
  async reciepes(@Args() { pagination }: ArgsPagi, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);

    const target = await this.reciepieService.findAll(pagination, relations);
    return target;
  }

  @Roles([AllowedRoles.All])
  @Mutation((_) => Reciepie)
  async createReciepte(@Args() { name, ingredients }: ArgsCreateReciepe, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);
    const reciepe = new Reciepie();
    reciepe.name = name;

    await this.reciepieService.save(reciepe);
    // obviously not fastes way to do it or not most secure
    for (const ingredient of ingredients) {
      const candiate = new ReciepieToIngredient();
      candiate.reciepeId = reciepe.id;
      candiate.ingredientId = ingredient.ingredientId;
      candiate.quantity = ingredient.quantity;

      await this.reciepieToIngredientService.save(candiate);
    }

    return this.reciepieService.findOneById(reciepe.id, relations);
  }

  @Roles([AllowedRoles.All])
  @Mutation((_) => Reciepie)
  async editRecipeiIngredients(
    @Args() { id, changes }: ArgsIngerdienReciepe,
    @FieldMap() fieldMap
  ) {
    const relations = this.projection.reciepe(fieldMap);
    // todo
    for (const change of changes) {
      const entry = await this.reciepieToIngredientService.findOneByReciepeIdIngredientId(
        id,
        change.ingredientId
      );
      if (entry) {
        entry.quantity = change.quanty;
      }
      await this.reciepieToIngredientService.save(entry);
    }

    return this.reciepieService.findOneById(id, relations);
  }

  @Roles([AllowedRoles.All])
  @Mutation((_) => Reciepie)
  async removeRecipeiIngredients(@Args() { id, ingredientIds }: ArgsRemove, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);
    for (const ingredientId of ingredientIds) {
      await this.reciepieToIngredientService.delete(id, ingredientId);
    }

    return this.reciepieService.findOneById(id, relations);
  }

  @Roles([AllowedRoles.All])
  @Mutation((_) => [Reciepie])
  async addRecipeiIngredients(@Args() { id, changes }: ArgsIngerdienReciepe, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);
    for (const change of changes) {
      const entry = new ReciepieToIngredient();
      entry.reciepeId = id;
      entry.ingredientId = change.ingredientId;
      entry.quantity = change.quanty;
      await this.reciepieToIngredientService.save(entry);
    }

    return this.reciepieService.findOneById(id, relations);
  }

  @Roles([AllowedRoles.All])
  @Mutation((_) => Reciepie)
  async editReciepieIngredients(@Args() { id, name }: ArgsEditReciepie, @FieldMap() fieldMap) {
    const relations = this.projection.reciepe(fieldMap);
    const reciepe = await this.reciepieService.findOneById(id);
    reciepe.name = name;

    await this.reciepieService.save(reciepe);
    return this.reciepieService.findOneById(reciepe.id, relations);
  }
}
