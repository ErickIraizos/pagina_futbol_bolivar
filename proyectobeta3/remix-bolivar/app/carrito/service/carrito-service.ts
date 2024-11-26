import { POCKETBASE_URL } from "~/productos/services/productos";
import PocketBase from 'pocketbase';
import { Carrito } from "../interface/carrito";

const pb = new PocketBase(POCKETBASE_URL);

// Obtener lista paginada de carritos
export const obtenerCarritosPaginados = async (pagina: number = 1, limite: number = 50) => {
    try {
        return await pb.collection('Carrito').getList(pagina, limite, {
            $autoCancel: false
        });
    } catch (error) {
        console.error('Error al obtener lista paginada:', error);
        throw error;
    }
};

// Obtener lista completa de carritos
export const obtenerTodosLosCarritos = async (): Promise<Carrito[]> => {
    try {
        return await pb.collection('Carrito').getFullList({
            sort: '-created',
            $autoCancel: false
        });
    } catch (error) {
        console.error('Error al obtener lista completa:', error);
        throw error;
    }
};

// Obtener un carrito por filtro
export const obtenerCarritoPorFiltro = async (filtro: string): Promise<Carrito> => {
    try {
        return await pb.collection('Carrito').getFirstListItem(filtro, {
            $autoCancel: false
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        throw error;
    }
};

// Obtener el carrito del usuario desde el local storage
export const obtenerCarritoUsuario = (): Carrito | null => {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : null;
};

// Actualizar un carrito existente
export const actualizarCarrito = async (id: string, datos: Partial<Carrito>) => {
    try {
        return await pb.collection('Carrito').update(id, datos, {
            $autoCancel: false
        });
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        throw error;
    }
};

// Crear un nuevo carrito
export const crearCarrito = async (datos: Partial<Carrito>) => {
    try {
        // Primero intentamos obtener el carrito existente del usuario
        const carritoExistente = await pb.collection('Carrito').getFirstListItem(
            `usuario = "${datos.usuario}"`,
            { $autoCancel: false }
        ).catch(() => null);

        if (carritoExistente) {
            // Si existe, actualizamos
            return await pb.collection('Carrito').update(
                carritoExistente.id,
                datos,
                { $autoCancel: false }
            );
        } else {
            // Si no existe, creamos uno nuevo
            return await pb.collection('Carrito').create(datos, {
                $autoCancel: false
            });
        }
    } catch (error) {
        console.error('Error al crear/actualizar carrito:', error);
        throw error;
    }
};

// Eliminar un carrito
export const eliminarCarrito = async (id: string) => {
    try {
        return await pb.collection('Carrito').delete(id, {
            $autoCancel: false
        });
    } catch (error) {
        console.error('Error al eliminar carrito:', error);
        throw error;
    }
};