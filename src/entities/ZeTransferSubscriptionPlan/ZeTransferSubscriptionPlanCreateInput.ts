import { Length, Max, Min } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class ZeTransferSubscriptionPlanCreateInput {
  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Min(5)
  @Max(100)
  price: number;

  @Field()
  @Min(5)
  @Max(1000)
  storage: number;
}
