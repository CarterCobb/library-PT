import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";

/**
 * Protects librarian pages
 */
const ProtectedRoute = ({ element: Component, user, ...rest }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    var mounted = true;
    if (mounted && user) {
      if (user.role === "LIBRARIAN") setAuthenticated(true);
    } else setAuthenticated(false);
    return () => (mounted = false);
  }, [user]);

  if (authenticated === null)
    return (
      <div>
        <h1>Authenticating ...</h1>
      </div>
    );

  if (authenticated) return <Component {...rest} user={user} />;
  else return <Navigate to="/not-authorized" replace />;
};

export default connect(mapStateToProps)(ProtectedRoute);
