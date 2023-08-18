import { useState, useEffect } from "react";
import { USER, ALL_BOOKS } from "../queries";
import { useQuery, useLazyQuery, useApolloClient } from "@apollo/client";

const Recommendations = (props) => {
  const [books, setBooks] = useState(null);
  const [genre, setGenre] = useState(null);
  const result = useQuery(USER);
  const [userBooks, { data, loading }] = useLazyQuery(ALL_BOOKS);
  const client = useApolloClient();
  const userCache = client.cache.readQuery({ query: USER });

  useEffect(() => {
    if (userCache !== null) {
      userBooks({
        variables: {
          genre:
            userCache.me !== null
              ? userCache.me.favoriteGenre.toLowerCase()
              : null,
        },
      });
      setGenre(
        userCache.me !== null ? userCache.me.favoriteGenre.toLowerCase() : null
      );
      if (data) {
        setBooks(data.allBooks);
      }
    }
  }, [userCache, data]);

  if (result.loading || loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      {!books ? (
        <p>There are no books that matched your favorite genre {genre}</p>
      ) : (
        <div>
          <p>
            Here are the books based on your favorite genre:
            <strong>{genre}</strong>
          </p>
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
        </div>
      )}
    </div>
  );
};

export default Recommendations;
