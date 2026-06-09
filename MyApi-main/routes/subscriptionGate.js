const jwt = require("jsonwebtoken");
const ggpKey = process.env.GGP_SECRET_KEY;
const { getClientNutritionistId } = require("../common/clientNutritionist");
const { getNutritionistAccess } = require("../common/subscription");

const SKIP_PATHS = [
  "/billing",
  "/nutritionists/signup",
  "/nutritionists/login",
  "/admin/login",
  "/admin/",
  "/login",
  "/test",
];

function shouldSkip(path) {
  return SKIP_PATHS.some(
    (prefix) => path === prefix || path.startsWith(prefix)
  );
}

module.exports = async function subscriptionGate(req, res, next) {
  const path = req.path || "";

  if (shouldSkip(path)) {
    return next();
  }

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, ggpKey);
  } catch {
    return next();
  }

  try {
    if (decoded?.user?.role === "nutritionist") {
      const access = await getNutritionistAccess(decoded.user.id);
      req.subscription = access;
      if (!access.allowed) {
        return res.status(402).json({
          error: access.message,
          code: "SUBSCRIPTION_REQUIRED",
          subscription: access,
        });
      }
      return next();
    }

    if (decoded?.user?.id && !decoded?.user?.role) {
      if (path === "/usermeta") {
        return next();
      }

      const nutritionistId = await getClientNutritionistId(decoded.user.id);
      if (!nutritionistId) {
        return next();
      }

      const access = await getNutritionistAccess(nutritionistId);
      if (!access.allowed) {
        return res.status(403).json({
          msg: "Your nutritionist's practice subscription is inactive. Please contact your nutritionist.",
          code: "PRACTICE_SUBSCRIPTION_INACTIVE",
          subscription: access,
        });
      }
    }

    return next();
  } catch (err) {
    console.error("subscriptionGate:", err);
    return next();
  }
};
