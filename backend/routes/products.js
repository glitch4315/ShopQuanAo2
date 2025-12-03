const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
  try {
    const database = await db();
    const products = await database.collection("products").find({}).toArray();

    const productsSafe = products.map(p => ({
      ...p,
      _id: p._id.toString(),
      images: Array.isArray(p.images) ? p.images : [],
    }));

    res.json(productsSafe);
  } catch (err) {
    console.error("Lỗi lấy tất cả sản phẩm:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/by-category/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const database = await db();


    const category = await database.collection("categories").findOne({ slug });
    if (!category) return res.status(404).json({ message: "Danh mục không tồn tại" });

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
    console.error("Lỗi lấy sản phẩm theo danh mục:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const database = await db();

    const product = await database.collection("products").findOne({ slug });

    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const productSafe = {
      ...product,
      _id: product._id.toString(),
      images: Array.isArray(product.images) ? product.images : [],
    };

    res.json(productSafe);
  } catch (err) {
    console.error("Lỗi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
