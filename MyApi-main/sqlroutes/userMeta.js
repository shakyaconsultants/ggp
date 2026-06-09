const express = require("express");
const cors = require("../routes/cors");
const db = require("../sqlconnection");
const router = express.Router();
const auth = require("../routes/auth");
const { getNutritionistAccess } = require("../common/subscription");

router.get("/usermeta", cors, auth, async (req, res) => {
  const userID = req?.userInfo?.user?.id;
  const query = `
      SELECT
        UserData.*,
        UserLogins.name,
        UserLogins.email,
        n.id AS nutritionist_profile_id,
        n.first_name AS nutritionist_first_name,
        n.last_name AS nutritionist_last_name,
        n.email AS nutritionist_email,
        n.phone_number AS nutritionist_phone,
        n.specialty AS nutritionist_specialty,
        n.years_of_experience AS nutritionist_experience,
        n.current_organisation AS nutritionist_organisation,
        n.address AS nutritionist_address,
        n.subscription_status AS nutritionist_subscription_status,
        n.trial_ends_at AS nutritionist_trial_ends_at,
        n.subscription_ends_at AS nutritionist_subscription_ends_at
      FROM UserLogins
      LEFT JOIN UserData ON UserData.userId = UserLogins.id
      LEFT JOIN nutritionists n ON n.id = UserData.assignNutritionist
      WHERE UserLogins.id = ?
    `;
  db.execute(query, [userID], async (err, results) => {
    if (err) {
      console.error("Error fetching user metadata:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "ID not found" });
    }

    const row = results[0];
    const payload = { ...row };

    if (row.assignNutritionist && row.nutritionist_profile_id) {
      const access = await getNutritionistAccess(row.nutritionist_profile_id);
      payload.nutritionist = {
        id: row.nutritionist_profile_id,
        name: `${row.nutritionist_first_name || ""} ${row.nutritionist_last_name || ""}`.trim(),
        first_name: row.nutritionist_first_name,
        last_name: row.nutritionist_last_name,
        email: row.nutritionist_email,
        phone_number: row.nutritionist_phone,
        specialty: row.nutritionist_specialty,
        years_of_experience: row.nutritionist_experience,
        current_organisation: row.nutritionist_organisation,
        address: row.nutritionist_address,
        subscription_active: access.allowed,
        subscription_status: access.status,
        trial_ends_at: access.trial_ends_at,
        subscription_ends_at: access.subscription_ends_at,
      };
      payload.practice_active = access.allowed;
    } else {
      payload.nutritionist = null;
      payload.practice_active = true;
    }

    res.json(payload);
  });
});

module.exports = router;
