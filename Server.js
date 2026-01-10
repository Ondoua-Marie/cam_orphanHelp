const multer = require("multer");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) return console.log("❌ MySQL Error:", err.message);
  console.log("✅ MySQL Connected");
});

// Password rule for signup
const passwordRule = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

// Admin emails
const admins = [
  "marie@gmail.com",
  "charles@gmail.com",
  "priso@gmail.com",
  "roro@gmail.com",
  "yves@gmail.com",
  "alida@gmail.com"
];

// ---------------- POST ROUTES ---------------- //

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!passwordRule.test(password))
    return res.send("Password must have 8+ characters, letters and numbers");

  // Prevent admin emails from being registered as normal users
  if (admins.includes(email)) return res.send("Cannot register as admin here");

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send({ message: "Database error" });
    if (result.length > 0) return res.send("Email already exists");

    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hash],
      () => {
        res.send("Account created successfully");
      }
    );
  });
});


// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send({ message: "Database error" });
    if (result.length === 0) return res.send({ message: "Account not found" });

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.send({ message: "Incorrect password" });

    // Admin login
    if (admins.includes(email)) {
      return res.send({
        message: "Admin login successful",
        redirect: "/AdminD.html",
        adminName: result[0].name
      });
    }

    // Normal user login
    res.send({
      message: "Login successful",
      redirect: "/UserD.html",
      userName: result[0].name   // <-- Add this line
    });
  });
});


// ---------------- GET ROUTES ---------------- //
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/donation", (req, res) => res.sendFile(path.join(__dirname, "public", "donationF.html")));
app.get("/", (req, res) => res.redirect("/signup"));

// --------- IMAGE UPLOAD CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ---------------- DONATION ROUTE ---------------- //
app.post("/donate", upload.single("image"), (req, res) => {
  const { donorName, phone, orphanage, relayPoint, goodsType, description, address, donationDate, donationStatus, userEmail } = req.body;
  if (!userEmail) return res.send("You must be logged in to donate");

  db.query("SELECT * FROM users WHERE email = ?", [userEmail], (err, result) => {
    if (err) return res.send("Database error");
    if (result.length === 0) return res.send("You must be logged in to donate");

    const imagePath = req.file ? "/uploads/" + req.file.filename : null;
    const sql = `INSERT INTO donations
      (donorName, phone, orphanage, relayPoint, goodsType, imagePath, description, address, donationDate, donationStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [donorName, phone, orphanage, relayPoint, goodsType, imagePath, description, address, donationDate, donationStatus], (err) => {
      if (err) return res.send("Donation failed");
      res.send("Donation submitted successfully");
    });
  });
});

// ---------------- ADMIN API ---------------- //

// Get all donations
app.get("/api/donations", (req, res) => {
  db.query("SELECT * FROM donations", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Delete donation
app.delete("/api/donations/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM donations WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Donation deleted" });
  });
});

// Update donation status
app.put("/api/donations/:id", (req, res) => {
  const { id } = req.params;
  const { donationStatus } = req.body;
  db.query("UPDATE donations SET donationStatus = ? WHERE id = ?", [donationStatus, id], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    res.json({ message: "Donation status updated" });
  });
});

// Get all users (donors) **excluding admins**
app.get("/api/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const usersOnly = results.filter(u => !admins.includes(u.email));
    res.json(usersOnly);
  });
});

// Delete user **block admins**
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT email FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    const userEmail = result[0].email;
    if (admins.includes(userEmail)) return res.status(403).json({ error: "Cannot delete an admin" });

    db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "User deleted" });
    });
  });
});

// Get all relay points
app.get("/api/relay-points", (req, res) => {
  db.query("SELECT * FROM relay_points", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add relay point
app.post("/api/admin/relay", (req, res) => {
  const { location, manager, phone } = req.body;
  db.query("INSERT INTO relay_points (location, manager, phone) VALUES (?, ?, ?)", [location, manager, phone], (err) => {
    if (err) return res.status(500).json({ error: "Insert failed" });
    res.json({ message: "Relay point added" });
  });
});

// Delete relay point
app.delete("/api/admin/relay/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM relay_points WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Relay point deleted" });
  });
});

// ---------------- SERVER START ---------------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));





