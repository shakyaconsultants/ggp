const jwt = require("jsonwebtoken");
const ggpKey = process.env.GGP_SECRET_KEY;

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Admin access denied" });
  }
  try {
    const decoded = jwt.verify(token, ggpKey);
    if (decoded?.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin role required" });
    }
    req.admin = decoded.user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
};
