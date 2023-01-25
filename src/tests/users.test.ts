/* eslint-disable no-console */
import { graphql } from "graphql";
import { buildSchema } from "type-graphql";
import { describe, expect, it } from "vitest";
import { UserResolver } from "../resolvers/Users";

describe("users", () => {
  describe("user signup", () => {
    it("create new user", async () => {
      const schema = await buildSchema({
        resolvers: [UserResolver],
      });

      console.log("create new user");

      const Mutation = `mutation {
        createUser(data: {
            name: "Add",
            email: "test@test.fr",
            password: "123456",
            storage: 5
        }) {
          id
        }
      }`;

      const result = await graphql(schema, Mutation);
      console.log("result", result);
      expect(result.data?.createUser).toBeTruthy();
    });
  });
});
