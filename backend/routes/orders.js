// routes/orders.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");
const db = require("../db");

// LẤY GIỎ HÀNG
router.get("/cart", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const database = await db();
    const cart = await database.collection("carts").findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.json({ success: true, items: [], totalAmount: 0 });
    }

    const totalAmount = Math.floor(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    res.json({ success: true, items: cart.items, totalAmount });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// THÊM VÀO GIỎ HÀNG
router.post("/cart/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId, name, price, image, quantity = 1 } = req.body;
    const database = await db();

    let cart = await database.collection("carts").findOne({ userId });
    if (!cart) {
      const result = await database.collection("carts").insertOne({ userId, items: [], createdAt: new Date() });
      cart = { _id: result.insertedId, userId, items: [] };
    }

    const idx = cart.items.findIndex(i => i.productId?.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({
        productId: new ObjectId(productId),
        name,
        price: Number(price),
        image: image || "",
        quantity
      });
    }

    await database.collection("carts").updateOne(
      { userId },
      { $set: { items: cart.items, updatedAt: new Date() } },
      { upsert: true }
    );

    const totalAmount = Math.floor(cart.items.reduce((s, i) => s + i.price * i.quantity, 0));

    res.json({ success: true, items: cart.items, totalAmount });
  } catch (err) {
    console.error("ADD CART ERROR:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// XÓA KHỎI GIỎ
router.delete("/cart/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = req.params.productId;
    const database = await db();

    await database.collection("carts").updateOne(
      { userId },
      { $pull: { items: { productId: new ObjectId(productId) } } }
    );

    const cart = await database.collection("carts").findOne({ userId });
    const totalAmount = cart ? Math.floor(cart.items.reduce((s, i) => s + i.price * i.quantity, 0)) : 0;

    res.json({ success: true, items: cart?.items || [], totalAmount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// CHECKOUT → TẠO ĐƠN HÀNG ĐẦY ĐỦ THÔNG TIN GIAO HÀNG
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    console.log("CHECKOUT ĐƯỢC GỌI:", req.body);
    const userId = req.user.user_id;

    const { fullName, phone, address, note = "" } = req.body;

    if (!fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ!"
      });
    }

    const database = await db();
    const cart = await database.collection("carts").findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
    }

    const totalAmount = Math.floor(
      cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    const newOrder = {
      userId: new ObjectId(userId),
      customerInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim()
      },
      items: cart.items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image || ""
      })),
      totalAmount,
      status: "pending",
      paymentMethod: "vnpay",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("ĐANG LƯU ĐƠN HÀNG VÀO DB:", newOrder);
    const result = await database.collection("orders").insertOne(newOrder);
    const orderId = result.insertedId.toString();

    console.log("TẠO ĐƠN HÀNG THÀNH CÔNG – ID:", orderId);

    res.json({
      success: true,
      orderId,
      totalAmount,
      message: "Tạo đơn hàng thành công!"
    });

  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo đơn" });
  }
});

module.exports = router;