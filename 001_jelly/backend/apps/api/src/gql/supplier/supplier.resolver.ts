import { PubSubEngine } from 'graphql-subscriptions';

import {
  FieldMap,
  Pagination,
} from '@app/common';
import {
  ProjectionService,
  SupplierToIngredient,
} from '@app/common/coreModels';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { Inject } from '@nestjs/common';
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

import { SupplierService } from './supplier.service';
import { SupplierToIngredientService } from './supplierToIngredient.service';

@ArgsType()
class ArgsGetSupplier {
  @Field((_) => Int)
  id: number;
}

@ArgsType()
class ArgsSupplierToIngredient {
  // could later add optional filtering
  // @Field(_ => [Int], {nullable: true})
  // ids?: number[];

  @Field((_) => Pagination, { defaultValue: { size: 50, page: 1 } })
  pagination: Pagination;
}

@Resolver((_) => Supplier)
export class SupplierResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    private projection: ProjectionService,
    private supplieService: SupplierService,
    private supplierToIngredientService: SupplierToIngredientService
  ) { }

  @Query((_) => Supplier)
  async supplier(@Args() { id }: ArgsGetSupplier, @FieldMap() fieldMap) {
    const relations = this.projection.supplier(fieldMap);
    const target = await this.supplieService.findOneById(id, relations);

    return target;
  }

  @Query((_) => [Supplier])
  async suppliers(@Args() { pagination }: ArgsSupplierToIngredient, @FieldMap() fieldMap) {
    const relations = this.projection.supplier(fieldMap);
    const target = await this.supplieService.findAll(pagination, relations);

    return target;
  }

  @ResolveField((_) => [SupplierToIngredient])
  async supplierToIngredient(
    @Parent() supplier: Supplier,
    @Args() { pagination }: ArgsSupplierToIngredient,
    @FieldMap() fieldMap
  ) {
    if (!supplier?.id) {
      return null;
    }

    const relations = this.projection.supplierToIngredient(fieldMap);
    return await this.supplierToIngredientService.findBySupplierId(
      supplier.id,
      pagination,
      relations
    );
  }
}
