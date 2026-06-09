const jwt = require("jsonwebtoken");
const ggpKey = process.env.GGP_SECRET_KEY;

/** Sets req.userInfo when Bearer token is valid; does not reject missing/invalid tokens. */
module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next();
  }
  try {
    req.userInfo = jwt.verify(token, ggpKey);
  } catch {
    // ignore invalid token — route may still serve public/default content
  }
  next();
};
