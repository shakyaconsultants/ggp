const db = require("../sqlconnection");

const pool = db.promise();

const TRIAL_DAYS = Number(process.env.TRIAL_DAYS) || 15;
const ANNUAL_PRICE_INR = Number(process.env.SUBSCRIPTION_PRICE_INR) || 1000;

function daysUntil(date) {
  if (!date) return 0;
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function computeAccess(row) {
  if (!row) {
    return {
      allowed: false,
      status: "unknown",
      message: "Account not found.",
    };
  }

  const now = new Date();
  const trialEnds = row.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const subEnds = row.subscription_ends_at ? new Date(row.subscription_ends_at) : null;
  let status = row.subscription_status || "trialing";

  if (status === "trialing") {
    if (!trialEnds || trialEnds <= now) status = "expired";
  } else if (status === "active") {
    if (subEnds && subEnds <= now) status = "expired";
  }

  const trialing = status === "trialing" && trialEnds && trialEnds > now;
  const active = status === "active" && (!subEnds || subEnds > now);
  const allowed = trialing || active;

  let message = null;
  if (!allowed) {
    message =
      "Your free trial has ended. Pay ₹1,000/year to continue your dashboard and restore client app access.";
  }

  return {
    allowed,
    status,
    trial_ends_at: trialEnds ? trialEnds.toISOString() : null,
    subscription_ends_at: subEnds ? subEnds.toISOString() : null,
    days_remaining: trialing
      ? daysUntil(trialEnds)
      : active
        ? daysUntil(subEnds)
        : 0,
    trial_days: TRIAL_DAYS,
    annual_price_inr: ANNUAL_PRICE_INR,
    message,
  };
}

async function getNutritionistAccess(nutritionistId) {
  const [rows] = await pool.execute(
    `SELECT subscription_status, trial_ends_at, subscription_ends_at, created_at
     FROM nutritionists WHERE id = ? LIMIT 1`,
    [nutritionistId]
  );
  return computeAccess(rows[0]);
}

function subscriptionPayload(row) {
  const access = computeAccess(row);
  return {
    subscription_status: access.status,
    trial_ends_at: access.trial_ends_at,
    subscription_ends_at: access.subscription_ends_at,
    subscription_active: access.allowed,
    days_remaining: access.days_remaining,
    trial_days: access.trial_days,
    annual_price_inr: access.annual_price_inr,
  };
}

function pickNutritionistRow(n) {
  return {
    subscription_status: n.subscription_status,
    trial_ends_at: n.trial_ends_at,
    subscription_ends_at: n.subscription_ends_at,
    created_at: n.created_at,
  };
}

module.exports = {
  TRIAL_DAYS,
  ANNUAL_PRICE_INR,
  computeAccess,
  getNutritionistAccess,
  subscriptionPayload,
  pickNutritionistRow,
};
