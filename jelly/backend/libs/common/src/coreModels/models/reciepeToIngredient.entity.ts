import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Ingredient } from './ingredient.entity';
import { Reciepie } from './reciepe.entity';

@ObjectType()
@Entity('reciepe_to_ingredient')
@Unique('uniq_reciepeToIngredient', ['reciepeId', 'ingredientId'])
export class ReciepieToIngredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @PrimaryColumn()
  @Field((_) => Int)
  reciepeId: number;

  @ManyToOne((_) => Reciepie, (reciepe) => reciepe.reciepeToIngredient)
  @JoinColumn({ name: 'reciepeId' })
  @Field((_) => Reciepie)
  reciepe: Reciepie;

  @PrimaryColumn()
  @Field((_) => Int)
  ingredientId: number;

  @ManyToOne((_) => Ingredient, (ingredient) => ingredient.reciepeToIngredient)
  @JoinColumn({ name: 'ingredientId' })
  @Field((_) => Ingredient)
  ingredient: Ingredient;

  @Field((_) => Int)
  @Column({ type: 'int', default: 0, nullable: true })
  quantity: number;
}
