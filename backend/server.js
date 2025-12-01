require('dotenv').config();
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/category");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const cartRoutes = require("./routes/cart")
const app = express();
const openaiRoutes = require("./routes/openai");


app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes); 
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/openai", openaiRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
