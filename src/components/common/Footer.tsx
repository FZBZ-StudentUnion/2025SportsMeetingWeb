import React from 'react';
import { APP_CONFIG } from '../../utils/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p className="copyright">{APP_CONFIG.COPYRIGHT}</p>
    </footer>
  );
};