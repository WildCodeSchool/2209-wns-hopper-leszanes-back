import { DataSource } from "typeorm";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as dotenv from "dotenv";
import { User } from "../entities/User/User";
import { File } from "../entities/File/File";
import { Transfer } from "../entities/Transfer/Transfer";
import { ZeTransferSubscription } from "../entities/ZeTransferSubscription/ZeTransferSubscription";
import { ZeTransferSubscriptionPlan } from "../entities/ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlan";
import { Link } from "../entities/Link/Link";

dotenv.config();

if (
  process.env.DB_PASSWORD === undefined ||
  process.env.DB_NAME === undefined ||
  process.env.DB_USER === undefined
) {
  throw new Error(
    "Please provide a valid database credientials in .env file with : DB_USER, DB_PASSWORD, DB_NAME and DB_HOST"
  );
}

export const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [
    User,
    File,
    Transfer,
    ZeTransferSubscription,
    ZeTransferSubscriptionPlan,
    Link,
  ],
});
