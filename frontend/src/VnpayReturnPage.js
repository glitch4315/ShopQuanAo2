import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VnpayReturnPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
    const orderId = queryParams.get("vnp_TxnRef");

    if (vnp_ResponseCode === "00") {
      // Thanh toán thành công
      navigate(`/checkout-success?orderId=${orderId}`);
    } else {
      // Thanh toán thất bại
      navigate(`/checkout-fail?code=${vnp_ResponseCode}`);
    }
  }, [navigate]);

  return (
    <div>
      <h1>Đang xử lý kết quả thanh toán...</h1>
    </div>
  );
};

export default VnpayReturnPage;
