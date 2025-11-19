// routes.js
const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.get("/cart/:userId", async (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.userId;

    const order = await db.collection("orders").findOne({
      userId: new ObjectId(userId),
      status: "cart",
    });

    if (!order) return res.json({ items: [] });
    res.json({ items: order.items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thêm sản phẩm vào giỏ
router.post("/cart/:userId/add", async (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.userId;
    const { productId, quantity = 1 } = req.body;

    let order = await db.collection("orders").findOne({
      userId: new ObjectId(userId),
      status: "cart",
    });

    if (!order) {
      // tạo mới giỏ hàng
      order = {
        userId: new ObjectId(userId),
        status: "cart",
        items: [],
        createdAt: new Date(),
      };
      await db.collection("orders").insertOne(order);
      order = await db.collection("orders").findOne({
        userId: new ObjectId(userId),
        status: "cart",
      });
    }

    const index = order.items.findIndex(i => i.productId.toString() === productId);
    if (index >= 0) {
      order.items[index].quantity += quantity;
    } else {
      order.items.push({ productId: new ObjectId(productId), quantity });
    }

    await db.collection("orders").updateOne(
      { _id: order._id },
      { $set: { items: order.items } }
    );

    res.json({ items: order.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa 1 sản phẩm khỏi giỏ
router.post("/cart/:userId/remove", async (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.userId;
    const { productId } = req.body;

    const order = await db.collection("orders").findOne({
      userId: new ObjectId(userId),
      status: "cart",
    });

    if (!order) return res.json({ items: [] });

    order.items = order.items.filter(i => i.productId.toString() !== productId);
    await db.collection("orders").updateOne(
      { _id: order._id },
      { $set: { items: order.items } }
    );

    res.json({ items: order.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thanh toán giỏ hàng
router.post("/checkout/:userId", async (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.userId;
    const { address } = req.body;

    const order = await db.collection("orders").findOne({
      userId: new ObjectId(userId),
      status: "cart",
    });

    if (!order || order.items.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống" });

    await db.collection("orders").updateOne(
      { _id: order._id },
      {
        $set: {
          status: "paid",
          address,
          paidAt: new Date(),
        },
      }
    );

    res.json({ message: "Thanh toán thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;