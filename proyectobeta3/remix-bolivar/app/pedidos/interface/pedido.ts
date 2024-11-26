export interface Pedido {
    id?: string;
    collectionId?: string;
    usuario: string;
    fecha: string;
    estado: 'pendiente' | 'pagado' | 'enviado' | 'entregado';
    total: number;
    productos: string[];
    direccion_envio: string;

}