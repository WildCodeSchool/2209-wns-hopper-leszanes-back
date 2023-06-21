import { Field, InputType } from "type-graphql";

@InputType()
export class ZeTransferSubscriptionCreateInput {
  @Field()
  isActive: boolean;

  @Field()
  isYearly: boolean;

  @Field({nullable})
  zeTransferSubscriptionPlanId: number;
}
