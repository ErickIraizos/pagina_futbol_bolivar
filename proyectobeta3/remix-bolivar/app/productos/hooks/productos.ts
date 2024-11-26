import { getTodosLosProductos } from "../services/productos";

export const cargarProductos = async () => {
  const productos = await getTodosLosProductos();
  return productos;
};