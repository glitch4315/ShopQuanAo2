import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      navigate("/login"); // nếu chưa đăng nhập, chuyển về login
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  if (!user) return null; // chờ load thông tin

  return (
    <div className="profile-container">
      <h1>Hồ Sơ Người Dùng</h1>
      <div className="profile-card">
        <div className="profile-row">
          <span className="label">Họ và tên:</span>
          <span>{user.name}</span>
        </div>
        <div className="profile-row">
          <span className="label">Email:</span>
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="profile-row">
            <span className="label">Số điện thoại:</span>
            <span>{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="profile-row">
            <span className="label">Địa chỉ:</span>
            <span>
              {user.address.line1 || ""}, {user.address.district || ""}, {user.address.city || ""}
            </span>
          </div>
        )}
        <div className="profile-actions">
          <button onClick={() => navigate("/")}>Quay lại Trang Chủ</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
