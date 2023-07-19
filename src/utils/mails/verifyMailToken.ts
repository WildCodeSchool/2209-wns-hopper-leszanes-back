import { verify } from "jsonwebtoken";
import { userRepository } from "../../repositories/userRepository";

export const verifyMailToken = async (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET env variable is not defined");
  }

  try {
    const payload = verify(token, process.env.JWT_SECRET);
    if (
      typeof payload !== "string" &&
      "id" in payload &&
      "invitedBy" in payload
    ) {
      const invitedBy = await userRepository.findOne({
        where: { email: String(payload.invitedBy), id: Number(payload.id) },
        relations: ["contacts"],
      });

      if (!invitedBy) {
        return null;
      }

      if (invitedBy.isActive) {
        return invitedBy;
      }
    }
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // @ts-expect-error : error is an Error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new Error(error.message);
  }
  return null;
};
