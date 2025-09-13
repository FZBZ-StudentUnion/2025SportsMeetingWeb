import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, state } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    await login(username, password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>运动会管理系统</h1>
          <p>管理员登录</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={state.loading || !username.trim() || !password.trim()}
          >
            {state.loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>测试账号：</p>
          <ul>
            <li>管理员：admin / admin123</li>
            <li>教师：teacher / teacher123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};