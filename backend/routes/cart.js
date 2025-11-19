const express = require("express");
const router = express.Router();
const db = require("../db"); // file kết nối MongoDB
const { ObjectId } = require("mongodb");

/* ============================================
   ✅ Lấy giỏ hàng theo userId
============================================ */
router.get("/:userId", async (req, res) => {
  try {
    const database = await db();
    const carts = database.collection("carts");

    const cart = await carts.findOne({ userId: req.params.userId });

    res.json(cart || { userId: req.params.userId, items: [] });
    console.log("👉 Cart từ DB:", cart);

  } catch (err) {
    console.error("❌ GET cart error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
});

/* ============================================
   ✅ Thêm sản phẩm vào giỏ hàng
============================================ */
router.post("/add", async (req, res) => {
  try {
    const { userId, product } = req.body;

    if (!userId || !product)
      return res.status(400).json({ message: "Thiếu userId hoặc product" });

    const database = await db();
    const carts = database.collection("carts");
    console.log("🛒 Sau khi thêm:", updatedCart);


    // Kiểm tra giỏ hàng có chưa
    const cart = await carts.findOne({ userId });

    // Nếu chưa có giỏ → tạo mới
    if (!cart) {
      await carts.insertOne({
        userId,
        items: [
          {
            productId: product._id,
            name: product.name,
            price: product.basePrice,
            image: product.images?.[0]?.url || "",
            quantity: 1
          }
        ],
        updatedAt: new Date()
      });

      return res.json({ message: "Đã tạo giỏ hàng và thêm sản phẩm" });
    }

    // Nếu đã có giỏ → kiểm tra sản phẩm tồn tại chưa
    const existingItem = cart.items.find(
      (i) => i.productId === product._id
    );

    if (existingItem) {
      // tăng số lượng
      await carts.updateOne(
        { userId, "items.productId": product._id },
        { $inc: { "items.$.quantity": 1 }, $set: { updatedAt: new Date() } }
      );

      return res.json({ message: "Tăng số lượng sản phẩm" });
    }

    // Nếu chưa có sản phẩm → thêm vào array
    await carts.updateOne(
      { userId },
      {
        $push: {
          items: {
            productId: product._id,
            name: product.name,
            price: product.basePrice,
            image: product.images?.[0]?.url || "",
            quantity: 1
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ message: "Đã thêm sản phẩm vào giỏ" });
  } catch (err) {
    console.error("❌ Add cart error:", err);
    res.status(500).json({ message: "Lỗi server khi thêm vào giỏ hàng" });
  }
});

/* ============================================
   ✅ Tăng số lượng
============================================ */
router.post("/increase", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const database = await db();
    const carts = database.collection("carts");

    await carts.updateOne(
      { userId, "items.productId": productId },
      { $inc: { "items.$.quantity": 1 }, $set: { updatedAt: new Date() } }
    );

    res.json({ message: "Đã tăng số lượng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tăng số lượng" });
  }
});

/* ============================================
   ✅ Giảm số lượng (tối thiểu là 1)
============================================ */
router.post("/decrease", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const database = await db();
    const carts = database.collection("carts");

    // Giảm nhưng không cho xuống 0
    await carts.updateOne(
      {
        userId,
        items: {
          $elemMatch: { productId, quantity: { $gt: 1 } }
        }
      },
      { $inc: { "items.$.quantity": -1 }, $set: { updatedAt: new Date() } }
    );

    res.json({ message: "Đã giảm số lượng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi giảm số lượng" });
  }
});

/* ============================================
   ✅ Xóa 1 sản phẩm khỏi giỏ
============================================ */
router.post("/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const database = await db();
    const carts = database.collection("carts");

    await carts.updateOne(
      { userId },
      {
        $pull: { items: { productId } },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
});

module.exports = router;

