require("dotenv").config();
const jwt = require("jsonwebtoken");

const ggpKey = process.env.GGP_SECRET_KEY;
const validApiKeys = (
  process.env.VALID_API_KEYS || "12345-abcde,67890-fghij,ggp-pro-ject"
)
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

/**
 * Allows:
 * - x-api-key (admin / dashboard integrations) → req.isAdminApiKey = true
 * - JWT with role admin → full access to nutritionist client routes
 * - JWT with role nutritionist → access when route checks matching :id
 */
module.exports = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  if (apiKey && validApiKeys.includes(apiKey)) {
    req.isAdminApiKey = true;
    return next();
  }

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, ggpKey);
    req.userInfo = decoded;

    if (decoded?.user?.role === "admin") {
      req.isAdminApiKey = true;
      return next();
    }

    if (decoded?.user?.role === "nutritionist") {
      return next();
    }

    return res.status(403).json({ message: "Nutritionist or admin access required" });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
