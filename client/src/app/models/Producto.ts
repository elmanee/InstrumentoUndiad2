export interface Producto {
  codigo_barras: string;
  nombre_producto: string;

  descripcion?: string;
  precio_caja: number;
  existencia_almacen: number;
  existencia_exhibe: number;
  stock_exhibe: number;
  cantidad_rellenar: number;
  estatus: string;
  categoria?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}
