import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { SupplierToIngredient } from './supplierToIngredient.entity';

@Entity()
@ObjectType()
export class Supplier extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @Index() // todo fix the index
  @Column({ default: '', unique: true })
  @Field((_) => String)
  name: string;

  @OneToMany(
    () => SupplierToIngredient,
    (supplierToIngredient) => supplierToIngredient.supplierId,
    { nullable: true }
  )
  @Field((_) => [SupplierToIngredient]) // resolve with pagination
  supplierToIngredient: SupplierToIngredient;
}
