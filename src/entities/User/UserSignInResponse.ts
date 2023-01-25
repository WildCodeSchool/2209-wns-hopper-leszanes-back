import { Field, InputType } from "type-graphql";
import { User } from "./User";

@InputType()
export class UserSignInResponse {
  @Field()
  user: User;

  @Field()
  token: string;
}
