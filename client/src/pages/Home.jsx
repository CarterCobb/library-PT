import React, { Component } from "react";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import { setUser, logout } from "../redux/types";
import UserAPI from "../api/user";
import { ls } from "../App";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    BookAPI.getAllBooks((books, err) => {
      if (err) console.log(err);
      else this.setState({ books });
    });
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
    return (
      <div>
        <h1>Home Page</h1>
        <button onClick={this.login}>Login</button>
        <button onClick={this.logout}>Logout</button>
        <button onClick={() => (window.location.href = "/book-management")}>
          Manage Books
        </button>
        <h3>Books:</h3>
        <pre>{JSON.stringify(this.state.books, null, 2)}</pre>
        <h3>Logged in user:</h3>
        <pre>{JSON.stringify(this.props.user, null, 2)}</pre>
      </div>
    );
  }
}

export default connect(mapStateToProps)(HomePage);
