import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LogoutRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      navigate('/', { replace: true });
    };
    doLogout();
  }, [logout, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500">Logging out...</p>
    </div>
  );
}
