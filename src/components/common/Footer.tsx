import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../utils/constants';

export const Footer: React.FC = () => {
  // 将版权信息中的Zero_wyc替换为超链接
  const copyrightWithLink = APP_CONFIG.COPYRIGHT.replace(
    'Zero_wyc',
    '<a href="https://Zero251.xyz" target="_blank" rel="noopener noreferrer">Zero_wyc</a>'
  );

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p 
          className="copyright" 
          dangerouslySetInnerHTML={{ __html: copyrightWithLink }}
        />
        <Link 
          to="/players"
          className="footer-editor-button hover-lift"
        >
          人员编辑
        </Link>
      </div>
    </footer>
  );
};