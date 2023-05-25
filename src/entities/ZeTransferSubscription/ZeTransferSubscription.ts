import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ZeTransferSubscriptionPlan } from "../ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlan";
import { BaseEntity } from "../../utils/loadRelation";

@Entity()
@ObjectType()
export class ZeTransferSubscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  isActive: boolean;

  @Column()
  @Field()
  isYearly: boolean;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;

  @Field(() => ZeTransferSubscriptionPlan, { nullable: false })
  @OneToOne(() => ZeTransferSubscriptionPlan, {
    nullable: false,
  })
  @JoinColumn()
  zeTransferSubscriptionPlan: ZeTransferSubscriptionPlan;
}
