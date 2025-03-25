import { Request, Response } from "express";
import Producto from '../models/productoModel';
import HistorialPrecios from "../models/historialPreciosModel";
import LoteCompra from "../models/loteCompraModel";

/creacion del producto almacenista/
export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  const { 
    imagen, 
    codigo_barras, 
    nombre_producto, 
    marca, 
    nombre_proveedor, 
    tamanio, 
    categoria,
    precio_pieza, 
    precio_caja, 
    cantidad_caja, 
    pasillo,  
    existencia_almacen, 
    existencia_exhibe ,
    stock_almacen,
    stock_exhibe
  } = req.body;

  try {
    const existeProducto = await Producto.findOne({ codigo_barras });;
    if(existeProducto){
      res.status(400).json({ message: 'EL producto ya existe'});
      return;
    }

    const nuevoProducto = new Producto({ 
      imagen,
      codigo_barras,
      nombre_producto,
      marca,
      nombre_proveedor: Array.isArray(nombre_proveedor) ? nombre_proveedor : [nombre_proveedor], 
      tamanio,
      categoria,
      precio_pieza,
      precio_caja,
      cantidad_caja,
      pasillo,
      estatus: "activo",
      existencia_almacen,
      existencia_exhibe,
      stock_almacen,
      stock_exhibe,
    });

    const guardarProducto = await nuevoProducto.save();
    res.status(201).json('Producto guardado con exito');
  } catch (error: any) {
    res.status(400).json({ message: error.message }); 
  }
};

/obtiene todos los productos almacenista/
export const obtenerProductos  = async (req: Request, res:Response):Promise<void> => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos)
  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por codigo de barras almacenista/
export const obtenerProductoPorCodigo = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;

  try {
    const producto = await Producto.findOne({ codigo_barras });
    
    if(producto){
      res.status(200).json(producto);
    } else {
      res.status(404).json({ message: 'El producto no existe'});
    }
  } catch (error : any) {
    res.status(500).json({ message: error.message});
  }
}

