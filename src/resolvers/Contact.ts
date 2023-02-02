import { Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User/User";

@Resolver()
export class ContactResolver {

  // link a contact to a user, a contact is also a user
  @Mutation(() => User)
  async createContact() {}
}
