import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map, tap } from 'rxjs/operators';
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
    // Verificar que la URL sea correcta
    return this.http.get<Producto[]>(`${this.apiUrl}/obtener_producto/marca/${marca}`)
      .pipe(
        // Añadir console.log para depuración
        tap(response => console.log('Respuesta de búsqueda por marca:', response)),
        catchError(error => {
          console.error('Error en búsqueda por marca:', error);
          if (error.status === 404) {
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  obtenerProductosPorTamanio(tamanio: string): Observable<Producto[]> {
    return this.http.get<any>(`${this.apiUrl}/obtener_producto/tamanio/${tamanio}`)
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of([]);
          }
          return this.handleError(error);
        }),
        // Manejar la estructura de respuesta específica para tamaños
        map(response => {
          if (response && 'tamanios' in response) {
            return response.tamanios;
          }
          return response;
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
