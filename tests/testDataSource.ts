import { DataSource } from "typeorm";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as dotenv from "dotenv";
import { User } from "../src/entities/User/User";
import { File } from "../src/entities/File/File";

dotenv.config();

export const testDataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  synchronize: true,
  entities: [User, File],
  logging: ["query", "error"],
});
