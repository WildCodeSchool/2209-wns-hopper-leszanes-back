import { Field, InputType } from "type-graphql";

@InputType()
export class TransferCurrentUserUpdateInput {
  @Field()
  name: string;

  @Field()
  description: string;
}
