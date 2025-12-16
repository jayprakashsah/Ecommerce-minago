import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, roleRequired }) {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const role = sessionStorage.getItem("role");

  // 1. Not logged in? Go to Login.
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged in, but wrong role? (e.g., User trying to access Admin)
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // 3. All good? Show the page.
  return children;
}

export default ProtectedRoute;