import { Form } from '@remix-run/react';
import { useLoginForm } from '~/auth/hooks/useLoginForm';
import { useAuthStatus } from '~/auth/hooks/useAuthStatus';

export default function LoginPage() {
  const { error, handleSubmit } = useLoginForm();
  useAuthStatus();

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#eff6ff]">
      <section className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <header>
          <h1 className="text-2xl font-bold text-center text-[#3b82f6] mb-6">
            Iniciar sesión
          </h1>
        </header>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <Form method="post" className="space-y-4" onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2563eb]">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border border-[#93c5fd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
              required
            />
          </fieldset>

          <fieldset>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2563eb]">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border border-[#93c5fd] rounded-md focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
              required
            />
          </fieldset>

          <button
            type="submit"
            className="w-full py-2 bg-[#3b82f6] text-white rounded-md font-semibold hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            Iniciar sesión
          </button>
        </Form>
      </section>
    </main>
  );
}