/* eslint-disable no-console */
import { ApolloServer } from "apollo-server";
import compression from "compression";
import cors from "cors";
import express from "express";
import { GraphQLSchema } from "graphql";
import multer from "multer";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import { FileResolver } from "./resolvers/Files";
import { TransferResolver } from "./resolvers/Transfers";
import { UserResolver } from "./resolvers/Users";
import { ZeTransferSubscriptionPlansResolver } from "./resolvers/ZeTransferSubscriptionPlans";
import { ZeTransferSubscriptionsResolver } from "./resolvers/ZeTransferSubscriptions";
import { dataSource } from "./utils/dataSource";
import { getToken } from "./utils/getToken";
import { sendMail } from "./utils/mails/sendMail";
import { verifyMailToken } from "./utils/mails/verifyMailToken";

import { hashFile } from "./utils/signatures/hashFile";
import { verifyHash } from "./utils/signatures/verifyHash";

import { shouldCompress } from "./utils/shouldCompress";


const GRAPHQL_PORT = 5000;
const EXPRESS_PORT = 4000;
let schema: GraphQLSchema;

export const bootstrap = async () => {
  schema = await buildSchema({
    resolvers: [
      UserResolver,
      FileResolver,
      TransferResolver,
      ZeTransferSubscriptionsResolver,
      ZeTransferSubscriptionPlansResolver,
    ],
    authChecker,
  });

  const server = new ApolloServer({
    schema,
    cors: true,
    context: ({ req }) => {
      const authHeader = req.headers.authorization;
      if (
        authHeader &&
        process.env.JWT_SECRET &&
        authHeader.startsWith("Bearer ")
      ) {
        const token = authHeader.split(" ")[1];
        return { token };
      }
      return {
        token: null,
      };
    },
  });

  // Start the server
  const { url } = await server.listen(GRAPHQL_PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);

  try {
    await dataSource.initialize();
    console.log("Connected !");
  } catch (err) {
    console.log("Connection failed");
    console.error(err);
  }
};

