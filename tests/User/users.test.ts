import { beforeAll, describe, expect, it } from "@jest/globals";
import { graphql, GraphQLSchema, print } from "graphql";
import { buildSchema } from "type-graphql";
import { UserWithTokenResponse } from "../../src/entities/User/UserWithTokenResponse";
import { dataSource } from "../../src/utils/dataSource";
import { UserResolver } from "../../src/resolvers/Users";
import { signIn } from "./Queries/SignIn";
import { createUser } from "./Queries/CreateUser";
import { getCurrentUser } from "./Queries/GetCurrentUser";
import { authChecker } from "../../src/auth";
import { User } from "../../src/entities/User/User";

let schema: GraphQLSchema;

beforeAll(async () => {
  await dataSource.initialize();
  try {
    const entities = dataSource.entityMetadatas;
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(", ");
    await dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
  } catch (error) {
    throw new Error(`ERROR: Cleaning test database: ${JSON.stringify(error)}`);
  }

  // compute GraphQL schema
  schema = await buildSchema({
    resolvers: [UserResolver],
    authChecker,
  });
});

describe("users", () => {
  describe("user signup", () => {
    it("creates a new user", async () => {
      const result = (await graphql({
        schema,
        source: print(createUser),
        variableValues: {
          data: {
            email: "toto@test.com",
            password: "My@Password123",
          },
        },
      })) as {
        data: { createUser: UserWithTokenResponse };
        errors?: [{ message: string }];
      };

      expect(result.data).toBeTruthy();
      expect(result.data.createUser).toBeTruthy();
      expect(result.data.createUser.user).toBeTruthy();
      expect(result.data.createUser.token).toBeTruthy();
      expect(result.data.createUser.user.name).toBe("toto");
      expect(result.data.createUser.user.email).toBe("toto@test.com");
    });
    it("creates user in db", async () => {
      const user = await dataSource
        .getRepository(User)
        .findOneBy({ email: "toto@test.com" });
      expect(user?.password !== "My@Password123").toBe(true);
      expect(user).toBeDefined();
    });
    it("cannot create 2 users with the same email", async () => {
      const result = await graphql({
        schema,
        source: print(createUser),
        variableValues: {
          data: {
            name: "toto",
            email: "toto@test.com",
            password: "My@Password123",
          },
        },
      });

      expect(result.data?.createUser).toBeFalsy();
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("user signIn", () => {
    let userToken: string;
    it("returns a token on a valid mutation", async () => {
      const result = (await graphql({
        schema,
        source: print(signIn),
        variableValues: {
          email: "toto@test.com",
          password: "My@Password123",
        },
      })) as {
        data: { signIn: UserWithTokenResponse };
        errors?: [{ message: string }];
      };

      expect(result.data).toBeTruthy();
      expect(result.data.signIn).toBeTruthy();
      expect(result.data.signIn.user).toBeTruthy();
      expect(result.data.signIn.user.email).toBe("toto@test.com");
      expect(typeof result.data.signIn.token).toBeTruthy();
      expect(typeof result.data.signIn.token).toBe("string");
      userToken = result.data.signIn.token;
    });

    it("returns current logged user", async () => {
      const result = (await graphql({
        schema,
        source: print(getCurrentUser),
        contextValue: {
          token: userToken,
        },
      })) as {
        data: { getCurrentUser: User };
        errors?: [{ message: string }];
      };

      expect(result.data).toBeTruthy();
      expect(result.data.getCurrentUser).toBeTruthy();
      expect(result.data.getCurrentUser.email).toBe("toto@test.com");
    });
  });
});
