import { createTransport } from "nodemailer";

if (!process.env.EMAIL_ADRESS || !process.env.EMAIL_PASSWORD) {
  throw new Error("Missing env variables to provide mails");
}

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});
