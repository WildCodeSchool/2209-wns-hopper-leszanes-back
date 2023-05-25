import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CurrentUserUpdateInput {
  @Field({ nullable: true })
  @Length(2, 50)
  name: string;

  @Field({ nullable: true })
  @Length(7, 50)
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  zeTransferSubscriptionId: number;
}
