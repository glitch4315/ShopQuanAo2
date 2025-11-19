import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

      {/* Categories Navigation */}
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

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Sản phẩm nổi bật</h2>
            <Link to="/products" className="view-all">
              Xem tất cả →
            </Link>
          </div>

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
                        src={product.images?.[0]?.url || "https://via.placeholder.com/300x400"}
                        alt={product.name}
                        className="product-image"
                      />
                      {product.images?.[1] && hoveredProduct === product._id && (
                        <img
                          src={product.images[1].url}
                          alt={product.name}
                          className="product-image-hover"
                        />
                      )}
                      
                      {/* Sale Badge */}
                      {product.salePrice && (
                        <span className="sale-badge">SALE</span>
                      )}
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
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

                      {/* Quick view button on hover */}
                      {hoveredProduct === product._id && (
                        <button className="quick-view-btn">
                          Xem nhanh
                        </button>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Miễn phí vận chuyển</h3>
              <p>Đơn hàng từ 500.000₫</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">↩️</div>
              <h3>Đổi trả dễ dàng</h3>
              <p>Trong vòng 7 ngày</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Thanh toán an toàn</h3>
              <p>Nhiều hình thức thanh toán</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Ưu đãi hấp dẫn</h3>
              <p>Khuyến mãi thường xuyên</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Đăng ký nhận tin</h2>
            <p>Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                required
              />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;