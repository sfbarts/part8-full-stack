import { useState } from "react";
import { ALL_AUTHORS, ADD_BIRTH } from "../queries";
import { useQuery, useMutation } from "@apollo/client";
import Select from "react-select";

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
    console.log();
    setName("");
    setBorn("");
  };

  const authorOptions = authors.map((a) => {
    return { value: a.name, label: a.name };
  });

  const selectSytle = {
    control: (provided, state) => ({
      ...provided,
      width: 200,
    }),
    option: (provided, state) => ({
      ...provided,
      width: 200,
    }),
    menu: (provided) => ({
      ...provided,
      width: 200,
    }),
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
          <Select
            options={authorOptions}
            onChange={(selected) => setName(selected.value)}
            styles={selectSytle}
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
