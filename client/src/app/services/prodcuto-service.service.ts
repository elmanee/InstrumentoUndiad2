import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { Producto } from '../models/Producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_productos`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  obtenerProductoPorCodigo(codigo: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/obtener_producto/codigo/${codigo}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerProductosPorNombre(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/nombre/${nombre}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerProductosPorMarca(marca: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/marca/${marca}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerProductosPorTamanio(tamanio: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/tamanio/${tamanio}`)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of([]);
          }
          return this.handleError(error);
        }),
        // Handle the nested 'tamanios' object in the response
        map(response => {
          if (response && 'tamanios' in response) {
            return response.tamanios as Producto[];
          }
          return response as Producto[];
        })
      );
  }

  obtenerProductosPorPasillo(pasillo: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/pasillo/${pasillo}`)
      .pipe(
        retry(1),
        catchError((error) => {
          if (error.status === 404) {
            console.warn(`No hay prodcutos en pasillo : ${pasillo}`);
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  obtenerProductosPorPrecio(precioMin: number, precioMax: number): Observable<Producto[]> {
    const rangoString = `${precioMin}-${precioMax}`;
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/precio/${rangoString}`)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            console.warn('No products found in price range, returning empty array');
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  actualizarProducto(producto: Producto): Observable<any> {
    const payload = {
      cantidadIn: producto.cantidad_rellenar
    };

    return this.http.patch<any>(
      `${this.apiUrl}/actualizar_exhibe/${producto.codigo_barras}`,
      payload
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión o que el servidor esté activo.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado. Verifique la URL o los parámetros de búsqueda.';
      } else {
        errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
