import {
  formatBillingDate,
  formatInr,
} from "../../utils/billingFormat";

export default function InvoiceDocument({ invoice, seller, showActions = true, onPrint }) {
  if (!invoice) return null;

  const subtotal = Number(invoice.amount_inr) || 0;

  return (
    <div className="invoice-document">
      <div className="invoice-document-head">
        <div>
          <p className="invoice-brand">Good Gut Product</p>
          <p className="invoice-seller-line">{seller?.legal_name || seller?.name}</p>
          <p className="invoice-seller-line muted">{seller?.email}</p>
        </div>
        <div className="invoice-head-right">
          <h2>Tax Invoice</h2>
          <p>
            <strong>{invoice.invoice_number}</strong>
          </p>
          <p className="muted">Date: {formatBillingDate(invoice.paid_at)}</p>
          <span className="invoice-status-paid">{invoice.status === "paid" ? "Paid" : invoice.status}</span>
        </div>
      </div>

      <div className="invoice-parties">
        <div>
          <span className="invoice-label">Bill to</span>
          <p className="invoice-party-name">{invoice.bill_to?.name || "—"}</p>
          {invoice.bill_to?.organisation && (
            <p className="muted">{invoice.bill_to.organisation}</p>
          )}
          <p className="muted">{invoice.bill_to?.email}</p>
          {invoice.bill_to?.address && <p className="muted">{invoice.bill_to.address}</p>}
        </div>
        <div>
          <span className="invoice-label">Subscription period</span>
          <p>
            {formatBillingDate(invoice.period_start)} — {formatBillingDate(invoice.period_end)}
          </p>
        </div>
      </div>

      <div className="table-wrap invoice-table-wrap">
        <table className="data-table invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Plan</th>
              <th className="invoice-col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{invoice.description}</td>
              <td>{invoice.plan_type || "annual"}</td>
              <td className="invoice-col-amount">{formatInr(subtotal)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>Total</strong>
              </td>
              <td className="invoice-col-amount">
                <strong>{formatInr(subtotal)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="invoice-meta-grid">
        <div>
          <span className="invoice-label">Payment reference</span>
          <p className="invoice-mono">{invoice.razorpay_payment_id || "—"}</p>
        </div>
        <div>
          <span className="invoice-label">Order ID</span>
          <p className="invoice-mono">{invoice.razorpay_order_id || "—"}</p>
        </div>
      </div>

      {seller?.gst_note && <p className="invoice-footnote muted">{seller.gst_note}</p>}

      {showActions && onPrint && (
        <div className="invoice-actions no-print">
          <button type="button" className="btn btn-primary" onClick={onPrint}>
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
}
