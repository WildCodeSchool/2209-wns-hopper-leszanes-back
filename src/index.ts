/* eslint-disable no-console */
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { dataSource } from "./utils/dataSource";
import { UserResolver } from "./resolvers/Users";

const PORT = 5000;

console.log("DB_PASSWORD", process.env.DB_PASSWORD);
console.log("DB_NAME", process.env.DB_NAME);
console.log("DB_USER", process.env.DB_USER);

export const bootstrap = async (): Promise<void> => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const server = new ApolloServer({
    schema,
    cors: true,
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);

  try {
    await dataSource.initialize();
    console.log("Connected !");
  } catch (err) {
    console.log("Connection failed");
    console.log(err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
