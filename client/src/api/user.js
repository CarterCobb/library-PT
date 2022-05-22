import axios from "axios";
import { ls, api } from "../App";
import { handleError, handleErrorWData } from "./helpers/handle-error";

export default class UserAPI {
  /**
   * Gat all the users from the api
   * Librarians only
   * @param {Function} cb callback function (users, err)
   */
  static async getAllUsers(cb) {
    try {
      const token = await ls.get("74");
      const users = await axios.get(`${api}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (users.status === 200) return cb(users.data, null);
      else return cb(null, users.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Get a user by their UID
   * @param {String} uid
   * @param {Function} cb callback function (user, err)
   */
  static async getUserByUID(uid, cb) {
    try {
      const user = await axios.get(`${api}/user/${uid}`);
      if (user.status === 200) return cb(user, null);
      else return cb(null, user.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Register a new user
   * @param {Object} user
   * @param {Function} cb callback function (user, err)
   */
  static async createUser(user, cb) {
    try {
      const register = await axios.post(`${api}/user`, JSON.stringify(user), {
        headers: { "Content-Type": "application/json" },
      });
      if (register.status === 200) return cb(register, null);
      else return cb(null, register.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Updates a user object.
   * Only updates the requesting user
   * @param {Object} properties
   * @param {Function} cb callback function (user, err)
   */
  static async updateUser(properties, cb) {
    try {
      const token = await ls.get("74");
      const update = await axios.patch(
        `${api}/user`,
        JSON.stringify(properties),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (update.status === 200) return cb(update, null);
      else return cb(null, update.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }

  /**
   * Deletes a user
   * Only deletes the requesting user
   * @param {String} uid
   * @param {Function} cb callback function (err)
   */
  static async deleteUserByUID(uid, cb) {
    try {
      const token = await ls.get("74");
      const del_user = await axios.delete(`${api}/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (del_user.status === 204) return cb(null);
      else return cb(del_user.data);
    } catch (err) {
      return handleError(err, cb);
    }
  }

  /**
   * Login to the library
   * returns user and JWT
   * @param {Object} creds
   * @param {Function} cb callback function ({token: "", user: {...}}, err)
   */
  static async login(creds, cb) {
    try {
      const data = await axios.post(`${api}/login`, JSON.stringify(creds), {
        headers: { "Content-Type": "application/json" },
      });
      if (data.status === 200) return cb(data.data, null);
      else return cb(null, data.data);
    } catch (err) {
      return handleErrorWData(err, cb);
    }
  }
}
