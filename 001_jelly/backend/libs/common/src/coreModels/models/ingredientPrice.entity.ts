import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { Ingredient } from './ingredient.entity';

@Entity()
@ObjectType()
export class IngredientPrice extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @Column({ default: 0, type: 'decimal' })
  @Field((_) => Float) // would rather store in Ints and normalize the price for future calc
  price: number;

  @Field((_) => Int, { nullable: true })
  @Column({ type: 'integer', nullable: true })
  ingredientId: number;

  @ManyToOne(() => Ingredient, { nullable: true })
  @JoinColumn({ name: 'ingredientId' })
  @Field((_) => Ingredient, { nullable: true })
  ingredient: Ingredient;

  @Field((_) => Date)
  @Index()
  @Column({ type: 'timestamptz' })
  changedAt: Date;
}
