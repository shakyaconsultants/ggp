import { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { useNutritionist } from "../../context/NutritionistContext";
import { useApiFeedback } from "../../hooks/useApiFeedback";
import { useSubscriptionPayment } from "../../hooks/useSubscriptionPayment";
import InvoiceDocument from "../../components/billing/InvoiceDocument";
import Modal from "../../components/Modal";
import {
  formatBillingDate,
  formatInr,
  subscriptionStatusClass,
  subscriptionStatusLabel,
} from "../../utils/billingFormat";

export default function AccountBilling() {
  const { refreshSubscription } = useNutritionist();
  const { notifyError } = useApiFeedback();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.billingOverview();
      setOverview(data);
    } catch (e) {
      notifyError(e);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const { pay, paying } = useSubscriptionPayment({
    onSuccess: async () => {
      await refreshSubscription();
      await loadOverview();
    },
  });

  const openInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceLoading(true);
    try {
      const data = await api.billingInvoice(invoice.id);
      setInvoiceDetail(data);
    } catch (e) {
      notifyError(e);
      setSelectedInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
    setInvoiceDetail(null);
  };

  const printInvoice = () => {
    window.print();
  };

  const sub = overview?.subscription;
  const plan = overview?.plan;
  const invoices = overview?.invoices || [];
  const price = plan?.annual_price_inr ?? 1000;
  const configured = overview?.razorpay_configured;

  const renewalLabel =
    sub?.status === "trialing"
      ? `Trial ends ${formatBillingDate(sub?.trial_ends_at)}`
      : sub?.status === "active"
        ? `Renews ${formatBillingDate(sub?.subscription_ends_at)}`
        : "Subscription inactive";

  return (
    <div className="page billing-account-page">
      <header className="page-header">
        <div>
          <h1>Billing & subscription</h1>
          <p className="muted">
            Manage your Good Gut Product plan, payments, and download invoices for your records.
          </p>
        </div>
        {sub && (
          <span className={subscriptionStatusClass(sub.status)}>
            {subscriptionStatusLabel(sub.status)}
          </span>
        )}
      </header>

      {loading ? (
        <div className="card panel">
          <p className="muted">Loading billing details…</p>
        </div>
      ) : (
        <>
          <div className="billing-account-grid">
            <section className="card panel billing-plan-card">
              <p className="billing-card-eyebrow">Current plan</p>
              <h2>{plan?.name || "Annual Professional"}</h2>
              <div className="billing-plan-price">
                <strong>{formatInr(price)}</strong>
                <span className="muted">/ year</span>
              </div>
              <ul className="billing-plan-points">
                <li>{plan?.trial_days ?? 15}-day free trial for new accounts</li>
                <li>Full dashboard + unlimited clients</li>
                <li>Client mobile app access while subscription is active</li>
              </ul>
              <div className="billing-plan-meta">
                <div>
                  <span className="cred-label">Status</span>
                  <strong>{subscriptionStatusLabel(sub?.status)}</strong>
                </div>
                <div>
                  <span className="cred-label">
                    {sub?.status === "trialing" ? "Trial ends" : "Valid until"}
                  </span>
                  <strong>
                    {sub?.status === "trialing"
                      ? formatBillingDate(sub?.trial_ends_at)
                      : formatBillingDate(sub?.subscription_ends_at)}
                  </strong>
                </div>
                {sub?.days_remaining != null && sub?.allowed && (
                  <div>
                    <span className="cred-label">Days remaining</span>
                    <strong>{sub.days_remaining}</strong>
                  </div>
                )}
              </div>

              {!configured && (
                <p className="billing-note muted">
                  Razorpay is not configured on the server. Contact support or add API keys to
                  enable checkout.
                </p>
              )}

              <div className="billing-plan-actions">
                {(sub?.status === "expired" || sub?.status === "trialing") && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={pay}
                    disabled={paying || !configured}
                  >
                    {paying
                      ? "Opening checkout…"
                      : sub?.status === "expired"
                        ? `Pay ${formatInr(price)} to restore access`
                        : `Pay ${formatInr(price)} / year early`}
                  </button>
                )}
                {sub?.status === "active" && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={pay}
                    disabled={paying || !configured}
                  >
                    {paying ? "Opening checkout…" : "Renew / extend 1 year"}
                  </button>
                )}
              </div>
            </section>

            <section className="card panel billing-summary-card">
              <p className="billing-card-eyebrow">Account</p>
              <h3>{overview?.account?.name || "Your practice"}</h3>
              <dl className="billing-dl">
                <div>
                  <dt>Email</dt>
                  <dd>{overview?.account?.email}</dd>
                </div>
                {overview?.account?.organisation && (
                  <div>
                    <dt>Organisation</dt>
                    <dd>{overview.account.organisation}</dd>
                  </div>
                )}
                <div>
                  <dt>{renewalLabel}</dt>
                  <dd>
                    {sub?.last_payment_at
                      ? `Last paid ${formatBillingDate(sub.last_payment_at)}`
                      : "No payments yet"}
                  </dd>
                </div>
              </dl>
              <p className="muted billing-help">
                Need help? Email{" "}
                <a href="mailto:billing@goodgutproduct.in">billing@goodgutproduct.in</a>
              </p>
            </section>
          </div>

          <section className="card panel billing-invoices-section">
            <div className="billing-invoices-head">
              <div>
                <h2>Invoices & receipts</h2>
                <p className="muted">Download or print tax invoices for completed payments.</p>
              </div>
              <span className="admin-count-badge">{invoices.length}</span>
            </div>

            {invoices.length === 0 ? (
              <div className="billing-empty-invoices">
                <p>No invoices yet.</p>
                <p className="muted">
                  After your first Razorpay payment, a tax invoice will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table billing-invoices-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.invoice_number}</strong>
                        </td>
                        <td>{formatBillingDate(inv.paid_at)}</td>
                        <td>
                          {formatBillingDate(inv.period_start)} —{" "}
                          {formatBillingDate(inv.period_end)}
                        </td>
                        <td>{formatInr(inv.amount_inr)}</td>
                        <td>
                          <span className="billing-badge billing-badge-active">Paid</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openInvoice(inv)}
                          >
                            View bill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <Modal
        open={Boolean(selectedInvoice)}
        onClose={closeInvoice}
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoice_number}` : "Invoice"}
        wide
      >
        {invoiceLoading ? (
          <p className="muted">Loading invoice…</p>
        ) : (
          <InvoiceDocument
            invoice={invoiceDetail?.invoice}
            seller={invoiceDetail?.seller || overview?.seller}
            onPrint={printInvoice}
          />
        )}
      </Modal>
    </div>
  );
}
