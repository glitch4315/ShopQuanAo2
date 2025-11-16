import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const cartCount = JSON.parse(localStorage.getItem("cart"))?.length || 0;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Shop</Link>
      </div>
      <div className="navbar-right">
        <Link to="/" className="nav-link">Trang chủ</Link>
        <Link to="/category" className="nav-link">Danh mục</Link>
        <Link to="/cart" className="nav-link">
          Giỏ hàng ({cartCount})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
