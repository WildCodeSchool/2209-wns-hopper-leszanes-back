import { sign } from "jsonwebtoken";
import { User } from "../entities/User/User";

export const getToken = (user: User) => {
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET env variable is not defined");
  try {
    const token = sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );
    return token;
  } catch (error: unknown) {
    throw new Error(JSON.stringify(error));
  }
};
