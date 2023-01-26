import { Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class FileCreateInput {
  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Length(2, 250)
  description: string;

  @Length(2, 50)
  @Field()
  type: string;

  @Field()
  is_private: boolean;
}
