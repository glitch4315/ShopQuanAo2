import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không xác thực được user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login"); // token sai hoặc hết hạn => login
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <p className="center-text">Đang tải...</p>;
  if (!user) return null;

  return (
    <div className="profile-container">
      <h1>Hồ Sơ Người Dùng</h1>
      <div className="profile-card">
        <div className="profile-row">
          <span className="label">Họ và tên:</span>
          <span>{user.fullName || user.name}</span>
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
