import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    if (!token) {
      setCart([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(
        data.items?.map(item => ({
          ...item,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1
        })) || []
      );
    } catch (err) {
      console.error("Lỗi load cart:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!token) return;
    try {
      await fetch(`http://localhost:5000/api/cart/${change > 0 ? "increase" : "decrease"}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    if (!token) return;
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    
    try {
      await fetch("http://localhost:5000/api/cart/remove", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price ?? 0) * (item.quantity ?? 1), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500000 ? 0 : 30000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    navigate("/checkout");
  };

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.jpg";
    return image.startsWith("http")
      ? image
      : `http://localhost:5000/uploads/${image}`;
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <button className="continue-shopping-btn" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <p>{cart.length} sản phẩm</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => {
            const subtotal = (item.price ?? 0) * (item.quantity ?? 1);
            return (
              <div key={item.productId} className="cart-item">
                {/* Product Image */}
                <div className="item-image">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                  />
                </div>

                {/* Product Details */}
                <div className="item-details">
                  <a href={`/product/${item.productId}`} className="item-name">
                    {item.name}
                  </a>
                  {item.size && item.color && (
                    <div className="item-meta">
                      <span>Size: {item.size}</span>
                      <span>Màu: {item.color}</span>
                    </div>
                  )}
                </div>

                <div className="item-price">
                  {(item.price ?? 0).toLocaleString()}₫
                </div>

                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.productId, -1)} 
                    disabled={(item.quantity ?? 1) <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity ?? 1}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.productId, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  {subtotal.toLocaleString()}₫
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeItem(item.productId)}
                  title="Xóa sản phẩm"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="summary-row subtotal">
            <span>Tạm tính</span>
            <span className="summary-value">{calculateSubtotal().toLocaleString()}₫</span>
          </div>
          <div className="summary-row shipping">
            <span>Phí vận chuyển</span>
            <span className="summary-value">
              {calculateShipping() === 0 ? "Miễn phí" : `${calculateShipping().toLocaleString()}₫`}
            </span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span className="summary-value">{calculateTotal().toLocaleString()}₫</span>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Thanh toán
          </button>

          <button className="continue-shopping-btn" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </button>

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-badge-icon">🔒</span>
              <span>Thanh toán bảo mật</span>
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">🚚</span>
              <span>Giao hàng nhanh</span>
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">↩️</span>
              <span>Đổi trả 30 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
