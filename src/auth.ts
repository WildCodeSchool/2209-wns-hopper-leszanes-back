import { AuthChecker } from "type-graphql";
import { verify as jwtVerify } from "jsonwebtoken";
import { userRepository } from "./repositories/userRepository";
import { User } from "./entities/User/User";

export type AuthCheckerType = {
  token: string | null;
  user: User | null;
};

export const authChecker: AuthChecker<AuthCheckerType> = async (
  { context },
  roles
) => {
  if (roles !== undefined && Array.isArray(roles) && roles.length !== 1) {
    throw new Error("roles must be an array with one role or a string");
  }

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
        where: { id: Number(payload.id) },
        relations: [],
      });

      if (!userFound) {
        return false;
      }

      context.user = userFound;

      if (roles && roles[0] === "admin") {
        if (userFound.isAdmin) {
          return true;
        }

        return false;
      }

      return true;
    }
  } catch (error) {
    return false;
  }
  return false; // or false if access is denied
};
