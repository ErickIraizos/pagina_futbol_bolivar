import PocketBase from 'pocketbase';
import type { DetallePedido } from './interface/destallePedido';
const pb = new PocketBase('http://127.0.0.1:8090');

export async function createDetallePedido(detalle: DetallePedido) {
    try {
        // Validar datos antes de crear el registro
        if (!detalle.pedido_id || !detalle.producto_id) {
            throw new Error('pedido_id y producto_id son requeridos');
        }

        // Crear el objeto de datos base
        const detalleData = {
            pedido_id: detalle.pedido_id, // Ya no lo convertimos a array
            producto_id: detalle.producto_id,
            cantidad: Number(detalle.cantidad),
            precio_unitario: Number(detalle.precio_unitario)
        };

        // Log para debug
        console.log('Intentando crear detalle con datos:', detalleData);

        // Si hay un archivo Qr, usar FormData
        if (detalle.Qr instanceof File) {
            const formData = new FormData();
            
            // Agregar todos los campos al FormData
            formData.append('pedido_id', detalleData.pedido_id);
            formData.append('producto_id', detalleData.producto_id);
            formData.append('cantidad', detalleData.cantidad.toString());
            formData.append('precio_unitario', detalleData.precio_unitario.toString());
            formData.append('Qr', detalle.Qr);

            return await pb.collection('DetallesPedido').create(formData);
        }

        // Si no hay archivo, enviar solo los datos
        return await pb.collection('DetallesPedido').create(detalleData);

    } catch (error) {
        console.error('Error creating detalle pedido:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            if ('response' in error) {
                const response = (error as any).response?.data;
                console.error('Server response:', response);
                // Mostrar mensaje más específico basado en la respuesta
                if (response?.pedido_id) {
                    throw new Error(`Error en pedido_id: ${JSON.stringify(response.pedido_id)}`);
                }
            }
        }
        throw error;
    }
}

// Función para subir el comprobante al pedido directamente
export async function subirComprobantePedido(pedidoId: string, file: File) {
    try {
        const formData = new FormData();
        formData.append('comprobante', file);

        const record = await pb.collection('Pedidos').update(pedidoId, formData, {
            $autoCancel: false,
            $cancelKey: `update-pedido-${Date.now()}`
        });
        return record;
    } catch (error) {
        console.error('Error al subir comprobante:', error);
        throw error;
    }
}