import React from 'react';
import { APP_CONFIG } from '../../utils/constants';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import logo from '../../logo.png';

export const Header: React.FC = () => {
  const currentTime = useCurrentTime();

  const handleDownloadSchedule = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // 自动识别当前域名和端口
      const protocol = window.location.protocol; // http: 或 https:
      const hostname = window.location.hostname; // 当前域名
      const port = window.location.port; // 当前端口
      
      // 构建基础URL
      let baseUrl = `${protocol}//${hostname}`;
      if (port && port !== '80' && port !== '443') {
        baseUrl += `:${port}`;
      }
      
      // 构建PDF文件URL
      const pdfUrl = `${baseUrl}/data/2025年福州八中第56届运动会秩序册.pdf`;
      const fileName = '2025年福州八中第56届运动会秩序册.pdf';
      
      console.log('下载秩序册:', pdfUrl);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 下载成功的视觉反馈
      const button = e.currentTarget as HTMLButtonElement;
      const originalContent = button.innerHTML;
      button.innerHTML = '<div class="download-button-content"><span class="download-label zi">下载成功</span><span class="download-target zi">✓</span></div>';
      button.classList.add('download-success');
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('download-success');
      }, 2000);
      
    } catch (error) {
      console.error('下载失败:', error);
      
      // 下载失败的视觉反馈
      const button = e.currentTarget as HTMLButtonElement;
      const originalContent = button.innerHTML;
      button.innerHTML = '<div class="download-button-content"><span class="download-label zi">下载失败</span><span class="download-target zi">✗</span></div>';
      button.classList.add('download-error');
      
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('download-error');
      }, 3000);
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