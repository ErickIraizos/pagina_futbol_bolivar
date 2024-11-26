import { useLoaderData } from '@remix-run/react';
import UsuarioLogout from '~/auth/components/logout';
import CardProducto from '~/productos/components/producto_card';
import { cargarProductos } from '~/productos/hooks/productos';
import { Producto } from '~/productos/interface/produto';
import Carrito from "~/carrito/components/carrito";

export const loader = async () => {
  return await cargarProductos();
};

export default function ProductosPage() {
  const productos = useLoaderData<Producto[]>();

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="fixed top-0 left-0 right-0 bg-blue-100 shadow-md z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Carrito />
          </div>
          <h1 className="text-blue-700 text-2xl md:text-3xl font-bold">Nuestros Productos</h1>
          <div className="flex items-center">
            <UsuarioLogout />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {productos.map((producto) => (
              <CardProducto key={producto.id} producto={producto} />
            ))}
          </section>
        </div>
      </main>

      <footer className="bg-blue-100 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-blue-700">
          <p>© 2024 Tu Tienda. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
