import { AuthChecker } from "type-graphql";
import { verify as jwtVerify } from "jsonwebtoken";
import { userRepository } from "./repositories/userRepository";
import { User } from "./entities/User/User";

export type AuthCheckerType = {
  token: string | null;
  user: User | null;
};

export const authChecker: AuthChecker<AuthCheckerType> = async ({
  context,
}) => {
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

  const { token } = context;
  if (!token) {
    return false;
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return false;
  }

  try {
    const payload = jwtVerify(token, process.env.JWT_SECRET);
    if (typeof payload !== "string" && "id" in payload) {
      const userFound = await userRepository.findOne({
        where: { id: payload.id as number },
        relations: [],
      });

      if (!userFound) {
        return false;
      }

      context.user = userFound;
      return true;
    }
  } catch (error) {
    return false;
  }
  return false; // or false if access is denied
};
