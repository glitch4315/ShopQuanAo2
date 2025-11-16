import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${slug}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error("Lỗi tải chi tiết sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = existingCart.find(item => item._id === product._id);

    if (existingItem) existingItem.quantity += 1;
    else existingCart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!product || product.message) return <p>Không tìm thấy sản phẩm</p>;

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Giá: {product.basePrice?.toLocaleString()} ₫</p>

      {/* Hiển thị hình ảnh */}
      <div className="product-images">
        {product.images.map((img, idx) => (
          <img key={idx} src={img.url} alt={product.name} style={{ maxWidth: "200px", marginRight: "10px" }} />
        ))}
      </div>

      {/* Các biến thể (variants) */}
      {product.variants?.length > 0 && (
        <div>
          <h4>Biến thể:</h4>
          <ul>
            {product.variants.map((v) => (
              <li key={v._id}>{v.color} - {v.size} - {v.price.toLocaleString()} ₫</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => addToCart(product)}>🛒 Thêm vào giỏ</button>
    </div>
  );
}

export default ProductDetailPage;
