import { Router } from 'express';
import { 
  obtenerProductosActivos ,
  obtenerProductosNombre,
  obtenerProductosTamanio,
  obtenerProductosPrecio,
  obtenerProductosMarca
} from '../controllers/clienteControllers';
const router = Router();

router.get('/obtener_productos/cliente', obtenerProductosActivos);
router.get('/obtener_productos/cliente/nombre/:nombre_producto', obtenerProductosNombre);
router.get('/obtener_productos/cliente/tama/:tamanio', obtenerProductosTamanio);
router.get('/obtener_productos/cliente/precio/:rango', obtenerProductosPrecio);
router.get('/obtener_productos/cliente/marca/:marca', obtenerProductosMarca);



export default router;