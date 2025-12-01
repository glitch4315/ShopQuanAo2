const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Chưa cung cấp token" });

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

    const secret = process.env.JWT_SECRET || "your_secret_key";
    const decoded = jwt.verify(token, secret);

    req.user = decoded; // lưu thông tin user từ token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

module.exports = authMiddleware;
