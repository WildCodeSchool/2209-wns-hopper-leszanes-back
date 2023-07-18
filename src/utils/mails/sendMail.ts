import { transporter } from "./transporter";

export type SendMailParams = {
  subject: string;
  to: string;
  html: string;
};

export const sendMail = ({ subject, to, html }: SendMailParams) => {
  if (!process.env.EMAIL_ADRESS) {
    throw new Error("Missing env variables EMAIL_ADRESS to provide mails");
  }
  transporter.sendMail(
    {
      from: `Zetransfer <${process.env.EMAIL_ADRESS}>`,
      to,
      subject,
      html,
    },
    (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        throw new Error(err.message);
      }
    }
  );
};
