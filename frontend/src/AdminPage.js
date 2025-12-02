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

  const [editingProduct, setEditingProduct] = useState(null); // <-- sản phẩm đang sửa
  const [aiDescription, setAiDescription] = useState(""); 
  const [loadingAI, setLoadingAI] = useState(false);

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

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "DELETE"
    });
    setUsers(users.filter((u) => u._id !== id));
  };

  const deleteProduct = async (id) => {
    await fetch(`http://localhost:5000/api/admin/products/${id}`, {
      method: "DELETE"
    });
    setProducts(products.filter((p) => p._id !== id));
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      basePrice: product.basePrice,
      description: product.description,
      categoryId: product.categoryId,
      images: [] // lúc edit có thể upload lại
    });
    setAiDescription(product.description);
  };

  const generateAIDescription = async () => {
    if (!newProduct.name || !newProduct.categoryId) {
      return alert("Nhập tên sản phẩm + chọn danh mục trước khi dùng AI");
    }

    setLoadingAI(true);

    const categoryName =
      categories.find((c) => c._id === newProduct.categoryId)?.name || "thời trang";

    try {
      const res = await fetch("http://localhost:5000/api/openai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newProduct.name,
          productType: categoryName
        })
      });

      const data = await res.json();
      setAiDescription(data.description);
      setNewProduct({ ...newProduct, description: data.description });
    } catch (err) {
      console.error(err);
      alert("AI xử lý thất bại");
    }

    setLoadingAI(false);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.categoryId) return alert("Vui lòng chọn danh mục");

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("basePrice", newProduct.basePrice);
    formData.append("description", newProduct.description);
    formData.append("categoryId", newProduct.categoryId);

    for (let file of newProduct.images) {
      formData.append("images", file);
    }

    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        const res = await fetch(`http://localhost:5000/api/admin/products/${editingProduct._id}`, {
          method: "PUT",
          body: formData
        });
        const updatedProduct = await res.json();
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        setEditingProduct(null);
      } else {
        // Thêm sản phẩm mới
        const res = await fetch("http://localhost:5000/api/admin/products", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        setProducts([...products, data]);
      }

      // Reset form
      setNewProduct({
        name: "",
        basePrice: "",
        description: "",
        categoryId: "",
        images: []
      });
      setAiDescription("");
    } catch (err) {
      console.error(err);
      alert(editingProduct ? "Cập nhật thất bại" : "Thêm sản phẩm thất bại");
    }
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
              {users.map((u) => (
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
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p._id}</td>
                  <td>{p.name}</td>
                  <td>{p.basePrice.toLocaleString()} ₫</td>
                  <td>{categories.find((c) => c._id === p.categoryId)?.name || "Không có"}</td>
                  <td>
                    <button className="btn-edit" onClick={() => editProduct(p)}>Sửa</button>
                    <button className="btn-delete" onClick={() => deleteProduct(p._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="admin-right">
        <h2>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
        <form className="admin-form" onSubmit={handleSubmitProduct}>
          <input
            type="text"
            placeholder="Tên sản phẩm"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Giá gốc"
            value={newProduct.basePrice}
            onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
            required
          />
          <select
            value={newProduct.categoryId}
            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn-ai"
            onClick={generateAIDescription}
            disabled={loadingAI}
          >
            {loadingAI ? "AI đang viết mô tả..." : "Tạo mô tả bằng AI ✨"}
          </button>

          <textarea
            placeholder="Mô tả sản phẩm"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <input
            type="file"
            multiple
            onChange={(e) => setNewProduct({ ...newProduct, images: e.target.files })}
          />

          <button type="submit">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</button>

          {editingProduct && (
            <button type="button" onClick={() => {
              setEditingProduct(null);
              setNewProduct({
                name: "",
                basePrice: "",
                description: "",
                categoryId: "",
                images: []
              });
              setAiDescription("");
            }}>Hủy chỉnh sửa</button>
          )}
        </form>

        {aiDescription && (
          <div className="ai-box">
            <h3>Mô tả AI tạo:</h3>
            <p>{aiDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
