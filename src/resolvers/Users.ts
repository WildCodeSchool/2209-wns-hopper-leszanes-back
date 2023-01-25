import { Resolver, Query, Mutation, Arg, ID } from "type-graphql";
import { hash } from "argon2";
import { User } from "../entities/User/User";
import { UserCreateInput } from "../entities/User/UserCreateInput";
import { UserUpdateInput } from "../entities/User/UserUpdateInput";
import { userRepository } from "../repositories/userRepository";

@Resolver()
export class UserResolver {
  // get all
  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    const users = await userRepository.find();
    return users;
  }

  // get by id
  @Query(() => User)
  async getUser(@Arg("id", () => ID) id: number): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  // create
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => UserCreateInput) data: UserCreateInput
  ): Promise<User> {
    const newUser = {
      ...data,
      storage: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const hashedPassword = await hash(newUser.password);
    newUser.password = hashedPassword;
    const result = await userRepository.save(newUser);
    return result;
  }

  // update
  @Mutation(() => User, { nullable: true })
  async updateUser(@Arg("data") data: UserUpdateInput): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id: data.id },
    });

    if (!user) {
      return null;
    }

    const userUpdated = {
      ...user,
      ...data,
      updated_at: new Date(),
    };

    const result = await userRepository.save(userUpdated);
    return result;
  }

  // delete
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id", () => ID) id: number): Promise<boolean> {
    const user = await userRepository.findOne({
      where: { id },
    });

    if (user) {
      try {
        await userRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
