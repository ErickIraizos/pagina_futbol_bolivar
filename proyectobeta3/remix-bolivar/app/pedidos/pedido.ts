import PocketBase from 'pocketbase';
import type { Pedido } from './interface/pedido';
const pb = new PocketBase('http://127.0.0.1:8090');

export async function createPedido(pedido: Pedido) {
    try {
        const record = await pb.collection('Pedidos').create(pedido, {
            $autoCancel: false
        });
        return record;
    } catch (error) {
        console.error('Error creating pedido:', error);
        throw error;
    }
}

export async function updatePedido(id: string, pedido: Partial<Pedido>) {
    try {
        const record = await pb.collection('Pedidos').update(id, pedido, {
            $autoCancel: false
        });
        return record;
    } catch (error) {
        console.error('Error updating pedido:', error);
        throw error;
    }
}

export async function uploadComprobante(pedidoId: string, file: File) {
    try {
        const formData = new FormData();
        formData.append('comprobantePago', file);
        
        const record = await pb.collection('Pedidos').update(pedidoId, formData, {
            $autoCancel: false
        });
        return record;
    } catch (error) {
        console.error('Error uploading comprobante:', error);
        throw error;
    }
}