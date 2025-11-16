import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategorySection from "./CategorySection";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Product API:", data);
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => console.error("Lỗi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = existingCart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      fetch("http://localhost:5000/api/products")
        .then((res) => res.json())
        .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
        .catch((err) => console.error(err));
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
    }
  };

  return (
    <div className="home-container">
      <div className="cart-header">
        <Link to="/cart" className="btn-cart-header">
          🛒 Xem giỏ hàng
        </Link>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      <div className="content-layout">
        {/* 🔹 Cột trái: Danh mục sản phẩm */}
        <aside className="category-sidebar">
          <CategorySection />
        </aside>

        {/* 🔹 Cột phải: Sản phẩm nổi bật */}
        <main className="product-main">
          <h2 className="home-title">Sản phẩm nổi bật</h2>

          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : products.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <Link to={`/product/${product._id}`}>
                    <h4 className="product-name">{product.name}</h4>
                  </Link>
                  <p className="product-price">
                    {product.basePrice?.toLocaleString()} ₫
                  </p>
                  <button
                    className="btn-add-cart"
                    onClick={() => addToCart(product)}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
