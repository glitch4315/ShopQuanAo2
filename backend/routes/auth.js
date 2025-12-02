const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

const JWT_SECRET = "your_secret_key"; 
const authMiddleware = require("../middleware/auth");  

// Hàm lấy user_id tiếp theo
async function getNextUserId(database) {
  const result = await database.collection("counters").findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  if (!result.value) {
    const doc = await database.collection("counters").findOne({ _id: "user_id" });
    return doc.seq;
  }

  return result.value.seq;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    const database = await db();

    const exist = await database.collection("users").findOne({ email });
    if (exist) return res.status(400).json({ message: "Email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);

    // Lấy user_id tiếp theo
    const user_id = await getNextUserId(database);

    const result = await database.collection("users").insertOne({
      user_id,
      name: fullName,
      email,
      password: hash,
      phone,
      address
    });

    // Tạo token JWT
    const token = jwt.sign({ user_id, name: fullName, email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Đăng ký thành công",
      token,
      user: { user_id, name: fullName, email }
    });
  } catch (err) {
    console.error("Lỗi register:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const database = await db();

    const user = await database.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Mật khẩu không đúng" });

    // Tạo token JWT
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { user_id: user.user_id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const database = await db();
    const user = await database.collection("users").findOne(
      { user_id: req.user.user_id },
      { projection: { password: 0 } } 
    );

    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json(user);
  } catch (err) {
    console.error("Lỗi /me:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;