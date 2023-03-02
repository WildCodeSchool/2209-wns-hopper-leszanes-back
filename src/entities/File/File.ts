import { ObjectType, Field, ID, Int } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class File {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column({ default: "fileName" })
  @Field()
  fileName: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  size: number;

  @Column()
  @Field(() => Int)
  created_by: number;

  @Column()
  @Field()
  is_private: boolean;

  @Column()
  @Field()
  created_at: Date;

  @Column()
  @Field()
  updated_at: Date;
}
