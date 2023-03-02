import { Length } from "class-validator";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class FileCreateInput {
  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Length(2, 50)
  filename: string;

  @Field()
  @Length(2, 250)
  description: string;

  @Field(() => Int)
  created_by: number;

  @Length(2, 50)
  @Field()
  type: string;

  @Field()
  is_private: boolean;

  @Field()
  size: number;
}
