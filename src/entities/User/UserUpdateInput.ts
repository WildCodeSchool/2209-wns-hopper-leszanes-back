import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UserUpdateInput {
  @Field(() => ID, { nullable: true })
  id: number;

  @Field({ nullable: true })
  @Length(2, 50) // don't forget Li
  name: string;

  @Field({ nullable: true })
  @Length(7, 50)
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  isAdmin: boolean;

  @Field(() => ID, { nullable: true })
  zeTransferSubscriptionId: number;
}
