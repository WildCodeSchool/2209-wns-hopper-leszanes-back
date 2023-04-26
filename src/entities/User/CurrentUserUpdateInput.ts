import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CurrentUserUpdateInput {
  @Field()
  @Length(2, 50) // don't forget Li
  name: string;

  @Field()
  @Length(7, 50)
  @IsEmail()
  email: string;
}
