import { IsBoolean, IsDateString, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class TransferCreateInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsBoolean()
  isPrivate: boolean;

  @Field({ nullable: true })
  @IsDateString()
  startDate: string;

  @Field({ nullable: true })
  @IsDateString()
  endDate: string;
}
