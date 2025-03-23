import { Request, Response } from "express";
import Producto from '../models/productoModel';
import HistorialExhibe from "../models/historialExhibe";

export const obtenerProductos  = async (req: Request, res:Response):Promise<void> => {
  try {
    const productos = await Producto.find();
    res.status(200).json(productos)
  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por nombre- vendedor/
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

/obtiene producto por codigo de barras- vendedor/
export const obtenerProductoPorCodigo = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;

  try {
    const producto = await Producto.findOne({ codigo_barras});
    if(producto){
      res.status(200).json(producto);
    }else{
      res.status(404).json({ message: 'El producto no existe'});
    }
  } catch (error : any) {
    res.status(500).json({ message: error.message});
  }
}

/obtiene producto por marca- vendedor/
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

/obtiene producto por tamaño- vendedor/
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

/obtiene producto por pasillo- vendedor/
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

/obtiene producto por precio entre un rango- vendedor/
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

/exhibe/
export const actualizarExhibe = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;
  const { cantidadIn } = req.body;

  try {
    const producto = await Producto.findOne({ codigo_barras });

    if (!producto){
      res.status(404).json({
        message: 'Producto no encontrado'
      });
      return;
    }
    
    var cantAlamcen = producto.existencia_almacen;
    var cantAct = cantAlamcen - cantidadIn;
    
    // Update exhibition inventory
    producto.existencia_exhibe = producto.existencia_exhibe + cantidadIn;
    
    // Update warehouse inventory
    producto.existencia_almacen = cantAct;

    // Create history record
    const agregacionExhibe = new HistorialExhibe({
      codigo_barras: producto.codigo_barras,
      nombre_producto: producto.nombre_producto,
      cantidad: cantidadIn,
      fecha_relleno: new Date()
    });

    // Save both changes
    await Promise.all([
      producto.save(),
      agregacionExhibe.save()
    ]);

    res.status(200).json({
      message: 'Exhibe fue actualizado',
      producto_actualizado: producto
    });
  } catch (error:any) {
    res.status(500).json({
      message: error.message
    });
  }
};

