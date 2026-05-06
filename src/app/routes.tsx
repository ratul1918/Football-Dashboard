import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Teams } from './pages/Teams';
import { Matches } from './pages/Matches';
import { Standings } from './pages/Standings';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'teams', Component: Teams },
      { path: 'matches', Component: Matches },
      { path: 'standings', Component: Standings },
      { path: 'settings', Component: Settings },
    ],
  },
]);
