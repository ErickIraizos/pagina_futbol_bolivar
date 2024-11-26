export interface ProductoCarrito {
    productoId: string;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface CarritoState {
    productos: ProductoCarrito[];
    total: number;
    loading: boolean;
} 