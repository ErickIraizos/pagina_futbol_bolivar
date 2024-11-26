import { useLoaderData, useNavigate } from "@remix-run/react";
import { obtenerTodosLosCarritos } from "~/carrito/service/carrito-service";
import { useEffect, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createPedido, uploadComprobante } from "~/pedidos/pedido";
import { createDetallePedido } from "~/detallePedido/detalle-pedito";
import CarritoLista from "~/carrito/components/CarritoLista";
import FormularioPago from "~/carrito/components/FormularioPago";
import type { ProductoCarrito } from "~/carrito/types/carrito.types";
import toast, { Toaster } from 'react-hot-toast';

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const carritos = await obtenerTodosLosCarritos();
        return json({ carritos });
    } catch (error) {
        console.error("Error al cargar los carritos:", error);
        return json({ carritos: [], error: "Error al cargar los carritos" }, { status: 500 });
    }
};

export default function CarritoPage() {
    const { carritos } = useLoaderData<typeof loader>();
    const [productosCarrito, setProductosCarrito] = useState<ProductoCarrito[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [procesandoPedido, setProcesandoPedido] = useState(false);
    const [pedidoCreado, setPedidoCreado] = useState<string | null>(null);
    const [mostrarFormPago, setMostrarFormPago] = useState(false);
    const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarProductosCarrito();
    }, []);

    const cargarProductosCarrito = () => {
        try {
            const productos = JSON.parse(localStorage.getItem('carrito_productos') || '[]');
            setProductosCarrito(productos);
            calcularTotal(productos);
        } catch (error) {
            console.error("Error al obtener productos del carrito:", error);
            setProductosCarrito([]);
        } finally {
            setLoading(false);
        }
    };

    const calcularTotal = (productos: ProductoCarrito[]) => {
        const totalCarrito = productos.reduce((acc, producto) => {
            return acc + (producto.precio * producto.cantidad);
        }, 0);
        setTotal(totalCarrito);
    };

    const handleUpdateQuantity = (productoId: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return;

        const nuevosProductos = productosCarrito.map(producto => {
            if (producto.productoId === productoId) {
                return { ...producto, cantidad: nuevaCantidad };
            }
            return producto;
        });

        actualizarCarrito(nuevosProductos);
    };

    const handleRemoveProduct = (productoId: string) => {
        const nuevosProductos = productosCarrito.filter(p => p.productoId !== productoId);
        actualizarCarrito(nuevosProductos);
    };

    const actualizarCarrito = (nuevosProductos: ProductoCarrito[]) => {
        localStorage.setItem('carrito_productos', JSON.stringify(nuevosProductos));
        setProductosCarrito(nuevosProductos);
        calcularTotal(nuevosProductos);
        window.dispatchEvent(new Event('carritoActualizado'));
    };

    const handleProcederPago = () => {
        if (!productosCarrito.length) {
            toast.error('El carrito está vacío');
            return;
        }

        const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}');
        if (!auth.record?.id) {
            toast.error('Debe iniciar sesión para continuar');
            navigate('/');
            return;
        }

        setMostrarFormPago(true);
    };

    const handleUploadComprobante = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !pedidoCreado) return;

        try {
            setComprobanteFile(file);
            await uploadComprobante(pedidoCreado, file);
            toast.success('Comprobante subido exitosamente');
            // Limpiar el carrito después de confirmar el pago
            localStorage.removeItem('carrito_productos');
            window.dispatchEvent(new Event('carritoActualizado'));
            navigate('/productos');
        } catch (error) {
            console.error('Error al subir comprobante:', error);
            toast.error('Error al subir el comprobante. Por favor, intente nuevamente.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (mostrarFormPago) {
        return (
            <FormularioPago
                total={total}
                productos={productosCarrito}
                onUploadComprobante={handleUploadComprobante}
                onConfirmarPago={() => {
                    // Aquí puedes agregar lógica adicional si es necesario
                    navigate('/productos');
                }}
            />
        );
    }

    return (
        <>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
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
                        duration: 4000,
                    },
                    loading: {
                        style: {
                            background: '#3b82f6',
                        },
                        duration: Infinity,
                    },
                }}
            />
            <div className="container mx-auto p-4 max-w-4xl">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Mi Carrito de Compras</h1>
                
                {productosCarrito.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <CarritoLista
                            productos={productosCarrito}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveProduct={handleRemoveProduct}
                        />
                        
                        <div className="mt-6 border-t pt-4">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total:</span>
                                <span>Bs. {total.toFixed(2)}</span>
                            </div>
                            
                            <button 
                                className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                                onClick={handleProcederPago}
                                disabled={procesandoPedido}
                            >
                                {procesandoPedido ? 'Procesando...' : 'Proceder al Pago'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                        <p className="text-gray-600 text-lg">Tu carrito está vacío</p>
                        <button 
                            onClick={() => navigate('/productos')}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                        >
                            Volver a la Tienda
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
