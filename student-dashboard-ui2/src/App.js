import React, { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./App.css";

// A simple component to protect routes that require authentication.
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page.
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // This state helps re-render the app upon login/logout to redirect correctly.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const login = useCallback(() => setIsAuthenticated(true), []);
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard logout={logout} />
            </ProtectedRoute>
          }
        />
        {/* Redirect any other path to the correct starting page */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
