import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCart(data.items?.map(item => ({
        ...item,
        price: item.price ?? 0,
        quantity: item.quantity ?? 1
      })) || []);
    } catch (err) {
      console.error("Lỗi load cart:", err);
      setCart([]);
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price ?? 0) * (item.quantity ?? 1), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h2>Giỏ hàng của bạn</h2>
        <p>Giỏ hàng trống</p>
        <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
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
            const subtotal = (item.price ?? 0) * (item.quantity ?? 1);
            return (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>{(item.price ?? 0).toLocaleString()}₫</td>
                <td>
                  <button onClick={() => updateQuantity(item.productId, -1)} disabled={(item.quantity ?? 1) <= 1}>−</button>
                  {(item.quantity ?? 1)}
                  <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                </td>
                <td>{subtotal.toLocaleString()}₫</td>
                <td><button onClick={() => removeItem(item.productId)}>Xóa</button></td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">Tổng cộng</td>
            <td>{calculateTotal().toLocaleString()}₫</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <button onClick={handleCheckout}>Thanh toán</button>
    </div>
  );
}

export default CartPage;
