const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

// GET user theo id
router.get("/:id", async (req, res) => {
  try {
    const database = await db();
    const user = await database.collection("users").findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PATCH cập nhật hồ sơ
router.patch("/:id", async (req, res) => {
  try {
    const database = await db();
    const updateData = { ...req.body };

    // Nếu có đổi mật khẩu
    if (updateData.newPassword) {
      const hash = await bcrypt.hash(updateData.newPassword, 10);
      updateData.password = hash;
      delete updateData.newPassword;
    }

    const result = await database.collection("users").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    res.json({ success: true, updatedUser: result.value });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});



module.exports = router;