import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone } from 'react-icons/hi';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'Inventory Manager' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    const result = signup(form);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-bg-orb"></div>
        <div className="auth-bg-orb"></div>
        <div className="auth-bg-orb"></div>
      </div>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="auth-logo">
          <h1>📦 StockFlow</h1>
          <p>Create your account</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <label><HiOutlineUser style={{ verticalAlign: 'middle', marginRight: 6 }} />Full Name *</label>
            <input type="text" className="input-field" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} id="signup-name" />
          </div>
          <div className="input-group">
            <label><HiOutlineMail style={{ verticalAlign: 'middle', marginRight: 6 }} />Email *</label>
            <input type="email" className="input-field" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} id="signup-email" />
          </div>
          <div className="input-group">
            <label><HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 6 }} />Phone</label>
            <input type="text" className="input-field" name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} id="signup-phone" />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select className="input-field" name="role" value={form.role} onChange={handleChange} id="signup-role">
              <option>Inventory Manager</option>
              <option>Warehouse Staff</option>
            </select>
          </div>
          <div className="input-group">
            <label><HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: 6 }} />Password *</label>
            <input type="password" className="input-field" name="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} id="signup-password" />
          </div>
          <button type="submit" className="auth-btn" id="signup-btn">Create Account</button>
        </form>
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
