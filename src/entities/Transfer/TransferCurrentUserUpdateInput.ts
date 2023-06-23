import { Length } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType()
export class TransferCurrentUserUpdateInput {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  @Length(2, 50)
  name: string;

  @Field({ nullable: true })
  @Length(2, 255)
  description: string;

  @Field(() => [ID], { nullable: true })
  userIds?: number[];

  @Field(() => [ID], { nullable: true })
  fileIds?: number[];
}
