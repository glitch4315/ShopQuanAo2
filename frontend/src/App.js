import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import CartPage from "./CartPage";
import CategoryPage from "./CategoryPage";
import ProductDetailPage from "./ProductDetailPage";
import Navbar from "./Navbar";

function App() {
  return (
    <Router>
       <Navbar />
      <div className="app-container"></div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
