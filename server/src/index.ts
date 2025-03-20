import express, { Application } from 'express';
import { connectToDatabase } from './database';
import clienteRoutes from './routes/clienteRoutes';
import almacenistaRoutes from './routes/almacenistaRoutes';
import vendedorRoutes from './routes/vendedorRoutes';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes'
import * as path from 'path';
class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  config(): void {
    this.app.set('port', process.env.PORT || 3000);
    this.app.use(cors({
      origin: 'http://localhost:4200', // Solo permite solicitudes desde Angular
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATH'],
      allowedHeaders: ['Content-Type', 'Authorization']
  }));
    this.app.use(express.json()); 
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 
    //console.log('Ruta de uploads:', path.join(__dirname, '../uploads'));
    //this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  routes(): void {
    this.app.use('/api', clienteRoutes);
    this.app.use('/api', almacenistaRoutes);
    this.app.use('/api', vendedorRoutes);
    this.app.use('/api', uploadRoutes);
  }

  async start(): Promise<void> {
    try {
      await connectToDatabase(); 
      this.app.listen(this.app.get('port'), () => {
        console.log(`Server on port ${this.app.get('port')}`);
      });
    } catch (error) {
      console.error('Error al iniciar el servidor:', error);
    }
  }
}

const server = new Server();
server.start();