import { IsEmail, IsStrongPassword, Length } from "class-validator";
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
  @Length(12, 60)
  @IsStrongPassword()
  password: string;

  @Field({ nullable: true })
  token: string;
}
