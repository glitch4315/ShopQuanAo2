import React from "react";
import { useLocation, Link } from "react-router-dom";

const VnpayReturnPage = () => {
  const query = new URLSearchParams(useLocation().search);

  // Lấy các tham số trả về
  const responseCode = query.get("vnp_ResponseCode");
  const amount = query.get("vnp_Amount");
  const bank = query.get("vnp_BankCode");
  const orderId = query.get("vnp_TxnRef");
  const payDate = query.get("vnp_PayDate");

  const isSuccess = responseCode === "00";

  // Format thời gian từ VNPAY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return (
      dateStr.substring(0, 4) + "-" +
      dateStr.substring(4, 6) + "-" +
      dateStr.substring(6, 8) + " " +
      dateStr.substring(8, 10) + ":" +
      dateStr.substring(10, 12) + ":" +
      dateStr.substring(12, 14)
    );
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Kết quả thanh toán VNPAY</h1>

      {isSuccess ? (
        <h2 style={{ color: "green" }}>🎉 Thanh toán thành công!</h2>
      ) : (
        <h2 style={{ color: "red" }}>❌ Thanh toán thất bại!</h2>
      )}

      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 10,
          display: "inline-block",
          textAlign: "left",
          minWidth: 350,
        }}
      >
        <p><strong>Mã đơn hàng:</strong> {orderId}</p>
        <p><strong>Số tiền:</strong> {(Number(amount) / 100).toLocaleString()} ₫</p>
        <p><strong>Ngân hàng:</strong> {bank || "Không rõ"}</p>
        <p><strong>Thời gian thanh toán:</strong> {formatDate(payDate)}</p>
        <p><strong>Mã phản hồi:</strong> {responseCode}</p>
      </div>

      <div style={{ marginTop: 30 }}>
        <Link to="/">
          <button
            style={{
              padding: "10px 20px",
              fontSize: 16,
              borderRadius: 6,
              background: "#0A68FE",
              color: "white",
              cursor: "pointer",
              border: "none",
            }}
          >
            Quay lại trang chủ
          </button>
        </Link>
      </div>
    </div>
  );
};

export default VnpayReturnPage;
