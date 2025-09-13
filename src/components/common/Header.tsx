import React from 'react';
import { APP_CONFIG } from '../../utils/constants';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../logo.png';

export const Header: React.FC = () => {
  const currentTime = useCurrentTime();
  const { state, logout } = useAuth();

  const handleDownloadSchedule = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const blob = await apiService.downloadFile('/data/2024年福州八中第56届运动会秩序册.pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '2024年福州八中第56届运动会秩序册.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
          <img 
          src={logo} 
          alt="福州八中校徽" 
          className="logo" 
          width="80" 
          height="80" 
        />
          <div className="header-titles">
            <h1 className="title-main zi">{APP_CONFIG.TITLE}</h1>
            <h2 className="title-sub zi">{APP_CONFIG.SUBTITLE}</h2>
          </div>
        </div>
        
        <div className="header-right">
          <div className="time-display">
            <span className="time-label zi">现在时刻</span>
            <span className="time-value zi">{currentTime}</span>
          </div>
          
          <button 
            onClick={handleDownloadSchedule}
            className="download-button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              font: 'inherit'
            }}
          >
            <div className="download-button-content">
              <span className="download-label zi">点击下载</span>
              <span className="download-target zi">秩序册</span>
            </div>
          </button>
          
          {state.isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
              <span style={{ color: 'white' }}>欢迎, {state.user?.username}</span>
              <button 
                onClick={handleLogout}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                退出登录
              </button>
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = '/admin'}
              className="admin-button"
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px',
                fontSize: '14px'
              }}
            >
              管理后台
            </button>
          )}
        </div>
      </div>
    </header>
  );
};