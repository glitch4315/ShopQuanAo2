import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        // ✅ Lưu key đồng bộ với Navbar
        localStorage.setItem('loggedInUser', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Đăng Nhập</h1>
        {error && <div className="error-message"><AlertCircle size={20}/> {error}</div>}
        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <Mail size={20} className="input-icon" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} onKeyPress={handleKeyPress} placeholder="email@example.vn" />
          </div>
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon"/>
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onKeyPress={handleKeyPress} placeholder="••••••••" />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>
        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
