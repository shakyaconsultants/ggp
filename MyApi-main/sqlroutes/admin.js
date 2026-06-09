/**
 * SaaS platform admin — used by ggp-saas-portal /admin panel.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../sqlconnection");
const adminAuth = require("../routes/adminAuth");

const router = express.Router();
const pool = db.promise();
const ggpKey = process.env.GGP_SECRET_KEY;

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM admins WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { user: { id: admin.id, role: "admin", email: admin.email } },
      ggpKey,
      { expiresIn: "12h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/analytics", adminAuth, async (req, res) => {
  try {
    const [[nutRow]] = await pool.execute("SELECT COUNT(*) AS c FROM nutritionists");
    const [[clientRow]] = await pool.execute(
      "SELECT COUNT(DISTINCT client_id) AS c FROM nutritionist_clients"
    );
    const [[activeRow]] = await pool.execute(
      "SELECT COUNT(*) AS c FROM nutritionist_clients WHERE status = 'active'"
    );
    const [[profileRow]] = await pool.execute(
      `SELECT COUNT(*) AS c FROM UserData ud
       INNER JOIN nutritionist_clients nc ON nc.client_id = ud.userId
       WHERE ud.onboarded = 1`
    );
    const [[nut30]] = await pool.execute(
      "SELECT COUNT(*) AS c FROM nutritionists WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[client30]] = await pool.execute(
      "SELECT COUNT(*) AS c FROM nutritionist_clients WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    const clients = clientRow.c || 0;
    const nutritionists = nutRow.c || 0;
    const activeClients = activeRow.c || 0;
    const profilesComplete = profileRow.c || 0;

    const [nutritionistTrend] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM nutritionists
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    const [clientTrend] = await pool.execute(
      `SELECT DATE_FORMAT(nc.created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM nutritionist_clients nc
       WHERE nc.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month ASC`
    );

    const [recentNutritionists] = await pool.execute(
      `SELECT first_name, last_name, email, specialty, created_at
       FROM nutritionists ORDER BY created_at DESC LIMIT 6`
    );

    const [recentClients] = await pool.execute(
      `SELECT u.name, u.email,
              n.first_name AS nutritionist_first_name,
              n.last_name AS nutritionist_last_name,
              nc.status, nc.created_at AS linked_at
       FROM nutritionist_clients nc
       JOIN UserLogins u ON u.id = nc.client_id
       JOIN nutritionists n ON n.id = nc.nutritionist_id
       ORDER BY nc.created_at DESC LIMIT 8`
    );

    const [topPractices] = await pool.execute(
      `SELECT n.id, n.first_name, n.last_name, n.email, n.specialty,
              COUNT(nc.client_id) AS client_count,
              SUM(CASE WHEN nc.status = 'active' THEN 1 ELSE 0 END) AS active_clients
       FROM nutritionists n
       LEFT JOIN nutritionist_clients nc ON nc.nutritionist_id = n.id
       GROUP BY n.id
       ORDER BY client_count DESC, n.created_at DESC
       LIMIT 8`
    );

    const [specialtyBreakdown] = await pool.execute(
      `SELECT COALESCE(NULLIF(TRIM(specialty), ''), 'Unspecified') AS specialty,
              COUNT(*) AS count
       FROM nutritionists
       GROUP BY specialty
       ORDER BY count DESC
       LIMIT 6`
    );

    res.json({
      generated_at: new Date().toISOString(),
      totals: {
        nutritionists,
        clients,
        active_clients: activeClients,
        profiles_complete: profilesComplete,
      },
      growth: {
        nutritionists_last_30d: nut30.c,
        clients_linked_last_30d: client30.c,
      },
      rates: {
        avg_clients_per_practice:
          nutritionists > 0 ? Math.round((clients / nutritionists) * 10) / 10 : 0,
        profile_completion_pct:
          clients > 0 ? Math.round((profilesComplete / clients) * 100) : 0,
        active_client_pct:
          clients > 0 ? Math.round((activeClients / clients) * 100) : 0,
      },
      trends: {
        nutritionist_signups: nutritionistTrend,
        client_links: clientTrend,
      },
      specialty_breakdown: specialtyBreakdown,
      recent_nutritionists: recentNutritionists,
      recent_clients: recentClients,
      top_practices: topPractices,
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/nutritionists", adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT n.id, n.first_name, n.last_name, n.email, n.phone_number,
              n.specialty, n.years_of_experience, n.current_organisation,
              n.address, n.created_at, n.updated_at,
              COUNT(nc.client_id) AS client_count,
              SUM(CASE WHEN nc.status = 'active' THEN 1 ELSE 0 END) AS active_clients,
              SUM(CASE WHEN ud.onboarded = 1 THEN 1 ELSE 0 END) AS profiles_complete
       FROM nutritionists n
       LEFT JOIN nutritionist_clients nc ON nc.nutritionist_id = n.id
       LEFT JOIN UserData ud ON ud.userId = nc.client_id
       GROUP BY n.id
       ORDER BY n.created_at DESC`
    );

    const totals = rows.reduce(
      (acc, n) => {
        acc.clients += Number(n.client_count) || 0;
        acc.active += Number(n.active_clients) || 0;
        return acc;
      },
      { clients: 0, active: 0 }
    );

    res.json({
      nutritionists: rows,
      total: rows.length,
      summary: {
        practices: rows.length,
        linked_clients: totals.clients,
        active_clients: totals.active,
      },
    });
  } catch (err) {
    console.error("Admin nutritionists list error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/nutritionists/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [nuts] = await pool.execute(
      `SELECT id, first_name, last_name, email, phone_number, specialty,
              years_of_experience, current_organisation, address,
              created_at, updated_at
       FROM nutritionists WHERE id = ?`,
      [id]
    );
    if (!nuts.length) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }

    const [clients] = await pool.execute(
      `SELECT u.id AS client_id, u.name, u.email, u.signupdate,
              nc.status AS relationship_status, nc.created_at AS linked_at,
              ud.onboarded, ud.goal
       FROM nutritionist_clients nc
       INNER JOIN UserLogins u ON u.id = nc.client_id
       LEFT JOIN UserData ud ON ud.userId = u.id
       WHERE nc.nutritionist_id = ?
       ORDER BY nc.created_at DESC`,
      [id]
    );

    const [[counts]] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM nutritionist_clients WHERE nutritionist_id = ?) AS clients,
         (SELECT COUNT(*) FROM nutritionist_clients WHERE nutritionist_id = ? AND status = 'active') AS active_clients,
         (SELECT COUNT(*) FROM nutritionist_clients nc
          INNER JOIN UserData ud ON ud.userId = nc.client_id
          WHERE nc.nutritionist_id = ? AND ud.onboarded = 1) AS profiles_complete,
         (SELECT COUNT(*) FROM diet_plans WHERE nutritionist_id = ?) AS diet_plans,
         (SELECT COUNT(*) FROM food_items WHERE nutritionist_id = ?) AS food_items,
         (SELECT COUNT(*) FROM exercises WHERE nutritionist_id = ?) AS exercises`,
      [id, id, id, id, id, id]
    );

    res.json({
      nutritionist: nuts[0],
      clients,
      stats: counts,
    });
  } catch (err) {
    console.error("Admin nutritionist detail error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/clients", adminAuth, async (req, res) => {
  const nutritionistId = parseInt(req.query.nutritionist_id, 10);
  const status = req.query.status?.trim();

  if (!nutritionistId || Number.isNaN(nutritionistId)) {
    return res.status(400).json({ error: "nutritionist_id query parameter is required" });
  }

  try {
    const [nuts] = await pool.execute(
      `SELECT id, first_name, last_name, email, specialty
       FROM nutritionists WHERE id = ?`,
      [nutritionistId]
    );
    if (!nuts.length) {
      return res.status(404).json({ error: "Nutritionist not found" });
    }

    let query = `
      SELECT u.id AS client_id, u.name, u.email, u.signupdate, u.isActive,
             nc.nutritionist_id,
             nc.status AS relationship_status, nc.created_at AS linked_at,
             ud.onboarded, ud.goal, ud.gender, ud.weight
      FROM nutritionist_clients nc
      INNER JOIN UserLogins u ON u.id = nc.client_id
      LEFT JOIN UserData ud ON ud.userId = u.id
      WHERE nc.nutritionist_id = ?
    `;
    const params = [nutritionistId];

    if (status) {
      query += " AND nc.status = ?";
      params.push(status);
    }

    query += " ORDER BY nc.created_at DESC";

    const [clients] = await pool.execute(query, params);

    res.json({
      nutritionist: nuts[0],
      clients,
      total: clients.length,
    });
  } catch (err) {
    console.error("Admin clients list error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/products", adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, description, price, stock_quantity, category, image_url,
              nutritionist_id, created_at, updated_at
       FROM products
       ORDER BY created_at DESC`
    );
    res.json({ products: rows });
  } catch (err) {
    console.error("Admin products list error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/admin/products", adminAuth, async (req, res) => {
  const { name, description, price, stock_quantity, category, image_url } = req.body;
  if (!name || price == null || stock_quantity == null) {
    return res.status(400).json({ error: "Name, price, and stock quantity are required" });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO products
       (name, description, price, stock_quantity, category, image_url, nutritionist_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NOW(), NOW())`,
      [
        name,
        description || null,
        Number(price),
        Number(stock_quantity),
        category || null,
        image_url || null,
      ]
    );

    res.status(201).json({
      message: "Product created",
      product: { id: result.insertId, name, price: Number(price), stock_quantity: Number(stock_quantity) },
    });
  } catch (err) {
    console.error("Admin product create error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/admin/products/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock_quantity, category, image_url } = req.body;

  const fields = [];
  const values = [];
  if (name != null) {
    fields.push("name = ?");
    values.push(name);
  }
  if (description != null) {
    fields.push("description = ?");
    values.push(description);
  }
  if (price != null) {
    fields.push("price = ?");
    values.push(Number(price));
  }
  if (stock_quantity != null) {
    fields.push("stock_quantity = ?");
    values.push(Number(stock_quantity));
  }
  if (category != null) {
    fields.push("category = ?");
    values.push(category);
  }
  if (image_url != null) {
    fields.push("image_url = ?");
    values.push(image_url);
  }

  if (!fields.length) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);

  try {
    const [result] = await pool.execute(
      `UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("Admin product update error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Admin product delete error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
