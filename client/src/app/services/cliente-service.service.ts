import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Producto {
  nombre_producto: string;
  descripcion: string;
  marca: string;
  tamanio: string;
  precio_pieza: number;
  precio_kg: number;
  cantidad: number;
  imagen: string;
  codigo_barras: string;
  estatus: string;
  // Nuevas propiedades
  pasillo?: string;           // Opcional con ?
  existencia_exhibe?: number; // Opcional con ?
  precio_caja?: number;       // Opcional con ?
}

export interface ProductoResponse {
  message: string;
  lista: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private APIURL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  obtenerProductosActivos(): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente`);
  }

  obtenerProductosPorNombre(nombre: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/nombre/${nombre}`);
  }

  // Corregir la URL y la estructura de respuesta
  obtenerProductosPorTamanio(tamanio: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/tamanio/${tamanio}`);
  }

  obtenerProductosPorPrecio(min: number, max: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/precio/${min}-${max}`);
  }

  obtenerProductosPorMarca(marca: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/marca/${marca}`);
  }

  getProductByCodigo(codifo_barras: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/marca/${codifo_barras}`);
  }

}
