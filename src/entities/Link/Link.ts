import { ObjectType, Field, ID } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../utils/loadRelation";

@Entity()
@ObjectType()
export class Link extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  token: string;

  @Column()
  @Field()
  startDate: Date;

  @Column({ nullable: true, default: null })
  @Field({ nullable: true, defaultValue: null })
  endDate: Date;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;
}
