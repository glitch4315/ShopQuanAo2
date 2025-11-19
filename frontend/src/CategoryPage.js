import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./CategoryPage.css";

function CategoryPage() {
  const { slug } = useParams(); // Lấy slug từ URL
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/by-category/${slug}`)
      .then(res => res.json())
      .then(data => {
        setCategory(data.category);
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(err => console.error("Lỗi tải sản phẩm theo danh mục:", err))
      .finally(() => setLoading(false));
  }, [slug]);

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

  return (
    <div className="category-page-container">
      <h2>{category?.name || "Danh mục"}</h2>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p._id} className="product-card">
              {/* Link tới chi tiết sản phẩm */}
              <Link to={`/product/${p.slug}`} className="product-link">
                <img
                  src={p.images?.[0]?.url || "https://via.placeholder.com/200"}
                  alt={p.name}
                  className="product-image"
                />
                <h4 className="product-name">{p.name}</h4>
              </Link>
              <p className="product-price">{p.basePrice?.toLocaleString()} ₫</p>
              <button
                className="btn-add-cart"
                onClick={() => addToCart(p)}
              >
                🛒 Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
