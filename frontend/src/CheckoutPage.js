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
  const token = localStorage.getItem("token");

  // 1️⃣ Lấy giỏ hàng từ server theo token
  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập trước khi thanh toán");
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setCart(data.items?.map(item => ({
          ...item,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1
        })) || []);
      } catch (err) {
        console.error("Lỗi lấy giỏ hàng:", err);
      }
    };

    fetchCart();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 2️⃣ Gửi đơn hàng lên server
  const handleCheckout = async () => {
    const requiredFields = ["name", "email", "phone", "addressLine1", "city", "district"];
    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`Vui lòng nhập ${field}`);
        return;
      }
    }

    if (!token) {
      alert("Vui lòng đăng nhập trước khi thanh toán");
      return;
    }

    const orderData = {
      cart: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      customer: form,
      paymentMethod,
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Đặt hàng thành công! Mã đơn: ${data.orderId}\nTổng: ${data.total.toLocaleString()} ₫`);
        setCart([]);
      } else {
        alert(data.message || "Đặt hàng thất bại");
      }
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      alert("Không thể đặt hàng");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);

  if (!cart.length) return <p>Giỏ hàng trống. <a href="/">Quay lại trang chủ</a></p>;

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h2>Thông tin khách hàng</h2>
        {["name","email","phone","addressLine1","addressLine2","district","city","note"].map(field => (
          <div className="form-group" key={field}>
            <label>{field}</label>
            {field === "note" ? (
              <textarea name={field} value={form[field]} onChange={handleChange} placeholder="Ghi chú..." />
            ) : (
              <input name={field} value={form[field]} onChange={handleChange} placeholder={field} />
            )}
          </div>
        ))}
      </div>

      <div className="checkout-right">
        <h2>Đơn hàng</h2>
        <ul className="cart-items">
          {cart.map(item => (
            <li key={item.productId} className="cart-item">
              <img src={item.image || "https://via.placeholder.com/50"} alt={item.name} />
              <span>{item.name} x {item.quantity} - {(item.price ?? 0).toLocaleString()} ₫</span>
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
