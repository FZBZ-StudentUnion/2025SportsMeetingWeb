import React from 'react';
import { APP_CONFIG } from '../../utils/constants';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { apiService } from '../../services/api';
import logo from '../../logo.png';

export const Header: React.FC = () => {
  const currentTime = useCurrentTime();

  const handleDownloadSchedule = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // 直接使用浏览器下载PDF文件
      const link = document.createElement('a');
      link.href = 'http://localhost:3001/data/2025年福州八中第56届运动会秩序册.pdf';
      link.download = '2025年福州八中第56届运动会秩序册.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
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
        </div>
      </div>
    </header>
  );
};