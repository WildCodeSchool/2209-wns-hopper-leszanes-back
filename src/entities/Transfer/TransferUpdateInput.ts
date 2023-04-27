import { Field, ID, InputType } from "type-graphql";

@InputType()
export class TransferUpdateInput {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;
}
