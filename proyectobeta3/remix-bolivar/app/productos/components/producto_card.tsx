import { Producto } from "../interface/produto";
import { getImageUrl } from "../services/productos";
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { crearCarrito } from "~/carrito/service/carrito-service";
import toast, { Toaster } from 'react-hot-toast';

interface CardProductoProps {
  producto: Producto;
}

export default function CardProducto({ producto }: CardProductoProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const authData = localStorage.getItem('pocketbase_auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.record?.id) {
          setIsLoggedIn(true);
          setUserId(auth.record.id);
        } else {
          setIsLoggedIn(false);
          setUserId("");
        }
      } catch (error) {
        console.error('Error al parsear datos de autenticación:', error);
        setIsLoggedIn(false);
        setUserId("");
      }
    } else {
      setIsLoggedIn(false);
      setUserId("");
    }
  }, []);
  
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Debe estar logueado para agregar productos al carrito.");
      navigate("/");
      return;
    }

    try {
      const carritoActual = JSON.parse(localStorage.getItem('carrito_productos') || '[]');
      const productoExistente = carritoActual.findIndex((item: any) => item.productoId === producto.id);
      
      if (productoExistente !== -1) {
        carritoActual[productoExistente].cantidad += 1;
        toast.success(`Se aumentó la cantidad de ${producto.nombre}`);
      } else {
        carritoActual.push({
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1
        });
        toast.success(`${producto.nombre} agregado al carrito`);
      }

      localStorage.setItem('carrito_productos', JSON.stringify(carritoActual));

      await crearCarrito({
        usuario: userId,
        productos: carritoActual.map((item: any) => item.productoId),
        cantidad: carritoActual.length
      });

      window.dispatchEvent(new Event('carritoActualizado'));
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar el producto al carrito');
    }
  };

  const imageUrl = producto.imagen
    ? getImageUrl(producto.collectionId ?? '', producto.id ?? '', producto.imagen as string)
    : '/placeholder.svg?height=300&width=300';

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <li className="bg-[#eff6ff] hover:bg-[#dbeafe] p-4 rounded-lg shadow-md w-64">
        <article className="border border-[#bfdbfe] rounded-lg overflow-hidden flex flex-col h-full">
          <figure className="bg-[#93c5fd] flex-shrink-0">
            <img
              className="w-full h-64 object-cover"
              src={imageUrl}
              alt={producto.nombre || 'Producto'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=300';
              }}
            />
          </figure>
          <header className="bg-[#3b82f6] p-3 flex-shrink-0">
            <h2 className="text-[#fff] text-xl font-semibold text-center">{producto.nombre?.toUpperCase()}</h2>
          </header>
          <section className="p-2 flex-grow">
            <p className="text-[#2563eb]">Marca: {producto.marca}</p>
            <p className="text-[#2563eb]">Precio: Bs. {producto.precio?.toFixed(2)}</p>
          </section>
          <footer className="p-2 flex-shrink-0">
            <button 
              className="bg-[#3b82f6] text-white p-2 rounded-lg w-full"
              onClick={handleAddToCart}
            >
              Agregar al carrito
            </button>
          </footer>
        </article>
      </li>
    </>
  );
}
