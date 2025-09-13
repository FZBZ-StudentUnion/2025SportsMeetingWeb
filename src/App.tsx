import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import routes from './routers';
import './App.css';

const AppContent: React.FC = () => {
  const element = useRoutes(routes);
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <LoadingSpinner size="large" message="正在加载页面..." />
      </div>
    }>
      {element}
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="App">
          <AppContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;