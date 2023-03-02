import { gql } from "apollo-server";

export const signIn = gql`
  mutation signIn($password: String!, $email: String!) {
    signIn(password: $password, email: $email) {
      user {
        email
        name
      }
      token
    }
  }
`;
