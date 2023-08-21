import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useApolloClient, useSubscription } from "@apollo/client";
import { BOOK_ADDED } from "./queries";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data.bookAdded;
      console.log(book);
      window.alert(`The book ${book.title} has been added!`);
    },
  });

  useEffect(() => {
    setToken(localStorage.getItem("user-token"));
  }, []);

  const logout = () => {
    setToken(null);
    client.clearStore();
    localStorage.clear();
  };

  return (
    <Router>
      <div>
        <div>
          <Link to="/authors">
            <button>authors</button>
          </Link>
          <Link to="/books">
            <button>books</button>
          </Link>
          {token ? (
            [
              <Link key="add_book_page" to="/new-book">
                <button>add book</button>
              </Link>,
              <Link key="recommendations_page" to="/recommendations">
                <button>recommendations</button>
              </Link>,
              <Link key="logout_page" to="/">
                <button onClick={logout}>logout</button>
              </Link>,
            ]
          ) : (
            <Link to="/login">
              <button>login</button>
            </Link>
          )}
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>Books App - Select An Option Above</h2>
              </div>
            }
          />
          <Route path="/authors" element={<Authors />} />
          <Route path="/books" element={<Books />} />
          <Route path="/new-book" element={<NewBook />} />
          <Route
            path="/recommendations"
            element={<Recommendations token={token} />}
          />
          <Route path="/login" element={<LoginForm setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
