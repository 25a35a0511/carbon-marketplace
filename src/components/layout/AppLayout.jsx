import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main className="main-content fade-in">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
