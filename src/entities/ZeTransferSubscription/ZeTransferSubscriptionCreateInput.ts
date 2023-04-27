import { Field, ID, InputType } from "type-graphql";

@InputType()
export class ZeTransferSubscriptionCreateInput {
  @Field()
  isActive: boolean;

  @Field()
  isYearly: boolean;

  @Field(() => ID)
  zeTransferSubscriptionPlanId: number;
}
