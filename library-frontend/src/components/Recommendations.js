import { useState, useEffect } from "react";
import { USER, ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";

const Recommendations = (props) => {
  const [genre, setGenre] = useState(null);
  const result = useQuery(USER);

  useEffect(() => {
    if (result.data) {
      setGenre(result.data.me.favoriteGenre.toLowerCase());
    }
  }, [genre, result.data]);

  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
    skip: !genre,
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  let books = [];

  if (booksResult.data && booksResult.data.allBooks) {
    books = booksResult.data.allBooks;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      {!books.length ? (
        <p>There are no books that matched your favorite genre {genre}</p>
      ) : (
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
      )}
    </div>
  );
};

export default Recommendations;
