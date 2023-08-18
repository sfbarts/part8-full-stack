import { useState, useEffect } from "react";
import { NEW_BOOK, ALL_BOOKS, ALL_AUTHORS, USER } from "../queries";
import {
  useMutation,
  useQuery,
  useApolloClient,
  useLazyQuery,
} from "@apollo/client";
import { useNavigate } from "react-router-dom";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const client = useApolloClient();

  const booksResult = useQuery(ALL_BOOKS);
  const authorsResult = useQuery(ALL_AUTHORS);
  const userResult = useQuery(USER);
  const [userBooks] = useLazyQuery(ALL_BOOKS);

  const [newBook] = useMutation(NEW_BOOK);

  const navigate = useNavigate();

  const userCache = client.cache.readQuery({ query: USER });

  useEffect(() => {
    if (userCache !== null) {
      userBooks({
        variables: { genre: userCache.me.favoriteGenre.toLowerCase() },
      });
    }
  }, [userCache]);

  const submit = async (event) => {
    event.preventDefault();
    console.log("add book...");
    newBook({
      variables: { title, author, published: Number(published), genres },
      update: (cache, response) => {
        cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(response.data.addBook),
          };
        });

        cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => {
          return {
            allAuthors: allAuthors.concat(response.data.addBook.author),
          };
        });

        if (userCache) {
          const userGenre = userCache.me.favoriteGenre.toLowerCase();
          cache.updateQuery(
            { query: ALL_BOOKS, variables: { genre: userGenre } },
            ({ allBooks }) => {
              return {
                allBooks: allBooks.concat(response.data.addBook),
              };
            }
          );
        }
      },
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
    navigate("/books");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
