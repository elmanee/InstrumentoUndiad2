import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';

export interface Producto {
  nombre_producto: string;
  descripcion: string;
  marca: string;
  tamanio: string;
  precio_pieza: number;
  precio_kg: number;
  cantidad: number;
  categoria: string;
  imagen: string;
  codigo_barras: string;
  estatus: string;
  pasillo?: string;
  existencia_exhibe?: number;
  precio_caja?: number;
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

  obtenerProductosPorTamanio(tamanio: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/tamanio/${tamanio}`);
  }

  obtenerProductosPorPrecio(min: number, max: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/precio/${min}-${max}`);
  }

  obtenerProductosPorMarca(marca: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/marca/${marca}`);
  }

  getProductByPasillos(pasillo: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.APIURL}/obtener_productos/cliente/pasillo/${pasillo}`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener productos por pasillo', error);
          return throwError(() => error);
        })
      );
  }



}
