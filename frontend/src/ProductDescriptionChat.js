import React, { useState } from "react";

function ProductDescriptionChat() {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !productType) return alert("Nhập tên và loại sản phẩm!");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/openai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productType }),
      });
      const data = await res.json();
      setDescription(data.description);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Chatbox mô tả sản phẩm</h2>
      <input
        type="text"
        placeholder="Tên sản phẩm"
        value={productName}
        onChange={e => setProductName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Loại sản phẩm"
        value={productType}
        onChange={e => setProductType(e.target.value)}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Đang tạo..." : "Tạo mô tả"}
      </button>
      {description && (
        <div style={{ marginTop: 20, border: "1px solid #ccc", padding: 10 }}>
          <strong>Mô tả sản phẩm:</strong>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

export default ProductDescriptionChat;
