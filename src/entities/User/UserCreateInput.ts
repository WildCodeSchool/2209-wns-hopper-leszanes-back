import { IsEmail, Length, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class UserCreateInput {
  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Length(7, 50)
  @IsEmail()
  email: string;

  // 12 maj caract spec
  @Field()
  @MinLength(4)
  password: string;

  @Field()
  storage: number;
}
