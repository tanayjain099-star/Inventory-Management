import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const result = login(email, password);
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
          <p>Inventory Management System</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <label><HiOutlineMail style={{ verticalAlign: 'middle', marginRight: 6 }} />Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="login-email"
            />
          </div>
          <div className="input-group">
            <label><HiOutlineLockClosed style={{ verticalAlign: 'middle', marginRight: 6 }} />Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password"
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent-secondary)', fontSize: 13, textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="auth-btn" id="login-btn">Sign In</button>
        </form>
        <div className="auth-link">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
}
