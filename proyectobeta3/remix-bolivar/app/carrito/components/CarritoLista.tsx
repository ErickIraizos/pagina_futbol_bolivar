import { useState } from "react";
import type { ProductoCarrito } from "../types/carrito.types";
interface CarritoListaProps {
    productos: ProductoCarrito[];
    onUpdateQuantity: (productoId: string, cantidad: number) => void;
    onRemoveProduct: (productoId: string) => void;
}

export default function CarritoLista({ productos, onUpdateQuantity, onRemoveProduct }: CarritoListaProps) {
    return (
        <div className="space-y-4">
            {productos.map((producto) => (
                <div key={producto.productoId} 
                     className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                        <p className="text-gray-600">Precio: Bs. {producto.precio.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button 
                                className="bg-blue-500 text-white w-8 h-8 rounded-full"
                                onClick={() => onUpdateQuantity(producto.productoId, producto.cantidad - 1)}
                            >
                                -
                            </button>
                            <span className="w-8 text-center">{producto.cantidad}</span>
                            <button 
                                className="bg-blue-500 text-white w-8 h-8 rounded-full"
                                onClick={() => onUpdateQuantity(producto.productoId, producto.cantidad + 1)}
                            >
                                +
                            </button>
                        </div>
                        
                        <p className="font-semibold w-24 text-right">
                            Bs. {(producto.precio * producto.cantidad).toFixed(2)}
                        </p>
                        
                        <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => onRemoveProduct(producto.productoId)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 