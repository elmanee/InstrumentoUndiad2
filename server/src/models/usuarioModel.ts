import mongoose, { Document, Schema } from 'mongoose';

interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
}

const UsuarioSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);