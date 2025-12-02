const authMiddleware = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const db = require("../db");
const moment = require("moment");
const qs = require("qs");
const crypto = require("crypto");
const config = require("config");
const { ObjectId } = require("mongodb");

// Hàm sort chuẩn VNPAY
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(k => (sorted[k] = obj[k]));
  return sorted;
}

router.post("/create_payment_url", authMiddleware, async (req, res) => {
  try {
    process.env.TZ = "Asia/Ho_Chi_Minh";

    const database = await db();
    const userId = req.user.user_id;

    const cart = await database.collection("carts").findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Tạo đơn hàng
    const order = {
      userId,
      items: cart.items,
      totalAmount: total,
      status: 0,
      createdAt: new Date()
    };

    const inserted = await database.collection("orders").insertOne(order);
    const orderId = inserted.insertedId.toString();

    // Lấy thông tin cấu hình
    const tmnCode = config.get("vnp_TmnCode");
    const secretKey = config.get("vnp_HashSecret");
    const vnpUrl = config.get("vnp_Url");
    const returnUrl = config.get("vnp_ReturnUrl");

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";


    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Amount: total * 100,
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
      vnp_OrderType: "250000", 
      vnp_Locale: "vn",
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_ExpireDate: moment().add(15, "minutes").format("YYYYMMDDHHmmss")
    };

    vnp_Params = sortObject(vnp_Params);

   
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const secureHash = hmac.update(signData).digest("hex");

    vnp_Params["vnp_SecureHash"] = secureHash;

    const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl });

  } catch (err) {
    console.error("VNPAY ERROR:", err);
    res.status(500).json({ message: "Lỗi tạo URL thanh toán" });
  }
});

//RETURN URL
router.get("/vnpay_return", async (req, res) => {
  let vnp_Params = { ...req.query };
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  const secretKey = config.get("vnp_HashSecret");
  const signData = qs.stringify(vnp_Params, { encode: false });
  const validHash = crypto.createHmac("sha512", secretKey)
    .update(signData)
    .digest("hex");

  const database = await db();
  const orderId = vnp_Params["vnp_TxnRef"];

  // Xác minh chữ ký
  if (secureHash === validHash && vnp_Params["vnp_ResponseCode"] === "00") {
    await database.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: 1 } }
    );

    const order = await database.collection("orders")
      .findOne({ _id: new ObjectId(orderId) });

    await database.collection("carts").deleteOne({ userId: order.userId });
  }

  res.redirect(
    "http://localhost:3000/vnpay_return?" +
      qs.stringify(req.query, { encode: false })
  );
});

module.exports = router;
