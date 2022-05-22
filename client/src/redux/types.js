/**
 * Set the user
 * @param {Object} user the new user
 */
export const setUser = (user) => ({ type: "SET_USER", payload: user });

/**
 * Logs the user out
 * @param {Boolean} redirect home
 */
export const logout = (redirect = false) => ({ type: "LOGOUT", payload: redirect });
