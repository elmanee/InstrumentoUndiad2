import { Router } from "express";
import { 
  crearProducto, 
  obtenerProductos, 
  obtenerProductoPorCodigo, 
  obtenerProductosCategoria,
  obtenerProductosNombre,
  obtenerProductosPasillo,
  obtenerProductosMarca,
  obtenerProductosTamanio,
  obtenerProductosPrecio,
  actualizarProducto,
  eliminarProducto,
  actualizarExistencias,
  cambiarEstatus
} from "../controllers/almacenistaControllers";

const router = Router();

router.post('/crear_productos', crearProducto);
router.get('/obtener_productos', obtenerProductos);
router.get('/obtener_producto/codigo/:codigo_barras', obtenerProductoPorCodigo);
router.get('/obtener_producto/categoria/:categoria', obtenerProductosCategoria);
router.get('/obtener_producto/nombre/:nombre_producto', obtenerProductosNombre);
router.get('/obtener_producto/pasillo/:pasillo', obtenerProductosPasillo);
router.get('/obtener_producto/marca/:marca', obtenerProductosMarca);
router.get('/obtener_producto/tamanio/:tamanio', obtenerProductosTamanio);
router.get('/obtener_producto/precio/:rango', obtenerProductosPrecio);
router.patch('/actualizar_producto/:codigo_barras', actualizarProducto);
router.delete('/eliminar_producto/:codigo_barras', eliminarProducto)
router.patch('/actualizar_existencia/:codigo_barras', actualizarExistencias);
router.patch('/actualizar_estatus/:codigo_barras', cambiarEstatus);


export default router;