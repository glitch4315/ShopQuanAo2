import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map(item => {
      if (item._id === productId) {
        const newQuantity = item.quantity + change;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.salePrice || item.basePrice;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    // Navigate to checkout page
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>Giỏ hàng của bạn</h2>
        <div className="empty-message">
          <p>Giỏ hàng trống</p>
          <button className="continue-shopping-btn" onClick={handleContinueShopping}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Giỏ hàng của bạn</h2>
      
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Đơn giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {cart.map(item => {
            const price = item.salePrice || item.basePrice;
            const subtotal = price * item.quantity;
            
            return (
              <tr key={item._id}>
                <td className="product-cell">
                  <img 
                    src={item.images?.[0]?.url || "https://via.placeholder.com/80"} 
                    alt={item.name}
                    width="80"
                    height="80"
                  />
                  <span className="product-name">{item.name}</span>
                </td>
                <td className="price-cell">
                  {price.toLocaleString()}₫
                </td>
                <td className="quantity-cell">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item._id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td className="subtotal-cell">
                  {subtotal.toLocaleString()}₫
                </td>
                <td>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="3">Tổng cộng</td>
            <td className="total-price">{calculateTotal().toLocaleString()}₫</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="cart-actions">
        <button className="continue-shopping-btn" onClick={handleContinueShopping}>
          Tiếp tục mua sắm
        </button>
        <button className="checkout-btn" onClick={handleCheckout}>
          Thanh toán
        </button>
      </div>
    </div>
  );
}

export default CartPage;