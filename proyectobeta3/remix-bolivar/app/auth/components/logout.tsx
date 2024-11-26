import { Form, useNavigate } from '@remix-run/react';
import { UsuarioLogout } from '~/auth/auth';
import { useEffect, useState } from 'react';

export async function handleLogout(navigate: (path: string) => void) {
  try {
    await UsuarioLogout();
    navigate('/');
  } catch (error: any) {
    if (error.message.includes('ClientResponseError 401')) {
      console.error('Token de autenticación no válido.');
    } else {
      console.error('Error al cerrar sesión.');
    }
  }
}

export default function Logout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      const authData = localStorage.getItem('pocketbase_auth');
      if (authData) {
        try {
          const auth = JSON.parse(authData);
          setIsLoggedIn(!!auth.record?.id);
        } catch (error) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Verificar al montar el componente
    checkAuth();

    // Escuchar cambios en el localStorage
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Si no está logueado, no renderizar nada
  if (!isLoggedIn) return null;
  
  return (
    <Form 
      method="post" 
      onSubmit={async (e) => {
        e.preventDefault();
        await handleLogout(navigate);
      }}
      className="flex items-center justify-center"
    >
      <button 
        type="submit"
        className="group relative flex items-center justify-center gap-2 
                 px-4 sm:px-6 py-2 sm:py-3
                 bg-gradient-to-r from-red-500 to-red-600 
                 text-white text-sm sm:text-base font-semibold
                 rounded-lg shadow-md overflow-hidden
                 transform transition-all duration-300 ease-in-out
                 hover:from-red-600 hover:to-red-700
                 active:scale-95 hover:-translate-y-0.5
                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        <span className="relative flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:rotate-12 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          
          <span className="relative whitespace-nowrap">
            Cerrar Sesión
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
          </span>
        </span>

        <span className="absolute inset-0 h-full w-full bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out rounded-lg"></span>
      </button>
    </Form>
  );
}