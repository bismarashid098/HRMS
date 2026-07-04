import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

const App = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
};

export default App;
