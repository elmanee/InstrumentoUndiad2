import mongoose from 'mongoose';
import keys from './keys';

export const connectToDatabase = async () => {
  if (!keys.mongoURI) {
    console.error('Revisar variables de entorno');
    process.exit(1);
  }

  try {
    await mongoose.connect(keys.mongoURI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};