import React from 'react';
import { useRoutes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import routes from './routers';
import './App.css';

const AppContent: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="App">
        <AppContent />
      </div>
    </AppProvider>
  );
};

export default App;