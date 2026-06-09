import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminClient";
import { useApiFeedback } from "../../hooks/useApiFeedback";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category: "",
  image_url: "",
};

export default function AdminCatalog() {
  const { notifyError, notifySuccess } = useApiFeedback();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .products()
      .then((r) => setProducts(r.products || []))
      .catch((e) => notifyError(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        setSubmitting(true);

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      category: form.category.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editId) {
        await adminApi.updateProduct(editId, body);
        notifySuccess("Product updated.");
      } else {
        await adminApi.createProduct(body);
        notifySuccess("Product added to catalog.");
      }
      resetForm();
      load();
    } catch (err) {
      notifyError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      stock_quantity: String(p.stock_quantity ?? ""),
      category: p.category || "",
      image_url: p.image_url || "",
    });
  };

  const remove = async (p) => {
    if (!confirm(`Remove "${p.name}" from the catalog?`)) return;
    try {
      await adminApi.deleteProduct(p.id);
      notifySuccess("Product removed.");
      if (editId === p.id) resetForm();
      load();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Shop catalog</h1>
          <p className="muted">
            Platform products for the mobile app shop — mapped to the in-app shop section later.
          </p>
        </div>
        <span className="admin-count-badge">{products.length} products</span>
      </header>

      <section className="card panel admin-catalog-form">
        <h2>{editId ? "Edit product" : "Add product"}</h2>
        <form onSubmit={handleSubmit} className="form grid-2">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Supplements"
            />
          </label>
          <label>
            Price (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              required
            />
          </label>
          <label className="form-full">
            Image URL
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://…"
            />
          </label>
          <label className="form-full">
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <div className="form-full admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editId ? "Save changes" : "Add to catalog"}
            </button>
            {editId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="card panel table-wrap">
        {loading ? (
          <p className="muted">Loading catalog…</p>
        ) : products.length === 0 ? (
          <p className="empty-cell">No products yet. Add items above for the app shop.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && (
                      <>
                        <br />
                        <span className="muted admin-cell-sub">{p.description}</span>
                      </>
                    )}
                  </td>
                  <td>{p.category || "—"}</td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td>{p.stock_quantity}</td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => remove(p)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
