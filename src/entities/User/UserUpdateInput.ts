import { IsBoolean, IsEmail, IsNumber, Length } from "class-validator";
import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UserUpdateInput {
  @Field(() => ID, { nullable: true })
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @Length(2, 50) // don't forget Li
  name: string;

  @Field({ nullable: true })
  @Length(7, 50)
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsBoolean()
  isAdmin: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  isActive: boolean;

  @Field(() => ID, { nullable: true })
  @IsNumber()
  zeTransferSubscriptionId: number;
}
