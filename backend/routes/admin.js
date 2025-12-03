const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); 
const slugify = require("slugify"); 

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
      url: f.filename,
      sort: idx + 1
    }));

    // Lấy dữ liệu từ req.body
    const {
      name,
      basePrice,
      description,
      categoryId,
      variants, 
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
// Sửa sản phẩm
router.put("/products/:id", upload.array("images"), async (req, res) => {
  try {
    const database = await db();
    const productId = new ObjectId(req.params.id);

    // Lấy dữ liệu gửi lên
    const {
      name,
      basePrice,
      description,
      categoryId,
      variants, // dạng JSON string
      isActive,
      existingImages // mảng URL ảnh cũ muốn giữ
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

    // Xử lý ảnh mới upload
    const newImages = (req.files || []).map((f, idx) => ({
     url: f.filename,
      sort: idx + 1
    }));

    // Kết hợp ảnh cũ và ảnh mới
    let finalImages = [];
    if (existingImages) {
      try {
        const oldImages = JSON.parse(existingImages);
        finalImages = [...oldImages, ...newImages];
      } catch (err) {
        return res.status(400).json({ message: "Existing images không hợp lệ" });
      }
    } else {
      finalImages = newImages;
    }

    // Tạo slug nếu có thay đổi tên
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    // Cập nhật sản phẩm
    const updateData = {
      ...(name && { name, slug }),
      ...(description && { description }),
      ...(basePrice && { basePrice: Number(basePrice) }),
      images: finalImages,
      ...(categoryId && { categoryId: new ObjectId(categoryId) }),
      variants: parsedVariants,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      updatedAt: new Date()
    };

    await database.collection("products").updateOne(
      { _id: productId },
      { $set: updateData }
    );

    const updatedProduct = await database
      .collection("products")
      .findOne({ _id: productId });

    res.json({
      ...updatedProduct,
      _id: updatedProduct._id.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
