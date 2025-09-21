import React from 'react';
import GameListPage from '../pages/GameListPage';
import GamePage from '../pages/GamePage';
import DataEditorPage from '../pages/DataEditorPage';
import PlayerEditorPage from '../pages/PlayerEditorPage';

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
    path: '/editor',
    element: <DataEditorPage />,
  },
  {
    path: '/players',
    element: <PlayerEditorPage />,
  },
];

export default routes;