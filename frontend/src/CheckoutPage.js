// CheckoutPage.js
import React, { useEffect, useState } from "react";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = () => {
    const requiredFields = ["name", "email", "phone", "addressLine1", "city", "district"];
    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`Vui lòng nhập ${field}`);
        return;
      }
    }

    const total = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
    alert(`Thanh toán thành công!\nTổng: ${total.toLocaleString()} ₫\nPhương thức: ${paymentMethod}`);
    setCart([]);
    localStorage.removeItem("cart");
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  if (!cart.length) return <p>Giỏ hàng trống. <a href="/">Quay lại trang chủ</a></p>;

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h2>Thông tin khách hàng</h2>
        <div className="form-group">
          <label>Họ và tên</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="0xxxxxxxxx" />
        </div>
        <div className="form-group">
          <label>Địa chỉ</label>
          <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Số nhà, đường" />
          <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Phường / Xã" />
          <input name="district" value={form.district} onChange={handleChange} placeholder="Quận / Huyện" />
          <input name="city" value={form.city} onChange={handleChange} placeholder="Tỉnh / Thành phố" />
        </div>
        <div className="form-group">
          <label>Ghi chú (tùy chọn)</label>
          <textarea name="note" value={form.note} onChange={handleChange} placeholder="Ví dụ: Giao giờ hành chính" />
        </div>
      </div>

      <div className="checkout-right">
        <h2>Đơn hàng</h2>
        <ul className="cart-items">
          {cart.map(item => (
            <li key={item._id} className="cart-item">
              <img src={item.images?.[0]?.url || "https://via.placeholder.com/50"} alt={item.name} />
              <span className="cart-item-info">
                {item.name} x {item.quantity} - {item.basePrice.toLocaleString()} ₫
              </span>
            </li>
          ))}
        </ul>
        <p className="total">Tổng: {totalPrice.toLocaleString()} ₫</p>

        <h3>Phương thức thanh toán</h3>
        <div className="payment-methods">
          <label>
            <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
            Thanh toán khi nhận hàng
          </label>
          <label>
            <input type="radio" name="payment" value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} />
            Chuyển khoản ngân hàng
          </label>
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>Thanh toán</button>
      </div>
    </div>
  );
};

export default CheckoutPage;
