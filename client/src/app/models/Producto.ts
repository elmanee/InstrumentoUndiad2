export interface Producto {
  codigo_barras: string;
  nombre_producto: string;
  imagen?: string;
  descripcion?: string;
  precio_caja: number;
  precio_pieza: number;
  marca: string;
  tamanio: number
  existencia_almacen: number;
  existencia_exhibe: number;
  stock_exhibe: number;
  cantidad_rellenar: number;
  pasillo: string;
  estatus: string;
  categoria?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}
