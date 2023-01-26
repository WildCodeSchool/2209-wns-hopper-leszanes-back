import { InputType, Field } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class FileUpdateInput {
  @Field()
  id: number;

  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Length(2, 250)
  description: string;

  @Field()
  type: string;

  @Field()
  is_private: boolean;
}
