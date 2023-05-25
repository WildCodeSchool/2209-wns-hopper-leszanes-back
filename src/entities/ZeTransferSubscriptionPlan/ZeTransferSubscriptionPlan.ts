import { ObjectType, Field, ID, Float } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../utils/loadRelation";

@Entity()
@ObjectType()
export class ZeTransferSubscriptionPlan extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Column({ type: "float" })
  @Field(() => Float)
  price: number;

  @Column()
  @Field()
  storage: number;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;
}
