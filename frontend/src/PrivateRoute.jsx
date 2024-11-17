import React, { useContext } from "react";
import { Route, Navigate } from "react-router-dom";
import { AuthContext } from "./Context/MyContext";

const PrivateRoute = ({ children }) => {
  const { isUserLoggedIn } = useContext(AuthContext);

  return (
    <Route
      element={isUserLoggedIn ? children : <Navigate to="/loginUsuario" />}
    />
  );
};

export default PrivateRoute;
