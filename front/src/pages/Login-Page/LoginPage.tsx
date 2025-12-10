import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!username.trim()) {
      setError('Please enter username');
      return;
    }

    if (!password) {
      setError('Please enter password');
      return;
    }

    try {
      // Передаем только username и password, userType будет определен автоматически
      await login({ username, password });
      navigate('/');
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="college-info">
          <div className="college-header">
            <h1 className="college-abbr">MTUCI</h1>
            <p className="college-fullname">Moscow Technical University of Communications and Informatics</p>
            <p className="college-motto">Connecting futures through technology and innovation</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-container">
          <header className="login-header">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your MTUCI account</p>
          </header>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="login-footer">
              <button 
                type="button" 
                className="back-home-btn"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </button>
              <a href="#forgot" className="forgot-password">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;