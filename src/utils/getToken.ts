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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // @ts-expect-error : error is an Error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new Error(error.message);
  }
};
