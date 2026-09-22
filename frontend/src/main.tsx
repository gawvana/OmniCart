import React from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './app/providers';
import { router } from './app/router';
import { RouterProvider } from '@tanstack/react-router';
import './i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
