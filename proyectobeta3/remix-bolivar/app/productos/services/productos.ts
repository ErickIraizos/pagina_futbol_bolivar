import PocketBase from 'pocketbase';
import { Producto } from '../interface/produto';

export const POCKETBASE_URL = 'http://127.0.0.1:8090';
const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false); // Desactiva la cancelación automática

export function getImageUrl(collectionId: string, recordId: string, fileName: string): string {
    return `${POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}`;
}

export async function getListaProductos(page: number = 1, perPage: number = 50): Promise<Producto[]> {
    const result = await pb.collection('Productos').getList(page, perPage, {
        filter: 'created >= "2022-01-01 00:00:00"',
    });
   const productos = result.items.map(item => formatProducto(item));
   return productos;
}

export async function getTodosLosProductos(): Promise<Producto[]> {
    try {
        const productos = await pb.collection('Productos').getFullList({
            sort: '-created',
        });
        return productos.map(item => formatProducto(item));
    } catch (error) {
        console.error('Error fetching productos:', error);
        throw error;
    }
}

export async function getProductoPorEstado(estado: string = 'activo'): Promise<Producto> {
    const result = await pb.collection('Productos').getFirstListItem(`estado="${estado}"`);
    return formatProducto(result);
}

function formatProducto(item: Producto): Producto {
    return {
        id: item.id,
        collectionId: item.collectionId,
        nombre: item.nombre,
        marca: item.marca,
        precio: Number(item.precio),
        stock: Number(item.stock),
        imagen: item.imagen
    };
}