import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: process.env.DB_PASSWORD,
  password: process.env.DB_USER,
  database: process.env.DB_NAME,
  synchronize: true,
  // entities: [],
});
