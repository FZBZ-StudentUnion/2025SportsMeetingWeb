import React from 'react';
import GameListPage from '../pages/GameListPage';
import GamePage from '../pages/GamePage';

const routes = [
  {
    path: '/',
    element: <GameListPage />,
  },
  {
    path: '/games',
    element: <GamePage />,
  },
];

export default routes;