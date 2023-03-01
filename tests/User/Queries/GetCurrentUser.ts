import { gql } from "apollo-server";

export const getCurrentUser = gql`
  query GetCurrentUser {
    getCurrentUser {
      email
      id
      name
    }
  }
`;
