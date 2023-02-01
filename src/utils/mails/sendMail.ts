import { transporter } from "./transporter";

export type SendMailParams = {
  subject: string;
  to: string;
  html: string;
};

export const sendMail = async ({ subject, to, html }: SendMailParams) => {
  if (!process.env.EMAIL_ADRESS) {
    throw new Error("Missing env variables EMAIL_ADRESS to provide mails");
  }
  try {
    await transporter.sendMail({
      from: `Zetransfer <${process.env.EMAIL_ADRESS}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error while sending mail: ", error);
  }
};
