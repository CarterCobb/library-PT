import React, { Component } from "react";
import { useParams } from "react-router-dom";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";

const withParams = (Component) => {
  return (props) => <Component {...props} params={useParams()} />;
};

class Book extends Component {
  constructor(props) {
    super(props);
    this.state = {
      book: null,
    };
  }

  componentDidMount() {
    BookAPI.getBookByISBN(this.props.params.isbn, (book, err) => {
      if (err) console.log(err);
      else this.setState({ book });
    });
  }

  render() {
    return (
      <Template>
        {this.state.book === null ? (
          <div>
            <h1>Loading Book...</h1>
          </div>
        ) : (
          <div>
            <h1>Book: {this.state.book.title}</h1>
            <pre>{JSON.stringify(this.state.book, null, 2)}</pre>
          </div>
        )}
      </Template>
    );
  }
}

export default connect(mapStateToProps)(withParams(Book));
