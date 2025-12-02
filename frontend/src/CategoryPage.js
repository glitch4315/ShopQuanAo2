import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./CategoryPage.css";

function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  const getImageUrl = (image) => {
    if (!image?.url) return "/placeholder.jpg";
    return image.url.startsWith("http")
      ? image.url
      : `http://localhost:5000/uploads/${image.url}`;
  };

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/by-category/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCategory(data.category);
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((err) =>
        console.error("Lỗi tải sản phẩm theo danh mục:", err)
      )
      .finally(() => setLoading(false));
  }, [slug]);

  // Sắp xếp sản phẩm
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.basePrice || 0) - (b.basePrice || 0);
      case 'price-desc':
        return (b.basePrice || 0) - (a.basePrice || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  //Thêm vào giỏ hàng
  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      });

      if (res.ok) {
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      } else {
        alert("Không thể thêm vào giỏ hàng");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  // Thêm vào yêu thích
  const addToWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = wishlist.find(item => item._id === product._id);
    
    if (!exists) {
      wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert(`Đã thêm "${product.name}" vào yêu thích!`);
    } else {
      alert("Sản phẩm đã có trong danh sách yêu thích");
    }
  };

  return (
    <div className="category-page-container">
      {/* Page Header */}
      <div className="category-header">
        <div className="category-header-content">
          <h2>{category?.name || "Danh mục"}</h2>
          {category?.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!loading && products.length > 0 && (
        <div className="category-toolbar">
          <div className="product-count">
            Hiển thị {products.length} sản phẩm
          </div>
          <div className="sort-filter">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name-asc">Tên: A-Z</option>
              <option value="name-desc">Tên: Z-A</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        // Empty State
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>Không có sản phẩm</h3>
          <p>Danh mục này hiện chưa có sản phẩm nào</p>
          <Link to="/" className="back-home-btn">
            Về trang chủ
          </Link>
        </div>
      ) : (
        // Product Grid
        <div className="product-grid">
          {sortedProducts.map((p) => (
            <div key={p._id} className="product-card">
              {/* Quick Actions */}
              <div className="quick-actions">
                <button 
                  className="quick-action-btn"
                  onClick={(e) => addToWishlist(p, e)}
                  title="Thêm vào yêu thích"
                >
                  ♡
                </button>
                <button 
                  className="quick-action-btn"
                  title="Xem nhanh"
                >
                  👁
                </button>
              </div>

              {/* Badges */}
              {p.isNew && <div className="new-badge">MỚI</div>}
              {p.salePrice && (
                <div className="sale-badge">
                  -{Math.round((1 - p.salePrice / p.basePrice) * 100)}%
                </div>
              )}

              {/* Link tới chi tiết sản phẩm */}
              <Link to={`/product/${p.slug}`} className="product-link">
                <div className="product-image-wrapper">
                  <img
                    src={getImageUrl(p.images?.[0])}
                    alt={p.name}
                    className="product-image"
                  />
                </div>

                <div className="product-info">
                  <h4 className="product-name">{p.name}</h4>

                  {/* Rating (nếu có) */}
                  {p.rating && (
                    <div className="product-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(p.rating))}
                        {'☆'.repeat(5 - Math.floor(p.rating))}
                      </span>
                      <span className="rating-count">
                        ({p.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="product-price-wrapper">
                    <span className={`product-price ${p.salePrice ? 'sale' : ''}`}>
                      {(p.salePrice || p.basePrice)?.toLocaleString()}₫
                    </span>
                    {p.salePrice && (
                      <span className="product-price-original">
                        {p.basePrice?.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Add to Cart Button */}
              <button
                className="btn-add-cart"
                onClick={(e) => addToCart(p, e)}
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (nếu cần) */}
      {!loading && products.length > 0 && (
        <div className="pagination">
          <button disabled>‹ Trước</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>Sau ›</button>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;