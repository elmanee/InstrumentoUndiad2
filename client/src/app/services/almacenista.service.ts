// Corrige AlmacenistaService.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz actualizada para definir la estructura de un Producto
export interface Producto {
  codigo_barras: string;
  nombre_producto: string;
  marca: string;
  tamanio: string;
  categoria: string;
  proveedores?: string[];
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
  private APIURL = 'http://localhost:3000/api';

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
    return this.http.get<Producto>(`${this.APIURL}/obtener_producto/codigo/${codigo_barras}`);
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
  actualizarProducto(codigo_barras: string, producto: Partial<Producto>): Observable<any> {
    return this.http.patch(`${this.APIURL}/actualizar_producto/${codigo_barras}`, producto);
  }

  // Método para eliminar un producto
  eliminarProducto(codigo_barras: string): Observable<any> {
    return this.http.delete(`${this.APIURL}/eliminar_producto/${codigo_barras}`);
  }

  // Método para actualizar existencias
  actualizarExistencias(codigo_barras: string, existencias: {
    existencia_almacen?: number,
    stock_almacen?: number,
    existencia_exhibicion?: number,
    stock_exhibicion?: number
  }): Observable<any> {
    return this.http.patch(`${this.APIURL}/actualizar_existencia/${codigo_barras}`, existencias);
  }

  // Método para cambiar el estatus de un producto
  cambiarEstatus(codigo_barras: string, estatus: boolean): Observable<any> {
    return this.http.patch(`${this.APIURL}/actualizar_estatus/${codigo_barras}`, { estatus });
  }
}
