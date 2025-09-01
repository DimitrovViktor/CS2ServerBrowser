import React, { useState } from 'react';
import { FaServer, FaUser, FaEnvelope, FaLock, FaSteam, FaGoogle, FaDiscord, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onClose }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [form, setForm] = useState({ username: '', email: '', password: '', repeatPassword: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password !== form.repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:3001/api/login', {
          usernameOrEmail: form.username || form.email,
          password: form.password,
        });
        login(res.data.user, res.data.token);
        if (onClose) onClose();
      } else {
        const res = await axios.post('http://localhost:3001/api/register', {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        login(res.data.user, res.data.token);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Auth failed');
    }
  };

  return (
    <div className="auth-card">
      {onClose && (
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
      )}
      <div className="auth-header">
        <div className="auth-logo">
          <FaServer />
        </div>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p>{isLogin ? 'Sign in to your account' : 'Join us to get started'}</p>
      </div>
      <div className="auth-tabs">
        <div
          className={`auth-tab ${isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </div>
        <div
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="auth-form-group">
            <FaUser />
            <input
              className="auth-input"
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="auth-form-group">
          <FaEnvelope />
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required={!isLogin}
          />
        </div>
        <div className="auth-form-group">
          <FaLock />
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {!isLogin && (
          <div className="auth-form-group">
            <FaLock />
            <input
              className="auth-input"
              type="password"
              name="repeatPassword"
              placeholder="Repeat Password"
              value={form.repeatPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}
        {error && <div style={{ color: '#f44336', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
        <button className="auth-submit" type="submit">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <div className="auth-oauth">
        <button className="auth-oauth-btn steam"><FaSteam /></button>
        <button className="auth-oauth-btn google"><FaGoogle /></button>
        <button className="auth-oauth-btn discord"><FaDiscord /></button>
      </div>
      <div className="auth-footer">
        {isLogin ? (
          <>
            Don't have an account?{' '}
            <a href="#" onClick={() => setIsLogin(false)}>Register</a>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <a href="#" onClick={() => setIsLogin(true)}>Login</a>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
