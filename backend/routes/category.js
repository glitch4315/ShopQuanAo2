const express = require("express");
const db = require("../db");
const router = express.Router();

// Lấy danh mục
router.get("/category", async (req, res) => {
  try {
    const database = await db(); 
    const categories = await database.collection("categories").find({}).toArray();
    res.json(categories);
  } catch (err) {
    console.error("Lỗi khi lấy categories:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
});

module.exports = router;
