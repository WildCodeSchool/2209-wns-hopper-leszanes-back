import { gql } from "apollo-server";

export const signIn = gql`
  mutation signIn($password: String!, $email: String!) {
    signin(password: $password, email: $email)
  }
`;
