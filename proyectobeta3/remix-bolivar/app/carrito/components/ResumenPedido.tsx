import type { ProductoCarrito } from "../types/carrito.types";

interface ResumenPedidoProps {
    productos: ProductoCarrito[];
    total: number;
    onConfirmar: () => void;
}

export default function ResumenPedido({ productos, total, onConfirmar }: ResumenPedidoProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Resumen del Pedido</h3>
            
            <div className="space-y-4">
                {productos.map((producto) => (
                    <div key={producto.productoId} className="flex justify-between border-b pb-2">
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
                
                <div className="pt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>Bs. {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onConfirmar}
                className="w-full mt-6 bg-green-500 text-white py-3 px-4 rounded-lg 
                         hover:bg-green-600 transition-colors font-semibold"
            >
                Confirmar y Realizar Pago
            </button>
        </div>
    );
} 