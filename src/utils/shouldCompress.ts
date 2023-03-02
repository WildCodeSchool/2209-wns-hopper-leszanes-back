import compression from "compression";
import { Request, Response } from "express";

export const shouldCompress = (req: Request, res: Response) => {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return compression.filter(req, res);
};
