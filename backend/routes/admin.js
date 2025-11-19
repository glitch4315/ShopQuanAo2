const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // lưu tạm file ảnh

// ===== USERS =====

// Lấy tất cả user
router.get("/users", async (req, res) => {
  try {
    const database = await db();
    const users = await database.collection("users").find({}).toArray();
    res.json(users.map(u => ({ ...u, _id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa user theo id
router.delete("/users/:id", async (req, res) => {
  try {
    const database = await db();
    await database.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Xóa user thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== PRODUCTS =====

// Lấy tất cả sản phẩm
router.get("/products", async (req, res) => {
  try {
    const database = await db();
    const products = await database.collection("products").find({}).toArray();
    const productsSafe = products.map(p => ({
      ...p,
      _id: p._id.toString(),
      images: Array.isArray(p.images) ? p.images : []
    }));
    res.json(productsSafe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm sản phẩm
router.post("/products", upload.array("images"), async (req, res) => {
  try {
    const database = await db();
    const imgs = req.files.map(f => ({ url: `/uploads/${f.filename}` }));
    const product = {
      name: req.body.name,
      basePrice: Number(req.body.basePrice),
      images: imgs,
      createdAt: new Date()
    };
    const result = await database.collection("products").insertOne(product);
    res.json({ ...product, _id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa sản phẩm
router.delete("/products/:id", async (req, res) => {
  try {
    const database = await db();
    await database.collection("products").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
