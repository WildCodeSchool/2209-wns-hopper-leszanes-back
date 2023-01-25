import { Resolver, Query, Mutation, Arg, ID, Ctx } from "type-graphql";
import { hash, verify } from "argon2";
import { sign, verify as jwtVerify } from "jsonwebtoken";
import { User } from "../entities/User/User";
import { UserCreateInput } from "../entities/User/UserCreateInput";
import { UserUpdateInput } from "../entities/User/UserUpdateInput";
import { userRepository } from "../repositories/userRepository";
import { UserSignInResponse } from "../entities/User/UserSignInResponse";

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

  // get by id
  @Query(() => User)
  async getCurrentUser(
    @Ctx() context: { token: string | null }
  ): Promise<User | null> {
    const { token } = context;

    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    try {
      const { id } = jwtVerify(token, process.env.JWT_SECRET);
      const user = await userRepository.findOne({
        where: { id },
        relations: [],
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // create
  @Mutation(() => User)
  async createUser(@Arg("data") data: UserCreateInput): Promise<User> {
    const newUser = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
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

  // sign in
  @Mutation(() => UserSignInResponse, { nullable: true })
  async signIn(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserSignInResponse | null> {
    try {
      if (!email || !password) {
        return null;
      }

      const user = await userRepository.findOne({
        where: { email },
      });

      if (
        !user ||
        !(await verify(user.password, password)) ||
        !process.env.JWT_SECRET
      ) {
        return null;
      }

      const token = sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET
      );

      return {
        user,
        token,
      };
    } catch (error) {
      return null;
    }
  }
}
