import { IsNumber, IsString, Length, Max } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class FileCreateInput {
  @Field()
  @Length(2, 200)
  @IsString()
  name: string;

  @Field()
  @IsString()
  fileName: string;

  @Field()
  @Max(500_000_000_000)
  @IsNumber()
  size: number;

  @Field()
  @Length(2, 100)
  @IsString()
  type: string;

  @Field()
  @IsNumber()
  transferId: number;
}
