import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ReciepieToIngredient } from './reciepeToIngredient.entity';

@Entity()
@ObjectType()
export class Reciepie extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @Column({ default: '', unique: true })
  @Field((_) => String)
  name: string;

  @OneToMany(() => ReciepieToIngredient, (reciepeToIngredient) => reciepeToIngredient.reciepe, {
    nullable: true,
  })
  @JoinTable()
  @Field((_) => [ReciepieToIngredient]) // resolve with pagination
  reciepeToIngredient: ReciepieToIngredient[];

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
