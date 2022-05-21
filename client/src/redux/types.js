/**
 * Set the user
 * @param {Object} user the new user
 */
export const setUser = (user) => ({ type: "SET_USER", payload: user });

/**
 * Logs the user out
 */
export const logout = () => ({ type: "LOGOUT", payload: null });
