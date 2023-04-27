import { Field, InputType } from "type-graphql";

@InputType()
export class TransferCreateInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  isPrivate: boolean;
}
