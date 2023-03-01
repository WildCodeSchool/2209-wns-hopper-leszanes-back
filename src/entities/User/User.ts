import { ObjectType, Field, ID } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field(() => String)
  name: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @Column()
  @Field()
  created_at: Date;

  @Column()
  @Field()
  updated_at: Date;

  @Column()
  @Field()
  storage: number;
}
