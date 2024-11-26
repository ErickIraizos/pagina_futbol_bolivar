export interface DetallePedido {
    id?: string;
    collectionId?: string;
    created?: string;
    updated?: string;
    pedido_id: string;
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    Qr?: File;

}
