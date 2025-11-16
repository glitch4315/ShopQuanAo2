const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/category");

const app = express();
const productsRoute = require("./routes/products");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
