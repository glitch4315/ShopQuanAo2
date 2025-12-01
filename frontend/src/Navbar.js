import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Lấy số lượng giỏ hàng từ localStorage
  const cartCount = JSON.parse(localStorage.getItem("cart"))?.length || 0;

  useEffect(() => {
    // ✅ Lấy token + user từ localStorage
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (token && storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">HOME</Link>
      </div>

      <div className="navbar-right">
        <Link to="/cart" className="nav-link">Giỏ hàng ({cartCount})</Link>

        {user ? (
          <div className="profile-dropdown">
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {user.name} ▼
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile">Hồ sơ</Link>
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link">Đăng nhập</Link>
            <Link to="/register" className="nav-link">Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
