import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import { setUser, logout } from "../redux/types";
import UserAPI from "../api/user";
import { ls } from "../App";

const withNavigate = (Component) => {
  return (props) => <Component {...props} navigate={useNavigate()} />;
};

class Template extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login() {
    const creds = {
      username: "ccobb",
      password: "12345",
    };
    UserAPI.login(creds, ({ token, user }, err) => {
      if (err) console.log(err);
      else {
        ls.set("74", token);
        this.props.dispatch(setUser(user));
      }
    });
  }

  logout() {
    this.props.dispatch(logout());
  }

  render() {
    const { navigate, user, children } = this.props;
    return (
      <div>
        <h1>Libary Management</h1>
        {window.location.pathname !== "/" && (
          <button onClick={() => navigate("/")}>Home</button>
        )}
        {user ? (
          <button onClick={this.logout}>Logout</button>
        ) : (
          <button onClick={this.login}>Login</button>
        )}
        {user &&
          user.role === "LIBRARIAN" &&
          window.location.pathname !== "/book-management" && (
            <button onClick={() => navigate("/book-management")}>
              Book Management
            </button>
          )}
        {children}
        <h1>Footer</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withNavigate(Template));
