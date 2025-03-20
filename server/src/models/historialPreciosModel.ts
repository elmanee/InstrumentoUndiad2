import mongoose, { Document, Schema } from 'mongoose';

interface IHistorialPrecios extends Document {
  codigo_barras: number;
  nombre_producto: string;
  marca: string;
  tamanio: string;
  precio_anterior: number;
  precio_nuevo: number;
  fecha: Date;
}

const HistorialPreciosSchema: Schema = new Schema({
  codigo_barras: { type:Number, required: true},
  nombre_producto: { type: String, required: true },
  marca: { type: String, required: true },
  tamanio: { type: String, required: true },
  precio_anterior: { type: Number, required: true },
  precio_nuevo: { type: Number, required: true },
  fecha: { type: Date, required: true },
});

export default mongoose.model<IHistorialPrecios>('HistorialPrecios', HistorialPreciosSchema);