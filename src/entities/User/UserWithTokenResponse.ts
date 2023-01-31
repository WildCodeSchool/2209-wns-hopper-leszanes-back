import { Field, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class UserWithTokenResponse {
  @Field()
  user: User;

  @Field()
  token: string;
}
