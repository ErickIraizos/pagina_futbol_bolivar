import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { verifyAuth } from '~/auth/auth';

export function useAuthStatus() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyAuth();
      if (isAuthenticated) {
        navigate('/productos'); // Redirige a /productos si está autenticado
      }
    };

    checkAuth();
  }, [navigate]);
}