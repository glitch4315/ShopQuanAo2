import React, { useEffect, useState } from "react";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart.map((item) =>
      item._id === id ? { ...item, quantity: Math.max(item.quantity + delta, 1) } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.basePrice || 0) * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <h2>🛒 Giỏ hàng</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">Giỏ hàng trống.</p>
      ) : (
        <div className="cart-content">
          {/* Bên trái: danh sách sản phẩm */}
          <div className="cart-list-left">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <img
                  src={item.images?.[0]?.url || "/no-image.png"}
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-price">{item.basePrice?.toLocaleString()} ₫</p>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                  <button className="btn-remove" onClick={() => removeItem(item._id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Bên phải: tổng tiền + nút thanh toán */}
          <div className="cart-summary-right">
            <h3>Tổng cộng</h3>
            <p className="total-amount">{total.toLocaleString()} ₫</p>
            <button className="btn-checkout">Thanh toán</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
