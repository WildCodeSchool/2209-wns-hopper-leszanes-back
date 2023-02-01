/* eslint-disable @typescript-eslint/no-floating-promises */
import { User } from "../../entities/User/User";
import { sendMail } from "./sendMail";

export const sharedFilesMail = (
  user: User,
  file: Express.Multer.File,
  sharedWith: User
) => {
  sendMail({
    subject: `Fichier ${file.originalname} partagé`,
    to: user.email,
    html: `
        <h1>Hello ${user.name} !</h1>
        <h2>Votre fichier "${file.originalname}" a bien été partagé avec ${sharedWith.name}.</h2>
        
        <p>L'équipe de <a href="https://www.zetransfer.fr">Zetransfer</a></p>
      `,
  });
  sendMail({
    subject: `Fichier ${file.originalname} partagé`,
    to: sharedWith.email,
    html: `
        <h1>Hello ${sharedWith.name} !</h1>
        <h2>Vous avez reçu un fichier "${file.originalname}" de la part de ${user.name}.</h2>
        
        <p>L'équipe de <a href="https://www.zetransfer.fr">Zetransfer</a></p>
      `,
  });
};
