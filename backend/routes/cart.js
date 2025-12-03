const express = require("express");
const router = express.Router();
const db = require("../db");
const { ObjectId } = require("mongodb");

const authMiddleware = require("../middleware/auth"); 


router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id; // lấy user_id từ token
    const database = await db();
    const carts = database.collection("carts");

    const cart = await carts.findOne({ userId });
    res.json(cart || { userId, items: [] });

  } catch (err) {
    console.error("GET cart error:", err);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng" });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product } = req.body;

    if (!product) return res.status(400).json({ message: "Thiếu product" });

    const database = await db();
    const carts = database.collection("carts");

    // Kiểm tra giỏ hàng có chưa
    const cart = await carts.findOne({ userId });

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

    // Nếu đã có giỏ
    const existingItem = cart.items.find(i => i.productId === product._id);

    if (existingItem) {
      await carts.updateOne(
        { userId, "items.productId": product._id },
        { $inc: { "items.$.quantity": 1 }, $set: { updatedAt: new Date() } }
      );
      return res.json({ message: "Tăng số lượng sản phẩm" });
    }

    // Nếu chưa có sản phẩm
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
    console.error("Add cart error:", err);
    res.status(500).json({ message: "Lỗi server khi thêm vào giỏ hàng" });
  }
});

router.post("/increase", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.body;

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

router.post("/decrease", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.body;

    const database = await db();
    const carts = database.collection("carts");

    await carts.updateOne(
      {
        userId,
        items: { $elemMatch: { productId, quantity: { $gt: 1 } } }
      },
      { $inc: { "items.$.quantity": -1 }, $set: { updatedAt: new Date() } }
    );

    res.json({ message: "Đã giảm số lượng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi giảm số lượng" });
  }
});

router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.body;

    const database = await db();
    const carts = database.collection("carts");

    await carts.updateOne(
      { userId },
      { $pull: { items: { productId } }, $set: { updatedAt: new Date() } }
    );

    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
});

module.exports = router;
