import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isTradePortal = pathname.startsWith('/professionals');

  useEffect(() => {
    document.body.classList.toggle('portal-trade', isTradePortal);
    return () => document.body.classList.remove('portal-trade');
  }, [isTradePortal]);

  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
