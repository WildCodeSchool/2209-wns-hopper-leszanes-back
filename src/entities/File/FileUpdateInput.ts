import { InputType, Field, ID } from "type-graphql";
import { Length, Max } from "class-validator";

@InputType()
export class FileUpdateInput {
  @Field(() => ID)
  id: number;

  @Field()
  @Length(2, 50)
  name: string;

  @Field()
  @Max(500_000_000)
  size: number;

  @Field()
  @Length(2, 20)
  type: string;
}
