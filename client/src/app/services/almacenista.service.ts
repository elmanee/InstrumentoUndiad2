// Corrige AlmacenistaService.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, tap  } from 'rxjs';
import { catchError } from 'rxjs/operators';


// Interfaz actualizada para definir la estructura de un Producto
export interface Producto {
  codigo_barras: string;
  nombre_producto: string;
  marca: string;
  tamanio: string;
  categoria: string;
  estatus?: string;
  nombre_proveedor: string[],
  precio_pieza?: number;
  precio_caja?: number;
  cantidad_caja?: number;
  pasillo?: number;  // Cambiado de 'posillo' a 'pasillo'
  existencia_almacen?: number;
  stock_almacen?: number;
  existencia_exhibe?: number;  // Cambiado de 'existencia_exhibicion' a 'existencia_exhibe'
  stock_exhibe?: number;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlmacenistaService {
  // URL base de la API con el prefijo /api
  private APIURL = 'http://localhost:3000/api'; // Ensure this matches your backend URL

  constructor(private http: HttpClient) { }

  // Método para crear un nuevo producto
  crearProducto(producto: Producto): Observable<any> {
    return this.http.post(`${this.APIURL}/crear_productos`, producto);
  }

  // Métodos actualizados con el prefijo /api incluido en la URL base
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_productos`);
  }

  // Método para obtener un producto por código de barras
  obtenerProductoPorCodigo(codigo_barras: string): Observable<Producto> {
    console.log(`Buscando producto con código: ${codigo_barras}`);
    return this.http.get<Producto>(`${this.APIURL}/obtener_producto/codigo/${codigo_barras}`)
      .pipe(
        tap(response => console.log('Respuesta:', response)),
        catchError(error => {
          console.error('Error al obtener producto:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para obtener productos por categoría
  obtenerProductosCategoria(categoria: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/categoria/${categoria}`);
  }

  // Método para obtener productos por nombre
  obtenerProductosNombre(nombre_producto: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/nombre/${nombre_producto}`);
  }

  // Método para obtener productos por pasillo
  obtenerProductosPasillo(pasillo: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/pasillo/${pasillo}`);
  }

  // Método para obtener productos por marca
  obtenerProductosMarca(marca: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/marca/${marca}`);
  }

  // Método para obtener productos por tamaño
  obtenerProductosTamanio(tamanio: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/tamanio/${tamanio}`);
  }

  // Método para obtener productos por rango de precio
  obtenerProductosPrecio(rango: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/obtener_producto/precio/${rango}`);
  }

  // Método para actualizar un producto


  // Método para eliminar un producto
  eliminarProducto(codigo_barras: string): Observable<any> {
    return this.http.delete(`${this.APIURL}/eliminar_producto/${codigo_barras}`);
  }

  // Método para actualizar existencias
  actualizarExistencias(codigoBarras: string, relleno: number, fechaCaducidad: Date): Observable<any> {
    console.log('Enviando actualización de existencias:', { valAlmacen: relleno, fecha_caducidad: fechaCaducidad });

    return this.http.patch(`${this.APIURL}/actualizar_existencia/${codigoBarras}`, {
      valAlmacen: relleno,
      fecha_caducidad: fechaCaducidad
    });
  }

  cambiarEstatus(codigoBarras: string, nuevoEstatus: string): Observable<any> {
    // Ensure this URL matches exactly what your API expects
    const url = `${this.APIURL}/actualizar_estatus/${codigoBarras}`;
    return this.http.patch(url, { status: nuevoEstatus });
}

actualizarProducto(codigoBarras: string, datos: any): Observable<any> {
  return this.http.patch(`${this.APIURL}/actualizar_producto/${codigoBarras}`, datos);
}
}
