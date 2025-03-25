import { Request, Response } from "express";
import Producto from '../models/productoModel'

/obtiene todos los productos activos- cliente/
export const obtenerProductosActivos  = async (req: Request, res:Response):Promise<void> => {
  try {
    const productos = await Producto.find(
      {estatus: "activo"}
    );

    if(productos.length === 0){
      res.status(404).json({
        message: 'No hay produtos'
      })
      return
    }
    
    res.status(200).json({
      message: 'Lista de productos',
      lista: productos
    })


  } catch (error: any) {
    res.status(500).json({ message: error.message})
  }
}

/obtiene producto por nombre- cliente/
export const obtenerProductosNombre = async (req: Request, res: Response): Promise<void> => {
  const { nombre_producto } = req.params;

  try {
    const productos = await Producto.find({
      nombre_producto: { $regex: new RegExp(nombre_producto, 'i') },
      estatus: "activo"
    });

    if (productos.length === 0) {
      res.status(200).json({
        message: `No se encontraron productos con el nombre ${nombre_producto}`
      });
      return;
    }

    res.status(200).json({
      message: 'Productos encontrados',
      lista: productos
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/obtiene producto por tamaño- cliente MEJORARRRRR/
export const obtenerProductosTamanio = async (req: Request, res: Response): Promise<void> => {
  const { tamanio } = req.params;
  try {
    const productos = await Producto.find({
      tamanio: { $regex: new RegExp(tamanio, 'i') },
      estatus: "activo"
    });
    if (productos.length === 0) {
      res.status(404).json({ message: `No existen productos con este tamaño ${tamanio}` });
      return;
    }
    // Devolver con la estructura esperada
    res.status(200).json({ lista: productos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

/obtiene producto por precio entre un rango- cliente/
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
      precio_pieza: { $gte: min, $lte: max },
      estatus: "activo"
    });

    if (productos.length === 0) {
      res.status(404).json({ message: `No hay productos entre $${min} y $${max}` });
      return;
    }

    res.status(200).json({
      message: 'Productos encontrados',
      lista: productos
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/obtiene producto por marca- cliente/
export const obtenerProductosMarca = async (req: Request, res:Response): Promise<void> => {
  const { marca } = req.params;

  try {
    const marcas = await Producto.find({ 
      marca: {$regex: new RegExp(marca,'i')},
      estatus: "activo"
    });

    if( marcas.length === 0){
      res.status(404).json({ message: `No existe la marca ${marca}`})
      return
    }

    res.status(200).json({
      message: 'Marcas encontradss',
      lista: marcas
    });
    
  } catch (error:any) {
    res.status(500).json({ message: error.message})
  }
}

export const getProductsByCodigo = async (req: Request, res: Response): Promise<void> => {
  const { codigo_barras } = req.params;
  
    try {
      const producto = await Producto.find({ 
        codigo_barras: {$regex: new RegExp(codigo_barras, 'i')},
        estatus: "activo"
      });

      if(producto.length === 0){
        res.status(404).json({ message: `No existe la prodcutos con ${codigo_barras}`})
        return
      }

      res.status(200).json({
        message: 'Prodcutos encontradss',
        lista: producto
      });

    } catch (error : any) {
      res.status(500).json({ message: error.message});
    }
}