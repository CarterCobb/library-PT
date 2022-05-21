/**
 * Correctly handles any errors that need to have a callback involved
 * @param {Object} err error
 * @param {Function} cb callback function
 */
export const handleError = (err, cb) => {
  if (
    err.response &&
    (err.response.status === 401 || err.response.status === 403)
  )
    window.location.href = "/not-authorized";
  else cb({ error: err.response ? err.response.data.error : err.message });
};

/**
 * Correctly handles any errors that need to have a callback involved
 * @param {Object} err error
 * @param {Function} cb callback function (data, err)
 */
export const handleErrorWData = (err, cb) => {
  if (
    err.response &&
    (err.response.status === 401 || err.response.status === 403)
  )
    window.location.href = "/not-authorized";
  else
    cb(null, { error: err.response ? err.response.data.error : err.message });
};
