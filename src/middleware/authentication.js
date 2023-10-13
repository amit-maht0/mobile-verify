const { verifyToken } = require("../services/auth");

/**
 * Checking if token is present in cookie or not
 * @param {*} cookieName
 * @returns
 */

const checkForAuthenticationCookie = (cookieName) => {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = verifyToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {}

    return next();
  };
};

module.exports = checkForAuthenticationCookie;
