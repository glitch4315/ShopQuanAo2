import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);

  // 1️⃣ Fetch tất cả sản phẩm
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error("Lỗi fetch all products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // 2️⃣ Fetch chi tiết sản phẩm theo slug
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${slug}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // 3️⃣ Lọc sản phẩm tương tự dựa vào categoryId và slug
  useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const similar = allProducts.filter(
      (p) =>
        p.categoryId?._id === product.categoryId?._id &&
        p.slug !== product.slug
    );
    setSimilarProducts(similar);
  }, [product, allProducts]);

  // 4️⃣ Carousel ảnh
  useEffect(() => {
    if (!product || !product.images) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  // 5️⃣ Thêm vào giỏ hàng
  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === p._id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...p, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`Đã thêm "${p.name}" vào giỏ hàng!`);
  };

  if (loading) return <p className="center-text">Đang tải...</p>;
  if (!product) return <p className="center-text">Không tìm thấy sản phẩm</p>;

  return (
    <div className="product-page">
      <div className="product-main">
        {/* Carousel ảnh */}
        <div className="product-images">
          <div className="main-image zoom-hover">
            <img src={product.images[selectedImage]?.url} alt={product.name} />
            {product.discount && (
              <span className="badge">-{product.discount}%</span>
            )}
            <button
              className="prev-btn"
              onClick={() =>
                setSelectedImage(
                  selectedImage === 0 ? product.images.length - 1 : selectedImage - 1
                )
              }
            >
              ‹
            </button>
            <button
              className="next-btn"
              onClick={() =>
                setSelectedImage(
                  selectedImage === product.images.length - 1 ? 0 : selectedImage + 1
                )
              }
            >
              ›
            </button>
          </div>
          <div className="thumbnail-list">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt=""
                className={selectedImage === idx ? "thumb selected" : "thumb"}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">
            {product.basePrice.toLocaleString()} ₫{" "}
            {product.discount && (
              <span className="old-price">
                {(product.basePrice * 1.2).toLocaleString()} ₫
              </span>
            )}
          </p>

          {product.variants?.length > 0 && (
            <div className="variants">
              <p className="variant-label">Chọn màu / size:</p>
              <div className="variant-options">
                {product.variants.map((v, idx) => (
                  <span key={idx} className="variant-item">
                    {v.color} / {v.size}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={() => addToCart(product)}>
              🛒 Thêm vào giỏ
            </button>
          </div>

          <div className="product-description">
            <h3>Mô tả sản phẩm:</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Sản phẩm tương tự */}
      {similarProducts.length > 0 && (
        <div className="similar-products">
          <h2>Sản phẩm tương tự</h2>
          <div className="similar-grid">
            {similarProducts.map((p) => (
              <div key={p._id} className="similar-card">
                <Link to={`/product/${p.slug}`}>
                  <img src={p.images?.[0]?.url} alt={p.name} className="similar-img" />
                  <p className="similar-name">{p.name}</p>
                  <p className="similar-price">{p.basePrice.toLocaleString()} ₫</p>
                </Link>
                <button className="btn-add-cart" onClick={() => addToCart(p)}>
                  🛒 Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
