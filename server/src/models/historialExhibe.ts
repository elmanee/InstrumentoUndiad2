import mongoose, { Document, Schema} from "mongoose"

interface IHistorialExhibe extends Document{
  codigo_barras: number,
  nombre_producto: string,
  cantidad: number,
  fecha_relleno: Date
}

const HitorialExhibeSchema: Schema = new Schema({
  codigo_barras: { type: Number, required: true },
  nombre_producto: { type: String, required: true },
  cantidad: { type: Number, required: true },
  fecha_relleno: { type: Date, required: true }
})

export default mongoose.model<IHistorialExhibe>('HistorrialExhibe', HitorialExhibeSchema)