/obtiene producto por nombre almacenista/
export const obtenerProductosNombre = async (req: Request, res: Response): Promise<void> => {
  const { nombre_producto } = req.params;

  try {
    const productos = await Producto.find(
      { nombre_producto: { $regex: new RegExp(nombre_producto,'i')}}
    );
    if(productos.length === 0){
      res.status(404).json({ message: `No existe productos con el nombre ${nombre_producto}`})
      return
    }
      
    res.status(200).json(productos);

  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por categoria/
export const obtenerProductosCategoria = async (req: Request, res: Response): Promise<void> => {
  const { categoria } = req.params;

  try {
    const productos = await Producto.find(
      { categoria: { $regex: new RegExp(categoria,'i')}}
    );

    if ( productos.length === 0 ){
      res.status(404).json({ message: `No hay productos de esta categoria ${categoria}`});
      return
    }
    
    res.status(200).json(productos);

  } catch (error: any) {
    res.status(500).json({ message: error.message});
  }
}

/obtiene producto por pasillo- almacenista/
export const obtenerProductosPasillo = async (req: Request, res:Response): Promise<void> => {
  const { pasillo } = req.params;

  try {
    const pasillos = await Producto.find(
      { pasillo: {$regex: new RegExp(pasillo,'i')}}
    );

    if( pasillos.length === 0){
      res.status(404).json({ message: `No existe el pasillo ${pasillo}`})
      return
    }

    res.status(200).json(pasillos);
    
  } catch (error:any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por marca- almacenista/
export const obtenerProductosMarca = async (req: Request, res:Response): Promise<void> => {
  const { marca } = req.params;

  try {
    const marcas = await Producto.find(
      { marca: {$regex: new RegExp(marca,'i')}}
    );

    if( marcas.length === 0){
      res.status(404).json({ message: `No existe la marca ${marca}`})
      return
    }

    res.status(200).json(marcas);
    
  } catch (error:any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por tamaño- almacenista/
export const obtenerProductosTamanio = async (req: Request, res: Response):Promise<void> => {
  const { tamanio } = req.params;

  try {
    const tamanios = await Producto.find(
      {tamanio: {$regex: new RegExp(tamanio,'i')}}
    );

    if(tamanios.length === 0){
      res.status(404).json({ message: `No existen productos con este tamaño ${tamanio}`})
    }

    res.status(200).json({tamanios})
  } catch (error:any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por precio entre un rango/
export const obtenerProductosPrecio = async (req: Request, res: Response): Promise<void> => {
  const { rango } = req.params; 

  try {
    if (!rango.includes('-')) {
      res.status(400).json({ message: 'Formato de rango invalido. Use 0-250, 250-650, etc.' });
      return;
    }

    const [minStr, maxStr] = rango.split('-');
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (isNaN(min) || isNaN(max)) {
      res.status(400).json({ message: 'Los valores del rango deben ser numeros' });
      return;
    }

    const productos = await Producto.find({
      precio_pieza: { $gte: min, $lte: max }
    });

    if (productos.length === 0) {
      res.status(404).json({ message: `No hay productos entre $${min} y $${max}` });
      return;
    }

    res.status(200).json(productos);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/*
para probar actualizacion
{
  "nuevo_precio": 5410.45
}
*/

/actualizar precio de un producto- - almacenista/
export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;
  const { nuevo_precio } = req.body;

  try {
    if (!codigo_barras || !nuevo_precio) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    if (isNaN(Number(nuevo_precio))) {
      res.status(400).json({ message: 'El precio debe ser un número válido' });
      return;
    }

    const producto = await Producto.findOne({ codigo_barras });
    
    if (!producto) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    if (producto.precio_pieza === nuevo_precio) {
      res.status(200).json({ message: 'El precio es el mismo, no se realizaron cambios' });
      return;
    }

    const registroHistorico = new HistorialPrecios({
      codigo_barras: producto.codigo_barras,
      nombre_producto: producto.nombre_producto,
      marca: producto.marca,
      tamanio: producto.tamanio,
      precio_anterior: producto.precio_pieza,
      precio_nuevo: nuevo_precio,
      fecha: new Date()
    });

    producto.precio_pieza = nuevo_precio;
    
    await Promise.all([
      producto.save(),
      registroHistorico.save()
    ]);

    res.status(200).json({ 
      message: 'Precio actualizado e historial guardado',
      producto_actualizado: producto
    });

  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error al actualizar el precio'
    });
  }
};

/Elimar productos- almacenista/
export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;

  try {
    const resultado = await Producto.deleteOne({ codigo_barras });

    if (resultado.deletedCount === 0) {
      res.status(404).json({ message: 'El producto no existe' });
      return;
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error:any) {
    res.status(500).json({
      message: error.message
    })
  }
}

/Cambiar estatus de producto- almacenista/
export const cambiarEstatus = async (req: Request, res : Response): Promise<void> => {
  const { codigo_barras } = req.params;
  const { status } = req.body;

  try {
    const producto = await Producto.findOne({ codigo_barras });

    if (!producto){
      res.status(404).json({
        message: 'Producto no encontrado'
      })
      return;
    }

    producto.estatus = status;

    await producto.save();

    res.status(200).json({
      message: 'Estatus fue actualizado',
      producto_actualizado: producto
    })
  } catch (error:any) {
    res.status(500).json({
      message: error.message
    })
  }
}

/Actualizar existencias- almacenista/
export const actualizarExistencias = async (req: Request, res:Response):Promise<void> => {
  const { codigo_barras } = req.params;
  const { valAlmacen, fecha_caducidad } = req.body;

  try {
    if (isNaN(Number(valAlmacen))){
      res.status(400).json({
        message: 'El valor debe ser un numero valido'
      });
      return;
    }

    const producto = await Producto.findOne({ codigo_barras});

    if (!producto){
      res.status(404).json({
        message: 'Producto no encontrado'
      });
      return;
    }

    // Buscar el último lote para obtener el último número
    const ultimoLote = await LoteCompra.findOne().sort({ numero_lote: -1 }).limit(1);

    var numLote = 4555;

    if (ultimoLote && ultimoLote.numero_lote) {
      numLote = ultimoLote.numero_lote + 1;
    }
    

    const rellenoAlmacen = new LoteCompra({
      codigo_barras: producto.codigo_barras,
      numero_lote: numLote,
      nombre_producto: producto.nombre_producto,
      cantidad_cajas: valAlmacen,
      fecha_compra: new Date(),
      fecha_caducidad: fecha_caducidad
    })

    producto.existencia_almacen += valAlmacen;

    await Promise.all([
      producto.save(),
      rellenoAlmacen.save()
    ])

    res.status(200).json({
      message: 'Existencia actualizadas',
      producto_actualizado: producto
    })

  } catch (error:any) {
    res.status(500).json({
      message: error.message
    });
  }
  
}

