
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto';
import { environmentDos } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly APIURL = environmentDos.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.APIURL}/api/obtener_productos`);
  }

  obtenerProductoPorCodigo(codigoBarras: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.APIURL}/api/productos/${codigoBarras}`);
  }

  actualizarProducto(producto: Producto): Observable<Producto> {
    // Match the backend's expected parameter structure
    const updateData = {
      cantidadIn: producto.cantidad_rellenar || 0
    };

    return this.http.patch<Producto>(
      `${this.APIURL}/api/actualizar_exhibe/${producto.codigo_barras}`,
      updateData
    );
  }

  cambiarEstatus(codigoBarras: string, nuevoEstatus: boolean): Observable<any> {
    return this.http.patch(`${this.APIURL}/api/actualizar_estatus/${codigoBarras}`, { estatus: nuevoEstatus });
  }
}
