const crypto = require("crypto");
const express = require("express");
const db = require("../sqlconnection");
const nutritionistOrAdminAuth = require("../routes/nutritionistOrAdminAuth");
const {
  ANNUAL_PRICE_INR,
  TRIAL_DAYS,
  getNutritionistAccess,
} = require("../common/subscription");
const {
  createInvoice,
  listInvoices,
  getInvoiceById,
  backfillLatestPaymentInvoice,
} = require("../common/invoices");

const router = express.Router();
const pool = db.promise();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

const SELLER = {
  name: "Good Gut Product",
  legal_name: "Good Gut Product SaaS",
  email: "billing@goodgutproduct.in",
  address: "India",
  gst_note: "Tax invoice for SaaS subscription services.",
};

function getRazorpay() {
  if (!keyId || !keySecret) return null;
  // eslint-disable-next-line global-require
  const Razorpay = require("razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

async function activateSubscription(nutritionistId, paymentMeta = {}) {
  const paidAt = new Date();

  await pool.execute(
    `UPDATE nutritionists SET
      subscription_status = 'active',
      subscription_ends_at = DATE_ADD(
        GREATEST(COALESCE(subscription_ends_at, NOW()), NOW()),
        INTERVAL 1 YEAR
      ),
      last_payment_at = NOW(),
      razorpay_order_id = COALESCE(?, razorpay_order_id),
      razorpay_payment_id = COALESCE(?, razorpay_payment_id)
     WHERE id = ?`,
    [paymentMeta.orderId || null, paymentMeta.paymentId || null, nutritionistId]
  );

  const [rows] = await pool.execute(
    "SELECT subscription_ends_at FROM nutritionists WHERE id = ? LIMIT 1",
    [nutritionistId]
  );
  const periodEnd = rows[0]?.subscription_ends_at
    ? new Date(rows[0].subscription_ends_at)
    : new Date(paidAt.getTime() + 365 * 86400000);
  const periodStart = new Date(periodEnd);
  periodStart.setFullYear(periodStart.getFullYear() - 1);

  const invoice = await createInvoice({
    nutritionistId,
    amountInr: ANNUAL_PRICE_INR,
    description: "Good Gut Product — Annual SaaS subscription (1 year)",
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
    orderId: paymentMeta.orderId,
    paymentId: paymentMeta.paymentId,
    paidAt,
  });

  return invoice;
}

router.get("/billing/plans", (_req, res) => {
  res.json({
    trial_days: TRIAL_DAYS,
    trial_value_inr: ANNUAL_PRICE_INR,
    annual_price_inr: ANNUAL_PRICE_INR,
    currency: "INR",
    plan_name: "Annual Professional",
    razorpay_configured: Boolean(keyId && keySecret),
    seller: SELLER,
  });
});

router.get("/billing/status", nutritionistOrAdminAuth, async (req, res) => {
  try {
    if (req.isAdminApiKey) {
      return res.json({ subscription_active: true, status: "admin", allowed: true });
    }

    const nutritionistId = req.userInfo.user.id;
    const access = await getNutritionistAccess(nutritionistId);
    res.json({
      ...access,
      razorpay_key_id: keyId || null,
      razorpay_configured: Boolean(keyId && keySecret),
    });
  } catch (err) {
    console.error("billing/status:", err);
    res.status(500).json({ error: "Unable to load subscription status" });
  }
});

router.get("/billing/overview", nutritionistOrAdminAuth, async (req, res) => {
  try {
    if (req.isAdminApiKey) {
      return res.status(403).json({ error: "Not available for admin API key" });
    }

    const nutritionistId = req.userInfo.user.id;
    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone_number, current_organisation, address,
              subscription_status, trial_ends_at, subscription_ends_at, last_payment_at,
              created_at
       FROM nutritionists WHERE id = ? LIMIT 1`,
      [nutritionistId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = rows[0];
    const access = await getNutritionistAccess(nutritionistId);
    await backfillLatestPaymentInvoice(nutritionistId);
    const invoices = await listInvoices(nutritionistId);

    res.json({
      subscription: {
        ...access,
        last_payment_at: account.last_payment_at,
        account_created_at: account.created_at,
      },
      plan: {
        name: "Annual Professional",
        trial_days: TRIAL_DAYS,
        trial_value_inr: ANNUAL_PRICE_INR,
        annual_price_inr: ANNUAL_PRICE_INR,
        currency: "INR",
      },
      account: {
        id: account.id,
        name: `${account.first_name || ""} ${account.last_name || ""}`.trim(),
        email: account.email,
        phone_number: account.phone_number,
        organisation: account.current_organisation,
        address: account.address,
      },
      seller: SELLER,
      invoices,
      razorpay_configured: Boolean(keyId && keySecret),
    });
  } catch (err) {
    console.error("billing/overview:", err);
    res.status(500).json({ error: "Unable to load billing overview" });
  }
});

router.get("/billing/invoices/:id", nutritionistOrAdminAuth, async (req, res) => {
  try {
    const nutritionistId = req.userInfo.user.id;
    const invoice = await getInvoiceById(Number(req.params.id), nutritionistId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ invoice, seller: SELLER });
  } catch (err) {
    console.error("billing/invoices/:id:", err);
    res.status(500).json({ error: "Unable to load invoice" });
  }
});

router.post("/billing/create-order", nutritionistOrAdminAuth, async (req, res) => {
  try {
    if (req.isAdminApiKey) {
      return res.status(403).json({ error: "Admins cannot purchase nutritionist plans" });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        error: "Payments are not configured. Add Razorpay keys to the API server.",
        code: "PAYMENTS_NOT_CONFIGURED",
      });
    }

    const nutritionistId = req.userInfo.user.id;
    const [rows] = await pool.execute(
      "SELECT id, email, first_name, last_name FROM nutritionists WHERE id = ? LIMIT 1",
      [nutritionistId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }

    const n = rows[0];
    const amountPaise = ANNUAL_PRICE_INR * 100;
    const receipt = `ggp_${nutritionistId}_${Date.now()}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        nutritionist_id: String(nutritionistId),
        plan: "annual",
      },
    });

    await pool.execute(
      "UPDATE nutritionists SET razorpay_order_id = ? WHERE id = ?",
      [order.id, nutritionistId]
    );

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      name: SELLER.name,
      description: "Annual SaaS subscription (1 year)",
      prefill: {
        email: n.email,
        name: `${n.first_name || ""} ${n.last_name || ""}`.trim(),
      },
    });
  } catch (err) {
    console.error("billing/create-order:", err);
    res.status(500).json({ error: "Unable to create payment order" });
  }
});

router.post("/billing/verify-payment", nutritionistOrAdminAuth, async (req, res) => {
  try {
    if (!keySecret) {
      return res.status(503).json({ error: "Payments are not configured" });
    }

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const nutritionistId = req.userInfo.user.id;
    const invoice = await activateSubscription(nutritionistId, {
      orderId,
      paymentId,
    });

    const access = await getNutritionistAccess(nutritionistId);
    res.json({
      message: "Payment successful. Your subscription is active for 1 year.",
      invoice,
      ...access,
    });
  } catch (err) {
    console.error("billing/verify-payment:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

router.post("/billing/webhook", async (req, res) => {
  try {
    if (!webhookSecret) {
      return res.status(503).json({ error: "Webhook secret not configured" });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const signature = req.headers["x-razorpay-signature"];
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString());
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      const nutritionistId = payment?.notes?.nutritionist_id;

      if (nutritionistId) {
        await activateSubscription(Number(nutritionistId), {
          orderId,
          paymentId,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("billing/webhook:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;
