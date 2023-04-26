import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ID,
  Ctx,
  Authorized,
} from "type-graphql";
import { hash, verify } from "argon2";
import { User } from "../entities/User/User";
import { UserCreateInput } from "../entities/User/UserCreateInput";
import { UserUpdateInput } from "../entities/User/UserUpdateInput";
import { userRepository } from "../repositories/userRepository";
import { UserWithTokenResponse } from "../entities/User/UserWithTokenResponse";
import { getToken } from "../utils/getToken";
import { AuthCheckerType } from "../auth";

@Resolver()
export class UserResolver {
  // get all users
  // only connected user may read that
  @Authorized()
  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    const users = await userRepository.find();
    return users;
  }

  // get by id
  @Query(() => User, { nullable: true })
  async getUser(@Arg("id", () => ID) id: number): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id },
      relations: ["contacts"],
    });

    if (!user) {
      return null;
    }

    return user;
  }

  @Authorized()
  @Query(() => User, { nullable: true })
  getCurrentUser(@Ctx() context: AuthCheckerType): User | null {
    return context.user;
  }

  // create
  @Mutation(() => UserWithTokenResponse, { nullable: true })
  async createUser(@Arg("data", () => UserCreateInput) data: UserCreateInput) {
    try {
      const newUser = {
        ...data,
        storage: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const hashedPassword = await hash(newUser.password);
      newUser.password = hashedPassword;
      const user = await userRepository.save(newUser);

      const token = getToken(user);

      if (!token) {
        return null;
      }

      return {
        user,
        token,
      };
    } catch (error) {
      return null;
    }
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
  @Mutation(() => UserWithTokenResponse, { nullable: true })
  async signIn(@Arg("email") email: string, @Arg("password") password: string) {
    try {
      if (!email || !password) {
        return null;
      }

      const user = await userRepository.findOne({
        where: { email },
      });

      if (!user || !(await verify(user.password, password))) {
        return null;
      }

      const token = getToken(user);

      if (!token) {
        return null;
      }

      if (await verify(user.password, password)) {
        return {
          user,
          token,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  // attach contact
  @Mutation(() => Boolean)
  async attachContact(
    @Arg("userId", () => ID) userId: number,
    @Arg("contactId", () => ID) contactId: number
  ): Promise<boolean> {
    try {
      if (userId === contactId) {
        return false;
      }

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["contacts"],
      });

      if (!user) {
        return false;
      }

      if (
        user.contacts.find(
          (contact) => Number(contact.id) === Number(contactId)
        )
      ) {
        return false;
      }

      const contact = await userRepository.findOne({
        where: { id: contactId },
      });

      if (!contact) {
        return false;
      }

      const userUpdated = {
        ...user,
        contacts: [...user.contacts, contact],
      };

      await userRepository.save(userUpdated);
      return true;
    } catch (error) {
      return false;
    }
  }

  // detach contact
  @Mutation(() => Boolean)
  async detachContact(
    @Arg("userId", () => ID) userId: number,
    @Arg("contactId", () => ID) contactId: number
  ): Promise<boolean> {
    try {
      if (userId === contactId) {
        return false;
      }

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ["contacts"],
      });

      if (!user) {
        return false;
      }

      if (
        !user.contacts.find(
          (contact) => Number(contact.id) === Number(contactId)
        )
      ) {
        return false;
      }

      const contact = await userRepository.findOne({
        where: { id: contactId },
      });

      if (!contact) {
        return false;
      }

      const userUpdated = {
        ...user,
        contacts: user.contacts.filter(
          (c) => Number(c.id) !== Number(contactId)
        ),
      };

      await userRepository.save(userUpdated);
      return true;
    } catch (error) {
      return false;
    }
  }
}
