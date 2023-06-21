import "reflect-metadata";
import multer from "multer";
import compression from "compression";
// import JSZip from "jszip";
/* eslint-disable no-console */
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
    app.options("*", cors()); // include before other routes

    // const renameFile = multer.diskStorage({
    //   destination(req, file, cb) {
    //     cb(null, "uploads/");
    //   },
    //   // filename(req, file, cb) {
    //   //   cb(null, `${file.originalname}`);
    //   // },
    // });

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
        // MakeZip(file);
      }
      return res.json({
        // Quand les zips seront gérés, modifier les filesUpload[0] par le zip généré
        filesUpload,
      });
    });

    // eslint-disable-next-line consistent-return
    // app.post("/files/download", (req, res) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   const { filename } = req.body;

    //   if (!filename) {
    //   // Pour upload un seul fichier
    //   if (filesUpload.length === 1) {
    //     upload.single("files");

    //     return res.json({
    //       status: "Success",
    //       message: "Une seul fichier à été uplaod",
    //       data: {
    //         nombre: filesUpload.length,
    //         Nom: filesUpload[0].originalname,
    //       },
    //     });
    //   }

    //   // upload plusieurs fichiers
    //   if (filesUpload.length > 1) {
    //     for (const file of filesUpload) {
    //       totalSize += file.size;
    //       filesInfo.push(file.filename);
    //       filesInfo.push(file.originalname.split("."));

    //       if (totalSize > storageRemaning) {
    //         return res.json({
    //           status: "error",
    //           message: "You don't have enough storage space",
    //         });
    //       }
    //     }
    //     upload.array("files");
    //     return res.json({
    //       status: "Success",
    //       message: "Les fichiers ont été upload",
    //       data: {
    //         nombre: filesUpload.length,
    //         Nom: filesInfo,
    //       },
    //     });
    //   }
    // });

    // Télécharger un fichier via lien

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
        console.log(fileName);
        return res.download(file, fileName, (err) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!err) {
            return;
          }
          // eslint-disable-next-line consistent-return
          return res.json({
            status: "error",
            message: "File not found",
          });
        });
      };
      setFileData().catch((error) => {
        console.log(error);
      });
    });

    app.listen(EXPRESS_PORT, () => {
      console.log(
        `Express application is up and running at http://localhost:${EXPRESS_PORT}`
      );
    });
  })
  .catch((err) => console.error(err));
