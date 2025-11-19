const express = require("express");
const router = express.Router();
const db = require("../db"); // Hàm kết nối MongoDB
const { ObjectId } = require("mongodb");

// 🔹 Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
  try {
    const database = await db();
    const products = await database.collection("products").find({}).toArray();

    // Convert _id sang string và đảm bảo images luôn là array
    const productsSafe = products.map(p => ({
      ...p,
      _id: p._id.toString(),
      images: Array.isArray(p.images) ? p.images : [],
    }));

    res.json(productsSafe);
  } catch (err) {
    console.error("❌ Lỗi khi lấy tất cả sản phẩm:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Lấy sản phẩm theo danh mục
router.get("/by-category/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const database = await db();

    // Tìm category theo slug
    const category = await database.collection("categories").findOne({ slug });
    if (!category) return res.status(404).json({ message: "Danh mục không tồn tại" });

    // Lấy sản phẩm theo categoryId
    const products = await database.collection("products")
      .find({ categoryId: category._id })
      .toArray();

    const productsSafe = products.map(p => ({
      ...p,
      _id: p._id.toString(),
      images: Array.isArray(p.images) ? p.images : [],
    }));

    res.json({ category, products: productsSafe });
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm theo danh mục:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const database = await db();

    const product = await database.collection("products").findOne({ slug });

    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // đảm bảo _id là string, images là array
    const productSafe = {
      ...product,
      _id: product._id.toString(),
      images: Array.isArray(product.images) ? product.images : [],
    };

    res.json(productSafe);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
