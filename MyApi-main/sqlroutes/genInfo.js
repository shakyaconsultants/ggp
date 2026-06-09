const express = require("express");
const cors = require("../routes/cors");
const db = require("../sqlconnection");
const router = express.Router();
const logger = require("../logger");
const auth = require("../routes/auth");

router.post("/dailytrack", cors, auth, (req, res) => {
  const userID = req?.userInfo?.user?.id;
  const { selectedDate } = req.body;

  const query =
    "Select * from DailyTrack Where selectedDate = ? AND userId = ?";

  db.execute(query, [selectedDate, userID], (error, result) => {
    if (!error) {
      console.log(selectedDate, userID);
      if (result?.length > 0) {
        const updates = req.body;

        const fields = Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(", ");

        const values = Object.values(updates);

        const sql = `
            UPDATE DailyTrack
            SET ${fields}
            WHERE userId = ? AND selectedDate = ?
          `;

        db.query(sql, [...values, userID, selectedDate], (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update data" });
          }

          if (result.affectedRows > 0) {
            return res
              .status(200)
              .json({ message: "Data updated successfully" });
          } else {
            return res.status(500).json({ message: "Data Not updated" });
          }
        });
      } else {
        const { selectedDate, sleepHours, waterIntake, steps } = req.body;
        const query =
          "INSERT INTO DailyTrack (userId,selectedDate,sleepHours,waterIntake,steps) Values (?,?,?,?,?)";

        db.execute(
          query,
          [
            userID,
            selectedDate,
            sleepHours ? sleepHours : 0,
            waterIntake ? waterIntake : 0,
            steps ? steps : 0,
          ],
          (error, result) => {
            if (error) {
              return res
                .status(500)
                .json({ message: "Error in Adding data" + error });
            } else {
              return res.status(201).json({ message: "New data added" });
            }
          }
        );
      }
    }
  });
});

router.get("/dailytrack", cors, auth, (req, res) => {
  const userID = req?.userInfo?.user?.id;
  const { date } = req.query;

  if (!userID || !date) {
    return res.status(400).json({
      error: "Missing required parameters: date",
    });
  }

  const query =
    "SELECT userId, selectedDate, sleepHours, waterIntake, steps FROM DailyTrack WHERE selectedDate = ? AND userId = ?";

  db.execute(query, [date, userID], (error, result) => {
    if (error) {
      console.error("Error fetching daily track:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(200).json({
        userId: userID,
        selectedDate: date,
        sleepHours: 0,
        waterIntake: 0,
        steps: 0,
      });
    }

    res.status(200).json(result[0]);
  });
});

module.exports = router;
