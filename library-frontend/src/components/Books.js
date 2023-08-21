import { useState, useEffect } from "react";
import { ALL_BOOKS, BOOK_ADDED } from "../queries";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (books) => {
    let seen = new Set();

    return books.filter((b) => {
      let title = b.title;
      return seen.has(title) ? false : seen.add(title);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    };
  });
};

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [genre, setGenre] = useState(null);
  const [books, setBooks] = useState([]);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data.bookAdded;
      updateCache(client.cache, { query: ALL_BOOKS }, book);
      // client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
      //   return {
      //     allBooks: allBooks.concat(book),
      //   };
      // });
    },
  });

  useEffect(() => {
    if (result.data && result.data.allBooks) {
      if (genre) {
        const filteredBooks = result.data.allBooks.filter((b) =>
          b.genres.includes(genre)
        );
        setBooks(filteredBooks);
      } else {
        setBooks(result.data.allBooks);
      }
    }
  }, [genre, result.data]);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const genres = Array.from(
    new Set(result.data.allBooks.flatMap((b) => b.genres))
  );

  return (
    <div>
      <h2>books</h2>
      {genre ? (
        <p>
          Books filtered by <strong>{genre}</strong>
        </p>
      ) : (
        <p>No filter applied</p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((g) => (
        <button key={g} onClick={() => setGenre(g)}>
          {g}
        </button>
      ))}
      <button onClick={() => setGenre(null)}>clear</button>
    </div>
  );
};

export default Books;
