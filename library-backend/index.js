const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Book = require("./models/Book");
const Author = require("./models/Author");
const { GraphQLError } = require("graphql");

require("dotenv").config();

const MONGODB_URI = process.env.MONGO_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB: ", error.message);
  });

const typeDefs = `
  type Author {
    name: String
    bookCount: Int
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`;

const resolvers = {
  Author: {
    bookCount: async (root) => {
      const author = await Author.findOne({ name: root.name }).populate();
      const bookList = await Book.find({ author: author._id });
      return bookList.length;
    },
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate("author", {
          name: 1,
          born: 1,
          bookCount: 1,
        });
      }

      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author }).populate();
        return Book.find({ author: author._id, genres: args.genre }).populate(
          "author",
          {
            name: 1,
            born: 1,
            bookCount: 1,
          }
        );
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author }).populate();
        return Book.find({ author: author._id }).populate("author", {
          name: 1,
          born: 1,
          bookCount: 1,
        });
      }

      return Book.find({ genres: args.genre }).populate("author", {
        name: 1,
        born: 1,
        bookCount: 1,
      });
    },
    allAuthors: async () => Author.find({}),
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({
        name: args.author,
      }).populate();

      if (!author) {
        const newAuthor = new Author({ name: args.author });
        try {
          author = await newAuthor.save();
        } catch (error) {
          throw new GraphQLError("Could not save author", {
            extensions: {
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const newBook = new Book({ ...args, author: author });
      try {
        const book = newBook.save();
        return book;
      } catch (error) {
        throw new GraphQLError("Could not save book", {
          extensions: {
            invalidArgs: args.title,
            error,
          },
        });
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name }).populate();

      if (author) {
        const newAuthor = { ...author, born: args.setBornTo };
        const update = await Author.findByIdAndUpdate(author._id, newAuthor);
        console.log(update);
        return update;
      }

      return null;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
