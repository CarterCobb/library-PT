import axios from "axios";
import { ls, api } from "../App";
import { handleError, handleErrorWData } from "./helpers/handle-error";

export default class BookAPI {
  /**
   * Get all the books from the library
   * @param {Function} cb callback function (books, err)
   */
  static async getAllBooks(cb) {
    try {
      const books = await axios.get(`${api}/books`);
      if (books.status === 200) return cb(books.data, null);
      else return cb(null, books.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Get a book by its ISBN number
   * @param {String} isbn
   * @param {Function} cb callback function (book, err)
   */
  static async getBookByISBN(isbn, cb) {
    try {
      const book = await axios.get(`${api}/book/${isbn}`);
      if (book.status === 200) return cb(book.data, null);
      else return cb(null, book.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Create a new book.
   * Librarians only
   * @param {Object} book
   * @param {Function} cb callback function (new_book, err)
   */
  static async createBook(book, cb) {
    try {
      const token = await ls.get("74");
      const created_book = await axios.post(
        `${api}/book`,
        JSON.stringify(book),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (created_book.status === 201) return cb(created_book.data, null);
      else return cb(null, created_book.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Updates a book
   * Librarians only
   * @param {Object} properties *must include book to update ISBN number*
   * @param {Function} cb callback function (updated_book, err)
   */
  static async updateBook(properties, cb) {
    try {
      const token = await ls.get("74");
      const update_book = await axios.patch(
        `${api}/book`,
        JSON.stringify(properties),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (update_book.status === 200) return cb(update_book.data, null);
      else return cb(null, update_book.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Delete a book by its ISBN number
   * Librarians only
   * @param {String} isbn
   * @param {Function} cb callback function (err)
   */
  static async deleteBookByISBN(isbn, cb) {
    try {
      const token = await ls.get("74");
      const del_book = await axios.delete(`${api}/book/${isbn}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (del_book.status === 204) return cb(null);
      else return cb(del_book.data);
    } catch (err) {
      return handleError(err, cb);
    }
  }

  /**
   * Checkout a book by its ISBN number
   * Must be logged in to check out a book
   * @param {String} isbn
   * @param {Function} cb callback function (book, err)
   */
  static async checkoutBookByISBN(isbn, cb) {
    try {
      const token = await ls.get("74");
      const checkout = await axios.post(
        `${api}/checkout/${isbn}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkout.status === 200) return cb(checkout.data, null);
      else return cb(null, checkout.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Return a book by its ISBN number
   * Must be logged in and have the book checked out to return
   * @param {String} isbn
   * @param {Function} cb (book, err)
   */
  static async returnBookByISBN(isbn, cb) {
    try {
      const token = await ls.get("74");
      const checkout = await axios.post(
        `${api}/return/${isbn}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkout.status === 200) return cb(checkout.data, null);
      else return cb(null, checkout.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }
}
