import mongoose, { Document, Schema } from 'mongoose';

interface IProducto extends Document {
  imagen: string; 
  codigo_barras: number;
  nombre_producto: string;
  marca: string;
  nombre_proveedor: string[];
  tamanio: string;
  categoria: string;
  precio_pieza: number;
  precio_caja: number;
  cantidad_caja: number;
  pasillo: string;
  estatus: string;
  existencia_almacen: number;
  existencia_exhibe: number;
  stock_almacen: number;
  stock_exhibe: number;
}

const ProductoSchema: Schema = new Schema({
  imagen: { type: String, required: true }, 
  codigo_barras: { type: Number, required: true },
  nombre_producto: { type: String, required: true },
  marca: { type: String, required: true },
  nombre_proveedor: { type: [String], required: true },
  tamanio: { type: String, required: true },
  categoria: { type: String, required: true},
  precio_pieza: { type: Number, required: true },
  precio_caja: { type: Number, required: true },
  cantidad_caja: { type: Number, required: true },
  pasillo: { type: String, required: true },
  estatus: { type: String, required: true},
  existencia_almacen: { type: Number, required: true },
  existencia_exhibe: { type: Number, required: true },
  stock_almacen: { type: Number, required: true },
  stock_exhibe: { type: Number, required: true },
});

export default mongoose.model<IProducto>('Producto', ProductoSchema);