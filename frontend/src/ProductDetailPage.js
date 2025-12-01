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

  // Fetch tất cả sản phẩm
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

  // Fetch chi tiết sản phẩm theo slug
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

useEffect(() => {
    if (!product || allProducts.length === 0) return;
    const similar = allProducts.filter(
      (p) => p.categoryId?._id === product.categoryId?._id && p.slug !== product.slug
    );
    setSimilarProducts(similar);
  }, [product, allProducts]);

  useEffect(() => {
    if (!product || !product.images) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  const addToCart = async (p) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập trước khi thêm vào giỏ hàng");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product: { ...p, basePrice: p.basePrice ?? 0 } })
      });

      const data = await response.json();
      alert(data.message || `Đã thêm "${p.name}" vào giỏ hàng!`);
    } catch (err) {
      console.error("Lỗi add to cart:", err);
      alert("Không thể thêm vào giỏ hàng");
    }
  };

  if (loading) return <p className="center-text">Đang tải...</p>;
  if (!product) return <p className="center-text">Không tìm thấy sản phẩm</p>;

  return (
    <div className="product-page">
      <div className="product-main">
        <div className="product-images">
          <div className="main-image zoom-hover">
            <img src={product.images[selectedImage]?.url} alt={product.name} />
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

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{product.basePrice.toLocaleString()} ₫</p>

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
