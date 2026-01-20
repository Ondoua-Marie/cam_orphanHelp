const jwt = require("jsonwebtoken");
const multer = require("multer");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error(" JWT_SECRET is missing in .env");
  process.exit(1);
}


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
  if (err) return console.log(" MySQL Error:", err.message);
  console.log(" MySQL Connected");
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



// ================= JWT VERIFY MIDDLEWARE =================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = decoded; // { email, name, role }
    next();
  });
}


// ---------------- POST ROUTES ---------------- //

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!passwordRule.test(password))
    return res.send("Password must have 8+ characters, letters and numbers");

  if (admins.includes(email)) return res.send("Cannot register as admin here");

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send({ message: "Database error" });
    if (result.length > 0) return res.send("Email already exists");

    const hash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hash],
      () => res.send("Account created successfully")
    );
  });
});

// Login
// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send({ message: "Database error" });
    if (result.length === 0) return res.send({ message: "Account not found" });

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.send({ message: "Incorrect password" });

    //  CREATE JWT
    const token = jwt.sign(
      {
        email: result[0].email,
        name: result[0].name,
        role: admins.includes(email) ? "admin" : "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    if (admins.includes(email)) {
      return res.json({
        message: "Admin login successful",
        redirect: "/AdminD.html",
        adminName: result[0].name,
        token
      });
    }

    res.json({
      message: "Login successful",
      redirect: "/UserD.html",
      userName: result[0].name,
      token
    });
  });
});


// ---------------- GET ROUTES ---------------- //
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public", "signup.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/donation", (req, res) => res.sendFile(path.join(__dirname, "public", "donationF.html")));
app.get("/", (req, res) => res.redirect("/signup"));

// ---------- NEW ROUTE: My Donations Page ----------
app.get("/my-donations", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mydonations.html"));
});

// --------- IMAGE UPLOAD CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ---------------- DONATION ROUTE ---------------- //
app.post("/donate", verifyToken, upload.single("image"), (req, res) => {

  const {
    donorName,
    phone,
    orphanage,
    relayPoint,
    donationType,
    description,
    address,
    donationDate,
    donationStatus,
    paymentMethod,
    amount
  } = req.body;

  const userEmail = req.user.email; // from JWT



  if (!orphanage) return res.send("You must select an orphanage");

  db.query("SELECT * FROM users WHERE email = ?", [userEmail], (err, result) => {
    if (err) return res.send("Database error");
    if (result.length === 0) return res.send("You must be logged in to donate");

    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    const sql = `
      INSERT INTO donations
      (donorName, phone, orphanage, relayPoint, donationType, paymentMethod, amount, imagePath, description, address, donationDate, donationStatus, userEmail, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(sql, [
      donorName,
      phone,
      orphanage,
      relayPoint || null,
      donationType,
      donationType === "money" ? paymentMethod : null,
      donationType === "money" ? amount : null,
      donationType === "items" ? imagePath : null,
      donationType === "items" ? description : null,
      donationType === "items" ? address : null,
      donationDate || new Date(),
      donationStatus || "pending",
      userEmail // <-- save logged-in user's email
    ], (err) => {
      if (err) {
        console.error(err);
        return res.send("Donation failed: " + err.message);
      }
      res.send("Donation submitted successfully");
    });
  });
});

// ---------------- MY DONATIONS ROUTE ---------------- //
app.get("/api/my-donations/:email", (req, res) => {
  const { email } = req.params;

  db.query(
    "SELECT * FROM donations WHERE userEmail = ? ORDER BY donationDate DESC",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
});

// ---------------- ADMIN API ---------------- //
// Get all donations
app.get("/api/donations", (req, res) => {
  db.query("SELECT * FROM donations ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Update donation status
app.put("/api/donations/:id", (req, res) => {
  const { id } = req.params;
  const newStatus = req.body.donationStatus.toLowerCase();

  if (!["received","collected"].includes(newStatus)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query(
    "UPDATE donations SET donationStatus = ? WHERE id = ?",
    [newStatus, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Donation status updated" });
    }
  );
});

// Delete donation
app.delete("/api/donations/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM donations WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Donation deleted" });
  });
});

// Get all users (donors), excluding admins
app.get("/api/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const usersOnly = results.filter(u => !admins.includes(u.email));
    res.json(usersOnly);
  });
});

// Get all relay points
app.get("/api/relay-points", (req, res) => {
  db.query("SELECT * FROM relay_points ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Add new relay point
app.post("/api/admin/relay", (req, res) => {
  const { location, manager, phone } = req.body;
  if (!location) return res.status(400).json({ error: "Location is required" });

  db.query(
    "INSERT INTO relay_points (location, manager, phone) VALUES (?, ?, ?)",
    [location, manager || null, phone || null],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Relay point added" });
    }
  );
});

// Delete relay point
app.delete("/api/admin/relay/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM relay_points WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Relay point deleted" });
  });
});



// ================= PROFILE AVATAR UPLOAD =================
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/upload-proof")); // save in public/upload-proof
  },
  filename: function (req, file, cb) {
    // Save file as userEmail + extension
    const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  }
});

const avatarUpload = multer({ storage: avatarStorage });

app.post("/api/upload-avatar", avatarUpload.single("avatar"), (req, res) => {
  if(!req.file) return res.status(400).json({ error: "No file uploaded" });
  const filePath = "/upload-proof/" + req.file.filename; // path to serve in frontend
  
  // Here you can save filePath in your database under user's profile if you want
  // Example: UPDATE users SET avatar = filePath WHERE email = req.body.email

  res.json({ avatarPath: filePath });
});

// ---------------- SERVER START ---------------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(" Server running on port " + PORT));










