import { useState } from "react";
import { ALL_AUTHORS, ADD_BIRTH } from "../queries";
import { useQuery, useMutation } from "@apollo/client";

const Authors = (props) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const result = useQuery(ALL_AUTHORS);
  const [addBirth] = useMutation(ADD_BIRTH);

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (!props.show) {
    return null;
  }

  const authors = result.data.allAuthors;

  const submit = async (event) => {
    event.preventDefault();

    console.log("add birthyear...");
    addBirth({ variables: { name, birth: Number(born) } });

    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set Birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
