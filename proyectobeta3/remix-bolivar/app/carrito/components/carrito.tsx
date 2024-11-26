import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import toast from 'react-hot-toast';

export default function Carrito() {
  const [cantidadProductos, setCantidadProductos] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const actualizarCantidad = () => {
      try {
        const authData = localStorage.getItem('pocketbase_auth');
        if (authData) {
          const carrito = JSON.parse(localStorage.getItem('carrito_productos') || '[]');
          setCantidadProductos(carrito.length);
          
          // Si el carrito está vacío después de una compra, mostrar mensaje de confirmación
          const compraRealizada = localStorage.getItem('compra_realizada');
          if (compraRealizada === 'true' && carrito.length === 0) {
            toast.success('¡Compra realizada con éxito!', {
              duration: 3000,
              style: {
                background: '#22c55e',
                color: 'white',
                padding: '16px',
              }
            });
            localStorage.removeItem('compra_realizada'); // Limpiar el flag
          }
        }
      } catch (error) {
        console.error('Error al obtener el carrito:', error);
        setCantidadProductos(0);
      }
    };

    window.addEventListener('carritoActualizado', actualizarCantidad);
    actualizarCantidad();

    return () => {
      window.removeEventListener('carritoActualizado', actualizarCantidad);
    };
  }, []);

  const handleClick = () => {
    navigate('/carrito');
  };

  return (
    <div 
      className="relative cursor-pointer bg-white p-2 rounded-full shadow-lg hover:bg-gray-50" 
      onClick={handleClick}
    >
      <span className="text-3xl">🛒</span>
      {cantidadProductos > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-bounce">
          {cantidadProductos}
        </span>
      )}
    </div>
  );
}
