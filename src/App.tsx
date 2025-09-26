import React, { useState, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NetworkStatusIndicator } from './components/common/NetworkStatusIndicator';
import { isMobileDevice } from './utils/mobileHelpers';
import routes from './routers';
import './App.css';
import './styles/mobile.css';

const AppContent: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  const [showNetworkIndicator, setShowNetworkIndicator] = useState(false);

  useEffect(() => {
    // 只在移动设备上显示网络状态指示器
    setShowNetworkIndicator(isMobileDevice());
    
    // 添加调试信息
    console.log('应用初始化:', {
      isMobile: isMobileDevice(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }, []);

  return (
    <AppProvider>
      <div className="App">
        {showNetworkIndicator && <NetworkStatusIndicator />}
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default App;