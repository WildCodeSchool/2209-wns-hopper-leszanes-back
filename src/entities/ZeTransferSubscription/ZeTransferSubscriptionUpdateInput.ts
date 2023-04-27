import { Field, ID, InputType } from "type-graphql";

@InputType()
export class ZeTransferSubscriptionUpdateInput {
  @Field(() => ID)
  id: number;

  @Field()
  isActive: boolean;

  @Field(() => ID)
  zeTransferSubscriptionPlanId: number;
}
