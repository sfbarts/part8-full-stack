import { useEffect, useState } from "react";
import { LOGIN } from "../queries";
import { useMutation, useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ setToken }) => {
  const [login, result] = useMutation(LOGIN);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const client = useApolloClient();
  console.log(client.cache.extract());
  const navigate = useNavigate();

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("user-token", token);
      navigate("/authors");
    }
  }, [result.data]); // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault();
    login({ variables: { username, password } });
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{" "}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default LoginForm;