bootstrap()
  .then(() => {
    const app = express();

    app.use(compression({ filter: shouldCompress }));
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.options(
      [
        "http//locahost:5173",
        "http//locahost:4173",
        "https://staging.hopper1.wns.wilders.dev",
        "https://hopper1.wns.wilders.dev",
      ],
      cors()
    );

    const upload = multer({
      dest: "uploads/",
      limits: {
        fileSize: 100_000_000_000,
      },
      // storage: renameFile,
      fileFilter(_, file, cb) {
        // if (
        //   !file.originalname.match(
        //     /\.(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp|mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl|7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd|csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|email|eml|emlx|msg|oft|ost|pst|vcf|3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv|docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|eps|ps|ico|odg|otg|vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl|dwg|dwt|dxf|gbr|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|eps|ps|ico|odg|otg|pub)$/
        //   ) ||
        //   !file.mimetype.match(
        //     /^(image\/(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp|svg+xml)|audio\/(mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl)|application\/(7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd)|text\/(csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|plain)|message\/(email|eml|emlx|msg|oft|ost|pst|vcf)|video\/(3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv)|application\/(pdf|docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg|vnd.openxmlformats-officedocument.presentationml.presentation|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-publisher)|model\/(vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl)|xml)$/
        //   )
        // ) {
        //   return cb(
        //     new Error(
        //       `Please provide correct file type : ${file.originalname} or ${file.mimetype} does not match the allowed file types`
        //     )
        //   );
        // }
        cb(null, true);
        return null;
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.post("/files/upload", upload.array("files"), async (req, res) => {
      const filesUpload = req.files;
      const storageRemaning = 100000000000000000000;
      let totalSize = 0;

      if (filesUpload === undefined) {
        return res.status(500).json({
          status: "error",
          message: "No file found in the request",
        });
      }

      if (!Array.isArray(filesUpload)) {
        return res.status(500).json({
          status: "error",
          message: "Une erreur est survenue",
        });
      }

      for (const file of filesUpload) {
        totalSize += file.size;
        if (totalSize > storageRemaning) {
          return res.status(500).json({
            status: "error",
            message: "Vous n'avez pas assez d'espace de stockage",
          });
        }
      }
      const filesWithHash = filesUpload.map((file) => {
        return { ...file, signature: "" };
      });

      for (const file of filesWithHash) {
        // eslint-disable-next-line
        file.signature = await hashFile(file.path);
      }
      return res.json({
        filesWithHash,
      });
    });
    // @ts-expect-error shit lib
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, @typescript-eslint/no-var-requires, vars-on-top, no-var, @typescript-eslint/no-unused-vars, import/no-extraneous-dependencies
    var zip = require("express-zip");

    // eslint-disable-next-line consistent-return, @typescript-eslint/no-misused-promises
    app.get("/files/download", async (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { filesData } = req.query as {
        filesData:
          | { fileName: string; name: string; signature: string }
          | { fileName: string; name: string; signature: string }[];
      };
      if (Array.isArray(filesData)) {
        // eslint-disable-next-line array-callback-return
        const files: { path: string; name: string; signature: string }[] = [];
        for (const file of filesData) {
          console.log({ ...filesData });
          // eslint-disable-next-line no-await-in-loop
          const isOriginalHash = await verifyHash(
            `uploads/${String(file.fileName)}`,
            file.signature
          );
          if (isOriginalHash) {
            files.push({
              path: `uploads/${String(file.fileName)}`,
              name: file.name,
              signature: file.signature,
            });
            console.log(files);
          }
        }
        console.log(files);
        // @ts-expect-error shit lib
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return res.zip(files);
      }
      verifyHash(`uploads/${String(filesData.fileName)}`, filesData.signature)
        .then((isOriginalHash) => {
          if (isOriginalHash) {
            return res.download(
              `uploads/${String(filesData.fileName)}`,
              new Date().getTime().toString()
            );
          }
          return res.status(500).json({
            status: "error",
            message: "File signature does not correpond",
          });
        })
        .catch((err) => {
          return res.status(500).json({
            status: "error",
            message: "File signature is not the same",
            cause: JSON.stringify(err),
          });
        });
    });

    app.post("/mails/invite", (req, res) => {
      const { userId, email, invitedBy } = req.body as {
        userId: number;
        email: string;
        invitedBy: string;
      };

      if (!email || !invitedBy || !userId) {
        return res.json({
          status: "error",
          message: "No email, userId, invitedBy or token found in the request",
        });
      }

      const token = getToken(undefined, {
        id: userId,
        invitedBy: invitedBy.toLowerCase(),
      });

      if (!token) {
        return res.json({
          status: "error",
          message: "No token found",
        });
      }

      // eslint-disable-next-line no-void
      sendMail({
        subject: "Invitation à rejoindre Zetransfer",
        to: email,
        html: `<p>Vous avez été invité(e) à rejoindre Zetransfer, cliquez sur le lien suivant pour <a href="http://localhost:5173/register?email=${email.toLowerCase()}&token=${token}">vous inscrire</a>.</p>`,
      });

      return res.json({
        status: "success",
        message: "Invation email sent",
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.post("/mails/new-contact", async (req, res) => {
      const { email, token } = req.body as {
        email: string;
        token: string;
      };

      if (!email || !token) {
        return res.json({
          status: "error",
          message: "No email or token found in the request",
        });
      }

      const invitedBy = await verifyMailToken(token);

      if (!invitedBy) {
        return res.json({
          status: "error",
          message: "No user found from the token",
        });
      }

      // eslint-disable-next-line no-void
      sendMail({
        subject: "🎉 Nouveau contact sur Zetransfer 🎉",
        to: invitedBy.email,
        html: `<p>L'utilisateur ${email.toLowerCase()} vous a ajouté à ses contacts sur Zetransfer, vous pouvez dès à présent lui envoyer des fichiers !</p>`,
      });

      // invalidate token

      return res.json({
        status: "success",
        message: "New contact email sent",
      });
    });

    app.post("/mails/new-account", (req, res) => {
      const { email } = req.body as {
        email: string;
      };

      if (!email) {
        return res.json({
          status: "error",
          message: "No email found in the request",
        });
      }

      // eslint-disable-next-line no-void
      sendMail({
        subject: "🎉 Bienvenue sur Zetransfer !",
        to: email,
        html: `<h1>Hey, bienvenue sur Zetransfer !</h1>
        <p>Vous êtes près pour l'aventure ?</p>
        <p>Vous pouvez dès à présent envoyer des fichiers à vos contacts !</p><br>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse suivante : <a href="mailto:zetransfer.contact@gmail.com">zetransfer.contact@gmail.com</a></p>
        <p>À bientôt !</p>
        <p>L'équipe Zetransfer</p>`,
      });

      return res.json({
        status: "success",
        message: "New account email sent",
      });
    });

    app.listen(EXPRESS_PORT, () => {
      console.log(
        `Express application is up and running at http://localhost:${EXPRESS_PORT}`
      );
    });
  })
  .catch((err) => console.error(err));
