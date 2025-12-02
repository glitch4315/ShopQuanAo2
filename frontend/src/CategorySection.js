import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CategorySection.css";

function CategorySection() {
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories/category");
      const data = await res.json();
      const cats = Array.isArray(data) ? data : data.category || [];

      const categoriesWithCount = await Promise.all(
        cats.map(async (cat) => {
          try {
            const resProducts = await fetch(`http://localhost:5000/api/products/by-category/${cat.slug}`);
            const dataProducts = await resProducts.json();
            const count = Array.isArray(dataProducts.products) ? dataProducts.products.length : 0;
            return { ...cat, items: count };
          } catch (err) {
            console.error("Lỗi lấy sản phẩm theo category:", cat.slug, err);
            return { ...cat, items: 0 };
          }
        })
      );

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error("Lỗi tải categories:", err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="category-list-container">
      <h3 className="category-title">Danh mục sản phẩm</h3>
      <ul className="category-list">
        {categories.map(cat => (
          <li key={cat._id} className="category-item">
            <Link to={`/category/${cat.slug}`} className="category-link">
              {cat.name}
            </Link>
            <span className="category-badge">{cat.items ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategorySection;
