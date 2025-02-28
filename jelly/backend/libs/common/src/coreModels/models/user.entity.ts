import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum UserRole {
  Business = 'business',
  User = 'user',
  Admin = 'admin',
  ApiKey = 'apikey',
  Unknown = 'unknown',
}

export const UserRoleEnumType = registerEnumType(UserRole, {
  name: 'UserRole',
});

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_) => Int)
  id: number;

  @Column({ default: '' })
  @Field((_) => String)
  name: string;

  @Column({ unique: true })
  @Field((_) => String)
  email: string;

  @Column({ default: '' })
  password: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.User })
  @Field((_) => UserRole, { defaultValue: UserRole.User })
  role: UserRole;
}
