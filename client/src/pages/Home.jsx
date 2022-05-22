import React, { Component } from "react";
import BookAPI from "../api/book";
import { connect } from "react-redux";
import { mapStateToProps } from "../redux/reducer";
import Template from "../components/Template";
import "../styles/home.css";
import BookGrid from "../components/BookGrid";
import { notification } from "antd";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      books: [],
      search: "",
      searchBooks: [],
    };
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    BookAPI.getAllBooks((books, err) => {
      if (err) notification.error({ message: err.error });
      else this.setState({ books });
    });
  }

  search(search) {
    console.log("searched", search);
    this.setState({
      search,
      searchBooks: this.state.books.filter((book) =>
        JSON.stringify(book).toLowerCase().includes(search.toLowerCase())
      ),
    });
  }

  render() {
    const { books, search, searchBooks } = this.state;
    return (
      <Template user={this.props.user} onSearch={this.search}>
        <div>
          <section className="cc-section cc-home-video-wrapper">
            <video playsInline autoPlay muted loop id="cc-home-video">
              <source src="https://adderu.s3.us-west-1.amazonaws.com/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="cc-video-header">
              <h1 id="cc-header-text">Fancy Place Library</h1>
              <p id="cc-header-sub-text">
                Explore endless adventures through books!
              </p>
            </div>
            <div className="cc-header-skewed-right" />
            <div className="cc-header-skewed-left" />
          </section>
          <h1 className="cc-books-header">Our Books:</h1>
          <BookGrid books={search !== "" ? searchBooks : books} />
        </div>
      </Template>
    );
  }
}

export default connect(mapStateToProps)(HomePage);
