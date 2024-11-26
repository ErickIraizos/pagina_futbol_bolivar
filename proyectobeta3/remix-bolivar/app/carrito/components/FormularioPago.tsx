import { useRef, useEffect, useState } from "react";
import QRCodeDisplay from "~/components/QRCodeDisplay";
import ResumenUsuario from "./ResumenUsuario";
import ResumenPedido from "./ResumenPedido";
import type { ProductoCarrito } from "../types/carrito.types";
import toast from 'react-hot-toast';
import { createPedido } from '../../pedidos/pedido';
import { createDetallePedido } from '../../detallePedido/detalle-pedito';
import { useNavigate } from "@remix-run/react";

interface FormularioPagoProps {
    total: number;
    productos: ProductoCarrito[];
    onUploadComprobante: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmarPago: () => void;
}

export default function FormularioPago({ 
    total, 
    productos, 
    onUploadComprobante,
    onConfirmarPago 
}: FormularioPagoProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [usuario, setUsuario] = useState<any>(null);
    const qrText = `Banco: FIE\nCuenta: 5010-XXXXXXXX\nTitular: EMPRESA BOLIVAR\nMonto: Bs. ${total.toFixed(2)}`;
    const [comprobanteCargado, setComprobanteCargado] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
    const [procesando, setProcesando] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}');
        if (auth.record) {
            setUsuario(auth.record);
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Archivo muy grande (máx. 5MB)');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Solo imágenes permitidas');
                return;
            }

            setComprobanteFile(file);
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            setComprobanteCargado(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!comprobanteFile || procesando) {
            toast.error('Debe subir un comprobante de pago');
            return;
        }

        // Mostrar diálogo de confirmación directamente sin toast
        setShowConfirmDialog(true);
    };

    const handleConfirmarPago = async () => {
        setShowConfirmDialog(false);
        setProcesando(true);

        try {
            const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}');
            if (!auth.record?.id) {
                toast.error('Sesión no válida');
                return;
            }

            // 1. Crear el pedido
            const pedido = await createPedido({
                usuario: auth.record.id,
                fecha: new Date().toISOString(),
                estado: 'pendiente',
                total: total,
                productos: productos.map(p => p.productoId),
                direccion_envio: 'Dirección de envío'
            });

            // 2. Crear los detalles del pedido
            for (const producto of productos) {
                try {
                    const detalleData = {
                        pedido_id: pedido.id,
                        producto_id: producto.productoId,
                        cantidad: producto.cantidad,
                        precio_unitario: producto.precio,
                        Qr: comprobanteFile || undefined
                    };

                    await createDetallePedido(detalleData);
                } catch (error) {
                    console.error('Error al crear detalle:', error);
                    toast.error('Error al procesar el producto');
                    throw error;
                }
            }

            // 3. Limpiar carrito y marcar compra como realizada
            localStorage.removeItem('carrito_productos');
            localStorage.setItem('compra_realizada', 'true');
            window.dispatchEvent(new Event('carritoActualizado'));

            toast.success('¡Pago realizado con éxito!', {
                duration: 2000,
                style: {
                    background: '#22c55e',
                    color: 'white',
                    padding: '16px',
                }
            });

            // 4. Redireccionar a productos después de un breve delay
            setTimeout(() => {
                navigate('/productos');  // Usar navigate en lugar de onConfirmarPago
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar el pago', {
                duration: 3000
            });
        } finally {
            setProcesando(false);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!usuario) return null;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Finalizar Compra</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna izquierda: Información del usuario y resumen del pedido */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600">
                            Información del Pedido
                        </h3>
                        <ResumenUsuario usuario={usuario} />
                        
                        <div className="mt-6 border-t pt-4">
                            <h4 className="font-semibold text-lg mb-3">Productos Seleccionados:</h4>
                            <div className="space-y-3">
                                {productos.map((producto) => (
                                    <div key={producto.productoId} 
                                         className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-medium">{producto.nombre}</p>
                                            <p className="text-sm text-gray-600">
                                                Cantidad: {producto.cantidad} x Bs. {producto.precio.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            Bs. {(producto.precio * producto.cantidad).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between text-xl font-bold text-blue-700">
                                    <span>Total a Pagar:</span>
                                    <span>Bs. {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Información de pago y QR */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-6 text-blue-600">
                        Información de Pago
                    </h3>
                    
                    <div className="mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="font-medium mb-4 text-center">
                                Datos Bancarios
                            </h4>
                            <div className="text-center space-y-2">
                                <p><span className="font-semibold">Banco:</span> Banco FIE S.A.</p>
                                <p><span className="font-semibold">Titular:</span> EMPRESA BOLIVAR</p>
                                <p><span className="font-semibold">Tipo de Cuenta:</span> Caja de Ahorro</p>
                                <p><span className="font-semibold">Nº de Cuenta:</span> 5010-XXXXXXXX</p>
                                <p><span className="font-semibold">NIT:</span> XXXXXXXXX</p>
                                <p className="font-bold text-lg mt-4 text-blue-700">
                                    Monto a pagar: Bs. {total.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium mb-3 text-center">
                                Escanea el código QR para realizar el pago
                            </h4>
                            <div className="flex justify-center">
                                <QRCodeDisplay text={qrText} />
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-medium mb-3">Subir comprobante de pago</h4>
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    mb-4"
                            />

                            {previewUrl && (
                                <div className="mt-4">
                                    <h5 className="font-medium mb-2">Previsualización del comprobante:</h5>
                                    <div className="relative group">
                                        <img 
                                            src={previewUrl} 
                                            alt="Previsualización del comprobante" 
                                            className="max-w-full h-auto rounded-lg shadow-md"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setComprobanteCargado(false);
                                                    setComprobanteFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                    toast('Comprobante eliminado', {
                                                        icon: '🗑️',
                                                        style: {
                                                            background: '#f97316',
                                                            color: 'white'
                                                        }
                                                    });
                                                }}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                            >
                                                Eliminar imagen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={!comprobanteCargado || procesando}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-white
                                    ${comprobanteCargado && !procesando
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-gray-400 cursor-not-allowed'}
                                    transition-colors`}
                            >
                                {procesando 
                                    ? 'Procesando pago...' 
                                    : comprobanteCargado 
                                        ? 'Confirmar Pago' 
                                        : 'Sube el comprobante para continuar'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Diálogo de confirmación */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Confirmar Pago</h3>
                        <p className="mb-6">¿Está seguro de realizar el pago por Bs. {total.toFixed(2)}?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarPago}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 