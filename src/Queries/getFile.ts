import { gql } from "apollo-server";

export const getFile = gql`
  query GetFile($filename: String!) {
    getFile(filename: $filename) {
      name
      type
    }
  }
`;
