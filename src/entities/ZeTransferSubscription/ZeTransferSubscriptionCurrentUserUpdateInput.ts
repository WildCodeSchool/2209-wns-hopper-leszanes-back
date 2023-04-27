import { Field, ID, InputType } from "type-graphql";

@InputType()
export class ZeTransferSubscriptionCurrentUserUpdateInput {
  @Field()
  isActive: boolean;

  @Field(() => ID)
  zeTransferSubscriptionPlanId: number;
}
