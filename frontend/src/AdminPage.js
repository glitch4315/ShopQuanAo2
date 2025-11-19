import React, { useEffect, useState } from "react";
import "./AdminPage.css";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    basePrice: "",
    images: [],
    categorySlug: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes, categoriesRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/users"),
          fetch("http://localhost:5000/api/admin/products"),
          fetch("http://localhost:5000/api/categories/category")
        ]);
        setUsers(await usersRes.json());
        setProducts(await productsRes.json());
        setCategories(await categoriesRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.categorySlug) return alert("Vui lòng chọn danh mục");

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("basePrice", newProduct.basePrice);
    formData.append("categorySlug", newProduct.categorySlug);
    for (let file of newProduct.images) formData.append("images", file);

    try {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setProducts([...products, data]);
      setNewProduct({ name: "", basePrice: "", images: [], categorySlug: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: "DELETE" });
    setUsers(users.filter(u => u._id !== id));
  };

  const deleteProduct = async (id) => {
    await fetch(`http://localhost:5000/api/admin/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(p => p._id !== id));
  };

  if (loading) return <p className="loading-text">Đang tải...</p>;

  return (
    <div className="admin-container">
      {/* Bên trái: danh sách */}
      <div className="admin-left">
        <section className="admin-section">
          <h2>Người dùng</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u._id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteUser(u._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-section">
          <h2>Sản phẩm</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>{p._id}</td>
                  <td>{p.name}</td>
                  <td>{p.basePrice.toLocaleString()} ₫</td>
                  <td>{p.categorySlug}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteProduct(p._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Bên phải: form thêm sản phẩm */}
      <div className="admin-right">
        <h2>Thêm sản phẩm</h2>
        <form className="admin-form" onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Giá"
            value={newProduct.basePrice}
            onChange={e => setNewProduct({ ...newProduct, basePrice: e.target.value })}
            required
          />
          <select
            value={newProduct.categorySlug}
            onChange={e => setNewProduct({ ...newProduct, categorySlug: e.target.value })}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map(c => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <input
            type="file"
            multiple
            onChange={e => setNewProduct({ ...newProduct, images: e.target.files })}
          />
          <button type="submit">Thêm sản phẩm</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;
