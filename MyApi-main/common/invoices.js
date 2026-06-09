const db = require("../sqlconnection");

const pool = db.promise();

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `GGP-${year}-`;
  const [rows] = await pool.execute(
    "SELECT invoice_number FROM nutritionist_invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1",
    [`${prefix}%`]
  );

  let seq = 1;
  if (rows.length) {
    const last = rows[0].invoice_number;
    const part = last.slice(prefix.length);
    const n = parseInt(part, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(5, "0")}`;
}

function formatInvoiceRow(row, nutritionist = null) {
  return {
    id: row.id,
    invoice_number: row.invoice_number,
    amount_inr: Number(row.amount_inr),
    currency: row.currency,
    description: row.description,
    plan_type: row.plan_type,
    period_start: row.period_start,
    period_end: row.period_end,
    razorpay_order_id: row.razorpay_order_id,
    razorpay_payment_id: row.razorpay_payment_id,
    status: row.status,
    paid_at: row.paid_at,
    created_at: row.created_at,
    bill_to: nutritionist
      ? {
          name: `${nutritionist.first_name || ""} ${nutritionist.last_name || ""}`.trim(),
          email: nutritionist.email,
          organisation: nutritionist.current_organisation,
          address: nutritionist.address,
        }
      : undefined,
  };
}

async function createInvoice({
  nutritionistId,
  amountInr,
  description,
  periodStart,
  periodEnd,
  orderId,
  paymentId,
  paidAt = new Date(),
}) {
  const invoiceNumber = await nextInvoiceNumber();
  const [result] = await pool.execute(
    `INSERT INTO nutritionist_invoices
      (nutritionist_id, invoice_number, amount_inr, currency, description, plan_type,
       period_start, period_end, razorpay_order_id, razorpay_payment_id, status, paid_at)
     VALUES (?, ?, ?, 'INR', ?, 'annual', ?, ?, ?, ?, 'paid', ?)`,
    [
      nutritionistId,
      invoiceNumber,
      amountInr,
      description,
      periodStart,
      periodEnd,
      orderId || null,
      paymentId || null,
      paidAt,
    ]
  );

  return getInvoiceById(result.insertId, nutritionistId);
}

async function listInvoices(nutritionistId) {
  const [rows] = await pool.execute(
    `SELECT id, invoice_number, amount_inr, currency, description, plan_type,
            period_start, period_end, razorpay_order_id, razorpay_payment_id,
            status, paid_at, created_at
     FROM nutritionist_invoices
     WHERE nutritionist_id = ?
     ORDER BY paid_at DESC, id DESC`,
    [nutritionistId]
  );
  return rows.map((row) => formatInvoiceRow(row));
}

async function getInvoiceById(invoiceId, nutritionistId) {
  const [rows] = await pool.execute(
    `SELECT i.*, n.first_name, n.last_name, n.email, n.current_organisation, n.address
     FROM nutritionist_invoices i
     JOIN nutritionists n ON n.id = i.nutritionist_id
     WHERE i.id = ? AND i.nutritionist_id = ?
     LIMIT 1`,
    [invoiceId, nutritionistId]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return formatInvoiceRow(row, row);
}

async function backfillLatestPaymentInvoice(nutritionistId) {
  const [existing] = await pool.execute(
    "SELECT id FROM nutritionist_invoices WHERE nutritionist_id = ? LIMIT 1",
    [nutritionistId]
  );
  if (existing.length) return null;

  const [rows] = await pool.execute(
    `SELECT id, last_payment_at, subscription_ends_at, razorpay_order_id, razorpay_payment_id
     FROM nutritionists WHERE id = ? AND last_payment_at IS NOT NULL LIMIT 1`,
    [nutritionistId]
  );
  if (!rows.length) return null;

  const n = rows[0];
  const periodEnd = n.subscription_ends_at
    ? new Date(n.subscription_ends_at)
    : new Date(n.last_payment_at);
  const periodStart = new Date(periodEnd);
  periodStart.setFullYear(periodStart.getFullYear() - 1);

  return createInvoice({
    nutritionistId,
    amountInr: Number(process.env.SUBSCRIPTION_PRICE_INR) || 1000,
    description: "Good Gut Product — Annual SaaS subscription",
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
    orderId: n.razorpay_order_id,
    paymentId: n.razorpay_payment_id,
    paidAt: n.last_payment_at,
  });
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  backfillLatestPaymentInvoice,
  formatInvoiceRow,
};
