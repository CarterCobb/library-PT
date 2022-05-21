import React, { Component } from "react";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";

class BookManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
    };
  }

  componentDidMount() {
    BookAPI.getAllBooks((books, err) => {
      if (err) console.log(err);
      else this.setState({ books });
    });
  }

  render() {
    return (
      <Template>
        <div>
          <h1>Book Management</h1>
          <button onClick={() => (window.location.href = "/")}>Home</button>
          <h3>Books:</h3>
          <pre>{JSON.stringify(this.state.books, null, 2)}</pre>
          <h3>Logged in user:</h3>
          <pre>{JSON.stringify(this.props.user, null, 2)}</pre>
        </div>
      </Template>
    );
  }
}

export default connect(mapStateToProps)(BookManagement);
