import { sign } from "jsonwebtoken";
import { User } from "../entities/User/User";

export const getToken = (user?: User, data: object | undefined = undefined) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET env variable is not defined");
  }

  if (!user && !data) throw new Error("You must provide a user or data");

  try {
    const token = sign(
      data ?? {
        id: user?.id,
      },
      process.env.JWT_SECRET
    );
    return token;
  } catch (error: unknown) {
    throw new Error(JSON.stringify(error));
  }
};
