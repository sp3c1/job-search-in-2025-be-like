import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { ReciepieToIngredient } from './reciepeToIngredient.entity';
import { SupplierToIngredient } from './supplierToIngredient.entity';

@Entity()
@ObjectType()
export class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @Column({ default: '', unique: true })
  @Field((_) => String)
  name: string;

  @OneToMany(
    () => SupplierToIngredient,
    (supplierToIngredient) => supplierToIngredient.ingredientId,
    { nullable: true }
  )
  @Field((_) => [SupplierToIngredient]) // resolve with pagination
  supplierToIngredient: SupplierToIngredient[];

  @ManyToOne(() => ReciepieToIngredient, (reciepeToIngredient) => reciepeToIngredient.ingredient, {
    nullable: true,
  })
  @JoinTable()
  @Field((_) => [ReciepieToIngredient]) // resolve with pagination
  reciepeToIngredient: ReciepieToIngredient[];
}
