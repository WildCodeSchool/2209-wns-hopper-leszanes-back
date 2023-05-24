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
import { CurrentUserUpdateInput } from "../entities/User/CurrentUserUpdateInput";
import { zeTransferSubscriptionRepository } from "../repositories/zeTransferSubscriptionRepository";

@Resolver()
export class UserResolver {
  // get all users
  // only connected user may read that
  @Authorized("admin")
  @Query(() => [User])
  async getUsers(): Promise<User[]> {
    const users = await userRepository.find();
    return users;
  }

  // get by id
  @Authorized("admin")
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hashedPassword = await hash(newUser.password);
      newUser.password = hashedPassword;
      const user = await userRepository.save(newUser);

      const token = getToken(user);

      return {
        user,
        token,
      };
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  // update
  @Authorized()
  @Mutation(() => User, { nullable: true })
  async updateCurrentUser(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: CurrentUserUpdateInput
  ): Promise<User | null> {
    const { user } = context;
    const sub = await zeTransferSubscriptionRepository.findOne({
      where: { id: data.zeTransferSubscriptionId },
      relations: { zeTransferSubscriptionPlan: true },
    });
    if (user && sub) {
      const userUpdated = {
        ...user,
        name: data.name,
        email: data.email,
        zeTransferSubscription: sub,
        updatedAt: new Date(),
      };
      const result = await userRepository.save(userUpdated);
      return result;
    }

    return null;
  }

  // update
  @Authorized("admin")
  @Mutation(() => User, { nullable: true })
  async updateUser(@Arg("data") data: UserUpdateInput): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id: data.id },
      relations: { zeTransferSubscription: true },
    });
    if (!user) {
      return null;
    }
    let sub;
    if (data.zeTransferSubscriptionId) {
      sub = await zeTransferSubscriptionRepository.findOne({
        where: { id: data.zeTransferSubscriptionId },
        relations: { zeTransferSubscriptionPlan: true },
      });
    } else {
      sub = undefined;
    }

    if (sub === null) {
      return null;
    }
    const userUpdated = {
      ...user,
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
      zeTransferSubscription: sub,
      updatedAt: new Date(),
    };
    const result = await userRepository.save(userUpdated);
    return result;
  }

  // delete
  @Authorized("admin")
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
