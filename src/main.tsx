import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import Home from './pages/HomePage';
import Room from './pages/RoomPage';
import Error from './pages/ErrorPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/room/:roomId',
        element: <Room />,
      },
    ],
  },
  {
    path: '*',
    element: <Error />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={ router }></RouterProvider>
  </StrictMode>,
);
