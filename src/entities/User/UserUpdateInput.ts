import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UserUpdateInput {
  @Field(() => ID)
  id: number;

  @Field()
  @Length(2, 50) // don't forget Li
  name: string;

  @Field()
  @Length(7, 50)
  @IsEmail()
  email: string;

  @Field()
  isAdmin: boolean;
}
