import { User } from "../../entities/User/User";
import { sendMail } from "./sendMail";

// eslint-disable-next-line @typescript-eslint/require-await
export const uploadedMail = async (user: User, file: Express.Multer.File) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  sendMail({
    subject: `Fichier ${file.originalname} uploadé`,
    to: user.email,
    html: `
        <h1>Hello ${user.name} !</h1>
        <h2>Votre fichier "${file.originalname}" a bien été uploadé.</h2>
        
        <p>L'équipe de <a href="https://www.zetransfer.fr">Zetransfer</a></p>
      `,
  });
};
