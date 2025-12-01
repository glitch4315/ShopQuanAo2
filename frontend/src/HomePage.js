import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatBoxAI from "./components/ChatBoxAI";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const categories = [
    { name: "Tất cả sản phẩm", slug: "all" },
    { name: "Áo thun", slug: "ao-thun" },
    { name: "Áo khoác", slug: "ao-khoac" },
    { name: "Áo polo", slug: "ao-polo" },
    { name: "Quần", slug: "quan" },
    { name: "Phụ kiện", slug: "phu-kien" },
    { name: "Giày", slug: "giay" }
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (image) => {
    if (!image?.url) return "/placeholder.jpg";

    return image.url.startsWith("http")
      ? image.url
      : `http://localhost:5000${image.url}`;
  };

  return (
    <div className="homepage">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>CLOTHES SHOP</h1>
          <p>Thời trang hiện đại - Phong cách riêng bạn</p>
          <Link to="/products" className="cta-button">
            Khám phá ngay
          </Link>
        </div>
      </section>
      <div>
  <ChatBoxAI />
</div>

      {/* Categories */}
      <nav className="categories-nav">
        <div className="container">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={cat.slug === "all" ? "/products" : `/category/${cat.slug}`}
              className="category-link"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Sản phẩm nổi bật</h2>
            <Link to="/products" className="view-all">
              Xem tất cả →
            </Link>
          </div>
        <ChatBoxAI /> 
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.slice(0, 8).map(product => (
                <div
                  key={product._id}
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link to={`/product/${product.slug}`} className="product-link">
                    <div className="product-image-wrapper">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="product-image"
                      />

                      {product.images?.[1] && hoveredProduct === product._id && (
                        <img
                          src={getImageUrl(product.images[1])}
                          alt={product.name}
                          className="product-image-hover"
                        />
                      )}

                      {product.salePrice && (
                        <span className="sale-badge">SALE</span>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>

                      {/* 🔥 MÔ TẢ AI */}
                      <p className="product-desc">
                        {product.description?.slice(0, 70) || "Không có mô tả"}...
                      </p>

                      <div className="product-price">
                        {product.salePrice ? (
                          <>
                            <span className="price-sale">
                              {product.salePrice.toLocaleString()}₫
                            </span>
                            <span className="price-original">
                              {product.basePrice.toLocaleString()}₫
                            </span>
                          </>
                        ) : (
                          <span className="price-regular">
                            {product.basePrice.toLocaleString()}₫
                          </span>
                        )}
                      </div>

                      {hoveredProduct === product._id && (
                        <button className="quick-view-btn">Xem nhanh</button>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
