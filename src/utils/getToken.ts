import { sign } from "jsonwebtoken";
import { User } from "../entities/User/User";

export const getToken = (user: User) => {
  if (!process.env.JWT_SECRET) return null;
  try {
    const token = sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );
    return token;
  } catch (error) {
    return null;
  }
};
