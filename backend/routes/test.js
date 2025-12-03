const express = require("express");
const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");
const config = require("config");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");
const db = require("../db");

const router = express.Router();

// Hàm sắp xếp các tham số VNPay
function sortObject(obj) {
  let sorted = {};
  let str = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Tạo URL thanh toán VNPay
router.post("/create_payment_url", authMiddleware, async (req, res) => {
  const { amount } = req.body; // Số tiền thanh toán
  if (!amount) {
    return res.status(400).json({ success: false, message: "Thiếu amount" });
  }

  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "127.0.0.1";

  try {
    const database = await db();
    const order = { _id: new ObjectId(), totalAmount: amount };  // Giả sử dữ liệu order

    const totalAmount = Math.floor(order.totalAmount);

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: config.get("vnp_TmnCode"),
      vnp_Amount: totalAmount * 100, // VNPay yêu cầu số tiền nhân với 100
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_CurrCode: "VND",
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${order._id}`,
      vnp_OrderType: "250001",
      vnp_ReturnUrl: config.get("vnp_ReturnUrl"),
      vnp_IpAddr: ipAddr,
      vnp_Locale: "vn",
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const secureHash = crypto.createHmac("sha512", config.get("vnp_HashSecret")).update(signData).digest("hex");

    vnp_Params.vnp_SecureHash = secureHash;
    const paymentUrl = config.get("vnp_Url") + "?" + qs.stringify(vnp_Params, { encode: false });

    res.json({ success: true, paymentUrl });

  } catch (err) {
    console.error("Lỗi tạo URL thanh toán:", err);
    res.status(500).json({ success: false, message: "Không thể tạo URL thanh toán" });
  }
});

module.exports = router;
