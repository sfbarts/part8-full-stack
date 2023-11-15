const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const Book = require("../models/Book");
const Author = require("../models/Author");
const User = require("../models/User");

const pubsub = new PubSub();

const resolvers = {
  Author: {
    bookCount: (root) => {
      return root.books.length;
    },
  },
  Query: {
    me: (root, args, { currentUser }) => {
      if (!currentUser) {
        return null;
      }
      return currentUser;
    },
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate("author", {
          name: 1,
          born: 1,
          books: 1,
        });
      }

      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author }).populate();
        return Book.find({ author: author._id, genres: args.genre }).populate(
          "author",
          {
            name: 1,
            born: 1,
            books: 1,
          }
        );
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author }).populate();
        return Book.find({ author: author._id }).populate("author", {
          name: 1,
          born: 1,
          books: 1,
        });
      }

      if (args.genre) {
        const genre = await Book.find({ genres: args.genre }).populate(
          "author",
          {
            name: 1,
            born: 1,
            books: 1,
          }
        );
        console.log(genre);
        return genre;
      }
    },
    allAuthors: async (root, args) => {
      return Author.find({});
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      let author = await Author.findOne({
        name: args.author,
      }).populate();

      if (!currentUser) {
        throw new GraphQLError("Wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

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
        const book = await newBook.save();
        pubsub.publish("BOOK_ADDED", { bookAdded: book });
        const authorBooks = { books: author.books.concat(book) };
        const updateAuthor = await Author.findByIdAndUpdate(
          author._id,
          authorBooks,
          {
            new: true,
          }
        );
        return book;
      } catch (error) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            invalidArgs: args.title,
            error,
          },
        });
      }
    },

    editAuthor: async (root, args, { currentUser }) => {
      const author = await Author.findOne({ name: args.name }).populate();

      if (!currentUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      if (author) {
        const newBirth = { born: args.setBornTo };
        const update = await Author.findByIdAndUpdate(author._id, newBirth, {
          new: true,
        });
        return update;
      }

      return null;
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });
      try {
        return user.save();
      } catch (error) {
        throw new GraphQLError("Could not create user", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("Wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
