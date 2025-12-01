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
    description: "",
    categoryId: "",
    images: [],
    variants: []
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
    if (!newProduct.categoryId) return alert("Vui lòng chọn danh mục");

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("basePrice", newProduct.basePrice);
    formData.append("description", newProduct.description);
    formData.append("categoryId", newProduct.categoryId);
    formData.append("variants", JSON.stringify(newProduct.variants));
    for (let file of newProduct.images) formData.append("images", file);

    try {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setProducts([...products, data]);
      setNewProduct({
        name: "",
        basePrice: "",
        description: "",
        categoryId: "",
        images: [],
        variants: []
      });
    } catch (err) {
      console.error(err);
      alert("Thêm sản phẩm thất bại");
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
      <div className="admin-left">
        {/* USERS */}
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

        {/* PRODUCTS */}
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
                  <td>{categories.find(c => c._id === p.categoryId)?.name || "Chưa chọn"}</td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteProduct(p._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* ADD PRODUCT */}
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
          <textarea
            placeholder="Mô tả sản phẩm"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <select
            value={newProduct.categoryId}
            onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
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
