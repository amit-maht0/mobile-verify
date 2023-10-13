const JWT = require("jsonwebtoken");

/**
 * get token from checkForAuthenticationCookie function
 * @param {*} token
 * @returns
 */
function verifyToken(token) {
  const payload = JWT.verify(token, process.env.JWT_SECRET);
  if (!payload) {
    return false;
  }

  return payload;
}

/**
 * Generating JWT token for users
 * @param {*} user
 * @returns
 */
async function generateToken(user) {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    codeSentAt: user.codeSentAt,
  };
  const token = JWT.sign(payload, process.env.JWT_SECRET);
  return token;
}

module.exports = { verifyToken, generateToken };
