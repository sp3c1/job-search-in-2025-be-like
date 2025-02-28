import {
  FieldMap,
  Pagination,
} from '@app/common';
import { ProjectionService } from '@app/common/coreModels';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import {
  Args,
  ArgsType,
  Field,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  AllowedRoles,
  Roles,
} from '../../auth';
import { IngredientPriceService } from '../ingredientPrice/ingredientPrice.service';
import { SupplierToIngredientService } from '../supplier/supplierToIngredient.service';
import { IngredientService } from './ingredient.service';

@ArgsType()
class ArgsGetIngredientById {
  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsIngredientPrices {
  @Field((_) => Pagination, { defaultValue: { size: 50, page: 1 } })
  pagination: Pagination;
}

@ArgsType()
class ArgsSupplierToIngredient {
  // could later add optional filtering
  // @Field(_ => [Int], {nullable: true})
  // ids?: number[];

  @Field((_) => Pagination)
  pagination: Pagination;
}

@Resolver((_) => Ingredient)
export class IngredientResolver {
  constructor(
    private projection: ProjectionService,
    private ingredientService: IngredientService,
    private priceService: IngredientPriceService,
    private supplierToIngredientService: SupplierToIngredientService
  ) { }

  @Roles([AllowedRoles.All])
  @Query((_) => Ingredient)
  async ingredient(@Args() { id }: ArgsGetIngredientById, @FieldMap() fieldMap) {
    const projection = this.projection.ingredient(fieldMap);
    const target = await this.ingredientService.findOneById(id, projection); // hydrate joins
    return target;
  }

  @Roles([AllowedRoles.All])
  @Query((_) => [Ingredient])
  async ingredients(@Args() { pagination }: ArgsSupplierToIngredient, @FieldMap() fieldMap) {
    const projection = this.projection.ingredient(fieldMap);
    const target = await this.ingredientService.findAll(pagination, projection); // hydrate joins
    return target;
  }


  @ResolveField((_) => IngredientPrice)
  async latestIngredientPrice(@Parent() ingredient: Ingredient) {
    if (!ingredient) {
      return null;
    }

    return await this.priceService.findLatestByIngredientId(ingredient.id);
  }

  @ResolveField((_) => [IngredientPrice])
  async ingredientPrices(
    @Parent() ingredient: Ingredient,
    @Args() { pagination }: ArgsIngredientPrices
  ) {
    if (!ingredient) {
      return null;
    }

    return await this.priceService.findAllByIngredientId(ingredient.id, pagination);
  }

  @ResolveField((_) => [SupplierToIngredient])
  async suppliers(@Parent() ingredient: Ingredient, @Args() { pagination }: ArgsIngredientPrices) {
    if (!ingredient) {
      return null;
    }

    return await this.priceService.findAllByIngredientId(ingredient.id, pagination);
  }

  @ResolveField((_) => [SupplierToIngredient])
  async supplierToIngredient(
    @Parent() ingredient: Ingredient,
    @Args() { pagination }: ArgsSupplierToIngredient,
    @FieldMap() fieldMap
  ) {
    if (!ingredient?.id) {
      return null;
    }

    const relations = this.projection.supplierToIngredient(fieldMap);
    return await this.supplierToIngredientService.findByIngredientId(
      ingredient.id,
      pagination,
      relations
    );
  }
}
