import { lazy } from 'react';
import { ProtectedRoute } from '../contexts/AuthContext';

const GameListPage = lazy(() => import('../pages/GameListPage'));
const GamePage = lazy(() => import('../pages/GamePage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

const routes = [
  {
    path: '/',
    element: <GameListPage />,
  },
  {
    path: '/games',
    element: <GamePage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;