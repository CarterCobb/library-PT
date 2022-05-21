import React, { Component } from "react";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";

class HomePage extends Component {
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
      <Template user={this.props.user}>
        <div>
          <h1>Home Page</h1>
          <h3>Books:</h3>
          <pre>{JSON.stringify(this.state.books, null, 2)}</pre>
        </div>
      </Template>
    );
  }
}

export default connect(mapStateToProps)(HomePage);
