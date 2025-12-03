// src/pages/CheckoutPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ===============================================
  // 🔹 LOAD GIỎ HÀNG
  // ===============================================
  useEffect(() => {
    if (!token) {
      alert("Bạn cần đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setCart(
          data.items?.map((item) => ({
            ...item,
            price: item.price ?? 0,
            quantity: item.quantity ?? 1,
          })) || []
        );
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
        alert("Không thể tải giỏ hàng!");
        navigate("/cart");
      }
    };

    fetchCart();
  }, [token, navigate]);

  // ===============================================
  // 🔹 TÍNH TỔNG TIỀN
  // ===============================================
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ===============================================
  // 🔹 XỬ LÝ THAY ĐỔI FORM
  // ===============================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================================
  // 🔥 THANH TOÁN VNPAY
  // ===============================================
  const handleVnpayPayment = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");

    const required = ["name", "email", "phone", "addressLine1", "district", "city"];
    for (let f of required) {
      if (!form[f].trim()) return alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
    }

    try {
      const res = await fetch("http://localhost:5000/api/vnpay/create_payment_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalPrice,
        }),
      });

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // Chuyển sang VNPAY
      } else {
        alert("Không tạo được URL thanh toán!");
      }
    } catch (err) {
      console.error("Lỗi khi tạo URL VNPAY:", err);
      alert("Không thể kết nối VNPAY!");
    }
  };

  // ===============================================
  // 🔹 GIAO DIỆN
  // ===============================================
  if (cart.length === 0) {
    return (
      <div style={{ padding: 50 }}>
        <h2>Giỏ hàng trống</h2>
        <a href="/">Tiếp tục mua sắm</a>
      </div>
    );
  }

  return (
    <div className="checkout-container" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Thanh toán</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* LEFT FORM */}
        <div>
          <h2>Thông tin giao hàng</h2>

          {[
            { name: "name", label: "Họ tên" },
            { name: "email", label: "Email" },
            { name: "phone", label: "Số điện thoại" },
            { name: "addressLine1", label: "Địa chỉ" },
            { name: "addressLine2", label: "Địa chỉ bổ sung" },
            { name: "district", label: "Quận/Huyện" },
            { name: "city", label: "Tỉnh/Thành phố" },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: 12 }}>
              <label>{f.label}</label>
              <input
                type="text"
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>
          ))}
        </div>

        {/* RIGHT ORDER SUMMARY */}
        <div>
          <h2>Đơn hàng</h2>

          <div style={{ border: "1px solid #eee", padding: 15, borderRadius: 8 }}>
            {cart.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <strong>
                  {item.name} × {item.quantity}
                </strong>
                <span>{(item.price * item.quantity).toLocaleString()} ₫</span>
              </div>
            ))}

            <div
              style={{
                fontSize: "1.4em",
                textAlign: "right",
                marginTop: 20,
                color: "#0A68FE",
                fontWeight: "bold",
              }}
            >
              Tổng: {totalPrice.toLocaleString()} ₫
            </div>
          </div>

          {/* BUTTON THANH TOÁN VNPAY */}
          <button
            onClick={handleVnpayPayment}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "16px",
              fontSize: 18,
              borderRadius: 8,
              background: "#0A68FE",
              color: "white",
              cursor: "pointer",
              border: "none",
            }}
          >
            Thanh toán VNPAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;