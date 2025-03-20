import { Router } from "express";
import {
  obtenerProductosNombre,
  obtenerProductoPorCodigo,
  obtenerProductosMarca,
  obtenerProductosTamanio,
  obtenerProductosPasillo,
  obtenerProductosPrecio,
  actualizarExhibe,
  obtenerProductos
} from '../controllers/vendedorControllers'

const router = Router();

router.get('/obtener_productos', obtenerProductos);
router.get('/obtener_producto/nombre/:nombre_producto',obtenerProductosNombre);
router.get('/obtener_producto/codigo/:codigo_barras', obtenerProductoPorCodigo)
router.get('/obtener_producto/marca/:marca', obtenerProductosMarca);
router.get('/obtener_producto/tamanio/:tamanio', obtenerProductosTamanio);
router.get('/obtener_producto/pasillo/:pasillo', obtenerProductosPasillo);
router.get('/obtener_producto/precio/:rango', obtenerProductosPrecio);
router.patch('/actualizar_exhibe/:codigo_barras', actualizarExhibe)


export default router;