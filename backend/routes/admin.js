const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // lưu tạm file ảnh
const slugify = require("slugify"); // ⚠️ thêm import slugify

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

    // Xử lý ảnh
    const imgs = (req.files || []).map((f, idx) => ({
      url: `/uploads/${f.filename}`,
      sort: idx + 1
    }));

    // Lấy dữ liệu từ req.body
    const {
      name,
      basePrice,
      description,
      categoryId,
      variants, // dạng JSON string nếu gửi từ form-data
      isActive
    } = req.body;

    // Parse variants nếu có
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (err) {
        return res.status(400).json({ message: "Variants không hợp lệ" });
      }
    }

    // Tạo slug từ tên
    const slug = slugify(name || "", { lower: true, strict: true });

    const now = new Date();

    const product = {
      name,
      slug,
      description: description || "",
      basePrice: Number(basePrice) || 0,
      images: imgs,
      categoryId: categoryId ? new ObjectId(categoryId) : null,
      variants: parsedVariants,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: now,
      updatedAt: now
    };

    const result = await database.collection("products").insertOne(product);

    res.json({ ...product, _id: result.insertedId.toString() });
  } catch (err) {
    console.error(err);
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
