/* eslint-disable no-console */
import "reflect-metadata";
import multer from "multer";
import compression from "compression";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import express from "express";
import cors from "cors";
import { graphql, GraphQLSchema, print } from "graphql";
import { dataSource } from "./utils/dataSource";
import { UserResolver } from "./resolvers/Users";
import { FileResolver } from "./resolvers/Files";
import { authChecker } from "./auth";
import { shouldCompress } from "./utils/shouldCompress";
import { TransferResolver } from "./resolvers/Transfers";
import { ZeTransferSubscriptionsResolver } from "./resolvers/ZeTransferSubscriptions";
import { ZeTransferSubscriptionPlansResolver } from "./resolvers/ZeTransferSubscriptionPlans";
import { getFile } from "./Queries/getFile";
import { sendMail } from "./utils/mails/sendMail";
import { getToken } from "./utils/getToken";
import { verifyMailToken } from "./utils/mails/verifyMailToken";

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
        fileSize: 100000000,
      },
      // storage: renameFile,
      fileFilter(_, file, cb) {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp|mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl|7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd|csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|email|eml|emlx|msg|oft|ost|pst|vcf|3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv|docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg|vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl|dwg|dwt|dxf|gbr|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg)$/
          ) ||
          !file.mimetype.match(
            /^(image\/(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp)|audio\/(mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl)|application\/(7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd)|text\/(csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|plain)|message\/(email|eml|emlx|msg|oft|ost|pst|vcf)|video\/(3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv)|application\/(pdf|docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg)|model\/(vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl)|image\/(dwg|dwt|dxf|gbr|odp| otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg))$/
          )
        ) {
          return cb(
            new Error(
              `Please a correct file type ${file.originalname} or ${file.mimetype} does not match the allowed file types`
            )
          );
        }
        cb(null, true);
        return null;
      },
    });

    app.post("/files/upload", upload.array("files"), (req, res) => {
      const filesUpload = req.files;
      const storageRemaning = 100000000000000000000;
      let totalSize = 0;

      if (filesUpload === undefined) {
        return res.json({
          status: "error",
          message: "No file found in the request",
        });
      }

      if (!Array.isArray(filesUpload)) {
        return res.json({
          status: "error",
          message: "Une erreur est survenue",
        });
      }

      for (const file of filesUpload) {
        totalSize += file.size;
        if (totalSize > storageRemaning) {
          return res.json({
            status: "error",
            message: "Vous n'avez pas assez d'espace de stockage",
          });
        }
      }
      return res.json({
        filesUpload,
      });
    });
    // @ts-expect-error shit lib
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, @typescript-eslint/no-var-requires, vars-on-top, no-var, @typescript-eslint/no-unused-vars
    var zip = require("express-zip");

    app.get("/files/download", (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { filesData } = req.query as {
        filesData:
          | { fileName: string; name: string }
          | { fileName: string; name: string }[];
      };

      if (Array.isArray(filesData)) {
        const files = filesData.map((file) => {
          return { path: `uploads/${String(file.fileName)}`, name: file.name };
        });
        // @ts-expect-error shit lib
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return res.zip(files);
      }

      return res.download(
        `uploads/${String(filesData.fileName)}`,
        new Date().getTime().toString(),
        (err) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!err) {
            return;
          }
          // eslint-disable-next-line consistent-return
          return res.json({
            status: "error",
            message: "File not found",
          });
        }
      );
    });

    // Télécharger un fichier via lien

    // eslint-disable-next-line consistent-return
    app.get("/:filename", (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { filename } = req.params;

      if (!filename) {
        return res.json({
          status: "error",
          message: "No filename found in the request",
        });
      }

      if (filename === "favicon.ico") return res.status(204).end();

      const file = `uploads/${filename}`;
      const setFileData = async () => {
        const fileData = (await graphql({
          schema,
          source: print(getFile),
          variableValues: {
            filename,
          },
        })) as {
          data: { getFile: File };
          errors?: [{ message: string }];
        };
        const fileType = fileData.data.getFile.type.split("/");
        const fileName = `${fileData.data.getFile.name}.${fileType[1]}`;
        return res.download(file, fileName, (err) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!err) {
            return null;
          }
          // eslint-disable-next-line consistent-return
          return res.json({
            status: "error",
            message: "File not found",
          });
        });
      };
      setFileData().catch((error) => {
        console.error(error);
        return res.json({
          status: "error",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: error.message,
        });
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
