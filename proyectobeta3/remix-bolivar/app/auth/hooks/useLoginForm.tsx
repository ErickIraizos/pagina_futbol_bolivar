import { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { UsuarioLogin } from '~/auth/auth';

export function useLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;

    try {
      await UsuarioLogin(email, password);
      navigate('/productos'); // Redirecciona después de iniciar sesión exitosamente
    } catch (error: any) {
      if (error.message.includes('ClientResponseError 401')) {
        setError('ClientResponseError 401');
      } else {
        setError('Error de autenticación. Por favor, verifica tus credenciales.');
      }
    }
  };

  return { error, handleSubmit };
}