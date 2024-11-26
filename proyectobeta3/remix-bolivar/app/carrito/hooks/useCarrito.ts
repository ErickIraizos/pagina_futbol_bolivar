import { useState, useEffect } from "react";
import type { ProductoCarrito } from "../types/carrito.types";

export function useCarrito() {
    const [productosCarrito, setProductosCarrito] = useState<ProductoCarrito[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

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

    const actualizarCantidad = (productoId: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return;

        const nuevosProductos = productosCarrito.map(producto => {
            if (producto.productoId === productoId) {
                return { ...producto, cantidad: nuevaCantidad };
            }
            return producto;
        });

        actualizarCarrito(nuevosProductos);
    };

    const eliminarProducto = (productoId: string) => {
        const nuevosProductos = productosCarrito.filter(p => p.productoId !== productoId);
        actualizarCarrito(nuevosProductos);
    };

    const actualizarCarrito = (nuevosProductos: ProductoCarrito[]) => {
        localStorage.setItem('carrito_productos', JSON.stringify(nuevosProductos));
        setProductosCarrito(nuevosProductos);
        calcularTotal(nuevosProductos);
        window.dispatchEvent(new Event('carritoActualizado'));
    };

    return {
        productosCarrito,
        loading,
        total,
        actualizarCantidad,
        eliminarProducto
    };
} 