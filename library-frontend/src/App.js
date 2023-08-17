import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useEffect(() => {
    setToken(localStorage.getItem("user-token"));
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <Router>
      <div>
        <div>
          <Link to="/authors">
            <button onClick={() => setPage("authors")}>authors</button>
          </Link>
          <Link to="/books">
            <button onClick={() => setPage("books")}>books</button>
          </Link>
          {token ? (
            [
              <Link key="add_book_page" to="/new-book">
                <button onClick={() => setPage("add")}>add book</button>
              </Link>,
              <Link key="logout_page" to="/authors">
                <button onClick={logout}>logout</button>
              </Link>,
            ]
          ) : (
            <Link to="/login">
              <button onClick={() => setPage("login")}>login</button>
            </Link>
          )}
        </div>

        <Routes>
          <Route
            path="/authors"
            element={<Authors show={page === "authors"} />}
          />
          <Route path="/books" element={<Books show={page === "books"} />} />
          <Route
            path="/new-book"
            element={<NewBook show={page === "add"} setPage={setPage} />}
          />
          <Route
            path="/login"
            element={
              <LoginForm
                show={page === "login"}
                setToken={setToken}
                setPage={setPage}
              />
            }
          />
          <Route
            path="/"
            element={
              <div>
                <h2>Books App - Select An Option Above</h2>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
