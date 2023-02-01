import { createTransport } from "nodemailer";

if (
  !process.env.EMAIL_HOST ||
  !process.env.EMAIL_PORT ||
  !process.env.EMAIL_ADRESS ||
  !process.env.EMAIL_PASSWORD
) {
  throw new Error("Missing env variables to provide mails");
}

export const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_ADRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});
