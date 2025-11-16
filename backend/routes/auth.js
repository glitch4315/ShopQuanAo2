const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký" });

    const database = await db();
    const exist = await database.collection("users").findOne({ email });
    if (exist) return res.status(400).json({ message: "Email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);
    const result = await database.collection("users").insertOne({
      name,
      email,
      password: hash,
    });

    res.json({ message: "Đăng ký thành công", user: { id: result.insertedId, name, email } });
  } catch (err) {
    console.error("❌ Lỗi register:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });

    const database = await db(); // kiểm tra db() trả db object
    console.log("Database object:", database);

    const user = await database.collection("users").findOne({ email });
    console.log("User found:", user);

    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Mật khẩu không đúng" });

    res.json({ message: "Đăng nhập thành công", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("❌ Lỗi login chi tiết:", err); // 🔹 log chi tiết
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
