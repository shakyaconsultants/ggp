const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("../routes/cors");
const db = require("../sqlconnection");
const router = express.Router();
const auth = require("../routes/auth");
const ggpKey = process.env.GGP_SECRET_KEY;
const { getClientNutritionistId } = require("../common/clientNutritionist");
const { getNutritionistAccess } = require("../common/subscription");

router.post("/login", cors, async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = "SELECT id,password,isActive FROM UserLogins where email = ?";
    db.execute(query, [email], async (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: "Database error " + err });
      }

      if (results.length == 0) {
        return res
          .status(404)
          .json({ msg: "No account found with this email" });
      }

      const isMatch = await bcrypt.compare(password, results[0]?.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }

      if (results[0].isActive == 0) {
        return res.status(403).json({ msg: "Please activate your account" });
      }

      const clientId = results[0].id;
      const nutritionistId = await getClientNutritionistId(clientId);
      if (nutritionistId) {
        const access = await getNutritionistAccess(nutritionistId);
        if (!access.allowed) {
          return res.status(403).json({
            msg: "Your nutritionist's practice subscription is inactive. Please ask them to renew on Good Gut Product.",
            code: "PRACTICE_SUBSCRIPTION_INACTIVE",
          });
        }
      }

      const payload = { user: { id: clientId } };
      jwt.sign(payload, ggpKey, { expiresIn: "10h" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/userdata", auth, (req, res) => {
  const userID = req?.userInfo?.user?.id;

  const newQuery = "SELECT * FROM UserData WHERE userId = ?";
  db.execute(newQuery, [userID], (error, result) => {
    if (error) {
      return res.status(500).json({ msg: "Database Error" });
    }

    if (result.length > 0) {
      const updates = req.body;

      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = Object.values(updates);

      const sql = `
        UPDATE UserData
        SET ${fields}
        WHERE userId = ?
      `;

      db.query(sql, [...values, userID], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to update data" });
        }

        if (result.affectedRows > 0) {
          return res.status(200).json({ message: "Data updated successfully" });
        } else {
          return res.status(500).json({ message: "Data Not updated" });
        }
      });
    } else {
      const {
        gender,
        dob,
        height,
        weight,
        medical,
        goal,
        bodyfat,
        workout,
        food,
        occupation,
        onboarded,
        targetWeight,
      } = req.body;

      const sql = `
        INSERT INTO UserData (userId, gender, dob, height, weight, medical, goal, bodyfat, workout, food, occupation, onboarded,targetWeight)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true,?)
      `;

      db.query(
        sql,
        [
          userID,
          gender,
          dob,
          height,
          weight,
          medical,
          goal,
          bodyfat,
          workout,
          food,
          occupation,
          onboarded,
          targetWeight,
        ],
        (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ error: "Failed to insert data" + err });
          }

          if (result.affectedRows > 0) {
            return res
              .status(201)
              .json({ message: "Data inserted successfully" });
          } else {
            return res.status(500).json({ message: "Data not inserted" });
          }
        }
      );
    }
  });
});

router.get("/version", cors, async (req, res) => {
  try {
    res.status(200).json({ version: "1.0.0" });
  } catch (err) {
    res.status(500).json({ message: "Error fecthing version" });
  }
});

module.exports = router;
