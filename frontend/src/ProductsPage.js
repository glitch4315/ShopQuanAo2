import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!products.length) return <p>Chưa có sản phẩm nào</p>;

  return (
    <div className="products-page">
      <h2>Tất cả sản phẩm</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <Link to={`/product/${product.slug}`}>
              <img 
                src={product.images?.[0]?.url ? `http://localhost:5000/uploads/${product.images[0].url}` : "https://via.placeholder.com/300x400"} 
                alt={product.name} 
              />
              <h3>{product.name}</h3>
              <p>{product.basePrice.toLocaleString()}₫</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
