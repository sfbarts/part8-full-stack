import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      born
      id
    }
  }
`;

export const ALL_BOOKS = gql`
  query ($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      title
      published
      author {
        name
        born
        bookCount
      }
      genres
      id
    }
  }
`;

export const USER = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`;

export const NEW_BOOK = gql`
  mutation newBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
        born
      }
      id
    }
  }
`;

export const ADD_BIRTH = gql`
  mutation addBirth($name: String!, $birth: Int!) {
    editAuthor(name: $name, setBornTo: $birth) {
      name
      bookCount
      born
      id
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
