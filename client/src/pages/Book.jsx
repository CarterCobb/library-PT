import React, { Component, Fragment } from "react";
import { useParams } from "react-router-dom";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";
import "../styles/book.css";
import { Button, notification } from "antd";

const withParams = (Component) => {
  return (props) => <Component {...props} params={useParams()} />;
};

class Book extends Component {
  constructor(props) {
    super(props);
    this.state = {
      book: null,
      loading: false,
    };
    this.checkout = this.checkout.bind(this);
    this.return = this.return.bind(this);
  }

  componentDidMount() {
    BookAPI.getBookByISBN(this.props.params.isbn, (book, err) => {
      if (err) console.log(err);
      else this.setState({ book });
    });
  }

  checkout() {
    this.setState({ loading: true });
    BookAPI.checkoutBookByISBN(this.state.book.isbn, (book, err) => {
      if (err) notification.error({ message: err.error });
      else {
        notification.success({ message: `Checked out: ${book.title}` });
        this.setState({ book });
      }
      this.setState({ loading: false });
    });
  }

  return() {
    this.setState({ loading: true });
    BookAPI.returnBookByISBN(this.state.book.isbn, (book, err) => {
      if (err) notification.error({ message: err.error });
      else {
        notification.success({ message: `Returned: ${book.title}` });
        this.setState({ book });
      }
      this.setState({ loading: false });
    });
  }

  render() {
    const { book, loading } = this.state;
    const { user } = this.props;
    return (
      <Template>
        {this.state.book === null ? (
          <div>
            <h1>Loading Book...</h1>
          </div>
        ) : (
          <Fragment>
            <h1 className="cc-book-details">Book Details:</h1>
            <div className="cc-book-container">
              <img src={book.image} />
              <div>
                <h1>{book.title}</h1>
                <h3>{book.author}</h3>
                <p>
                  <br />
                  {book.description}
                </p>
                <h3>
                  Copies avaliable:{" "}
                  <span
                    className={
                      book.inventory > 0
                        ? "cc-stock in-stock"
                        : "cc-stock out-stock"
                    }
                  >
                    {book.inventory}
                  </span>
                </h3>
                {book.inventory <= 0 && (
                  <p className="cc-book-err-text">
                    {book.title} is currently unavailable.
                  </p>
                )}
                {!user && (
                  <p className="cc-book-err-text">
                    Login to checkout or return this book.
                  </p>
                )}
                <section className={`cc-checkout-btn-bar ${!user && "login"}`}>
                  <Button
                    onClick={this.checkout}
                    type="primary"
                    loading={loading}
                    disabled={book.inventory <= 0}
                  >
                    Checkout Book
                  </Button>
                  <Button
                    onClick={this.return}
                    className="btn"
                    loading={loading}
                  >
                    Return Book
                  </Button>
                </section>
              </div>
            </div>
          </Fragment>
        )}
      </Template>
    );
  }
}

export default connect(mapStateToProps)(withParams(Book));
