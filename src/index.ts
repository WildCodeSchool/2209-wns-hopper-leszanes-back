import "reflect-metadata";
import multer from "multer";
import compression from "compression";
/* eslint-disable no-console */
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import express from "express";
import cors from "cors";
import { dataSource } from "./utils/dataSource";
import { UserResolver } from "./resolvers/Users";
import { FileResolver } from "./resolvers/Files";
import { authChecker } from "./auth";
import { shouldCompress } from "./utils/shouldCompress";

const GRAPHQL_PORT = 5000;
const EXPRESS_PORT = 4000;

export const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, FileResolver],
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

    const renameFile = multer.diskStorage({
      destination(req, file, cb) {
        cb(null, "uploads/");
      },
      filename(req, file, cb) {
        cb(null, `${file.originalname}`);
      },
    });

    const upload = multer({
      limits: {
        fileSize: 100000000,
      },
      storage: renameFile,
      fileFilter(_, file, cb) {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp|mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl|7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd|csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|email|eml|emlx|msg|oft|ost|pst|vcf|3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv|docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg|vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl|dwg|dwt|dxf|gbr|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg)$/
          ) ||
          !file.mimetype.match(
            /^(image\/(jpg|jpeg|png|pdf|zip|rar|gzip|tar|doc|docx|xlsx|csv|txt|ppt|pptx|odt|ods|odp|odg|odf|odb|odc|odm|rtf|xls|xlsm|xlsb|xltx|xltm|xml|bmp|gif|svg|tif|tiff|eps|psd|ai|indd|raw|webp)|audio\/(mp3|wav|wma|aac|ogg|flac|aiff|mid|midi|wpl)|application\/(7z|arj|deb|pkg|rpm|tar.gz|z|zipx|bin|dmg|iso|toast|vcd)|text\/(csv|dat|db|dbf|log|mdb|sav|sql|tar|xml|plain)|message\/(email|eml|emlx|msg|oft|ost|pst|vcf)|video\/(3g2|3gp|avi|flv|h264|m4v|mkv|mov|mp4|mpg|mpeg|rm|swf|vob|wmv)|application\/(docx|docm|dotx|dotm|odt|ott|rtf|tex|txt|wks|wps|wpd|ods|ots|csv|dbf|dif|ods|ots|xlsm|xlsb|xlsx|xltx|xltm|xlsm|xlsb|xlsx|xltx|xltm|pptx|pptm|potx|potm|ppam|ppsx|ppsm|sldx|sldm|thmx|odp|otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg)|model\/(vsd|vdx|vss|vst|vsx|vtx|wmf|emf|max|obj|sldprt|sldasm|slddrw|c4d|f3d|iam|ipt|step|stl)|image\/(dwg|dwt|dxf|gbr|odp| otp|ppt|pps|pot|psd|tif|tiff|bmp|jpg|jpeg|gif|png|ai|drw|dxf|svg|eps|ps|ico|odg|otg|svg))$/
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

    app.post("/files/upload", upload.single("file"), (req, res) => {
      const { file } = req;
      if (!file) {
        return res.json({
          status: "error",
          message: "No file found in the request",
        });
      }

      return res.json({
        status: "success",
        message: "File uploaded successfully",
        data: {
          originalName: file.originalname,
          size: file.size,
          filename: file.filename,
          mime: file.mimetype,
        },
      });
    });

    app.post("/files/download", (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { filename } = req.body;

      if (!filename) {
        return res.json({
          status: "error",
          message: "No filename found in the request",
        });
      }

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const file = `${__dirname}/uploads/${filename}`;

      res.download(file, (err) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (err) {
          return res.json({
            status: "error",
            message: "File not found",
          });
        }

        return res.json({
          status: "success",
          message: "File downloaded successfully",
        });
      });
    });

    app.listen(EXPRESS_PORT, () => {
      console.log(
        `Express application is up and running at http://localhost:${EXPRESS_PORT}`
      );
    });
  })
  .catch((err) => console.error(err));
