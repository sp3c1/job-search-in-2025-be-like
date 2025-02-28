import {
  BaseEntity,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Ingredient } from './ingredient.entity';
import { Supplier } from './supplier.entity';

@ObjectType()
@Entity('supplier_to_ingredient')
@Unique('uniq_SupplierToIngredient', ['supplierId', 'ingredientId'])
export class SupplierToIngredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @PrimaryColumn()
  @Field((_) => Int)
  supplierId: number;

  @ManyToOne((_) => Supplier, (supplier) => supplier.id)
  @Field((_) => Supplier)
  supplier: Supplier;

  @PrimaryColumn()
  @Field((_) => Int)
  ingredientId: number;

  @ManyToOne((_) => Ingredient, (ingredient) => ingredient.id)
  @Field((_) => Ingredient)
  ingredient: Ingredient;

  // stocks - would go her
}
