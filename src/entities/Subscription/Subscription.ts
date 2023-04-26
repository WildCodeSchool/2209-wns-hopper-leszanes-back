import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { SubscriptionPlan } from "../SubscriptionPlan/SubscriptionPlan";

@Entity()
@ObjectType()
export class Subscription {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  isActive: boolean;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;

  @Field(() => SubscriptionPlan, { nullable: false })
  @OneToOne(() => SubscriptionPlan, { nullable: false })
  @JoinColumn()
  subscriptionPlan: SubscriptionPlan;
}
