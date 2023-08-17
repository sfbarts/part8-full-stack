import { useState, useEffect } from "react";
import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [genre, setGenre] = useState(null);
  const [books, setBooks] = useState([]);
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
