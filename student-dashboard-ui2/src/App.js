import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [page, setPage] = useState(localStorage.getItem("token") ? "dashboard" : "login");

  if (page === "login")
    return (
      <Login
        login={() => setPage("dashboard")}
        goToRegister={() => setPage("register")}
      />
    );

  if (page === "register")
    return (
      <Register goToLogin={() => setPage("login")} />
    );

  return <Dashboard logout={() => setPage("login")} />;
}

export default App;
